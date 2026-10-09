'use server';

import { createHash } from 'crypto';
import { getCurrentUser } from '@/app/actions/users/session';
import { prisma } from '@/lib/prisma';
import { getNextApiKey, createClient, getKeysCount } from '@/lib/gemini/client';
import { GeneratedTaskSchema, type GeneratedTask } from '@/lib/gemini/schemas';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/gemini/prompts';

export interface GenerateResult {
    success: boolean;
    data?: GeneratedTask;
    error?: string;
    cached?: boolean; 
}

function hashKey(name: string, description: string): string {
    return createHash('sha256')
        .update(`${name.trim()}::${description.trim()}`)
        .digest('hex');
}

export async function generateTaskDetails(
    name: string,
    description: string
): Promise<GenerateResult> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Не авторизован' };

    if (!name.trim()) {
        return { success: false, error: 'Введите название задачи' };
    }

    const cacheKey = hashKey(name, description);

    try {
        const cached = await prisma.ai_generation_cache.findUnique({
            where: { cache_key: cacheKey },
        });

        if (cached) {
            prisma.ai_generation_cache
                .update({
                    where: { cache_key: cacheKey },
                    data: {
                        hit_count: { increment: 1 },
                        last_used_at: new Date(),
                    },
                })
                .catch(err => console.error('Ошибка обновления статистики кэша:', err));

            return {
                success: true,
                data: cached.payload as GeneratedTask,
                cached: true,
            };
        }
    } catch (error) {
        console.error('Ошибка чтения кэша:', error);
    }

    const attempts = getKeysCount();
    let lastError: string | undefined;

    for (let attempt = 0; attempt < attempts; attempt++) {
        const apiKey = getNextApiKey();
        const ai = createClient(apiKey);

        try {
            const response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite',
                contents: buildUserPrompt(name, description),
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'OBJECT',
                        properties: {
                            subtasks: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        name: { type: 'STRING' },
                                        description: { type: 'STRING' },
                                    },
                                    required: ['name'],
                                },
                            },
                            items: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        kind: {
                                            type: 'STRING',
                                            enum: ['ITEM', 'ACTION', 'REQUIREMENT'],
                                        },
                                        name: { type: 'STRING' },
                                        description: { type: 'STRING' },
                                        quantity: { type: 'STRING' },
                                    },
                                    required: ['kind', 'name'],
                                },
                            },
                        },
                        required: ['subtasks', 'items'],
                    },
                    temperature: 0.4,
                },
            });

            const raw = response.text;
            if (!raw) {
                lastError = 'Пустой ответ от модели';
                continue;
            }

            const parsed = GeneratedTaskSchema.safeParse(JSON.parse(raw));
            if (!parsed.success) {
                console.error('Gemini вернул невалидный JSON:', parsed.error);
                lastError = 'Некорректный ответ модели';
                continue;
            }

            try {
                await prisma.ai_generation_cache.upsert({
                    where: { cache_key: cacheKey },
                    create: {
                        cache_key: cacheKey,
                        payload: parsed.data,
                    },
                    update: {
                        payload: parsed.data,
                        last_used_at: new Date(),
                    },
                });
            } catch (error) {
                console.error('Ошибка записи в кэш:', error);
            }

            return { success: true, data: parsed.data, cached: false };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);

            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                lastError = 'Дневной лимит исчерпан';
                continue;
            }

            console.error('Ошибка Gemini:', error);
            lastError = 'Ошибка генерации';
        }
    }

    return { success: false, error: lastError ?? 'Не удалось сгенерировать' };
}