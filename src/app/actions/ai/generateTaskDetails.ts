'use server';

import { getCurrentUser } from '@/app/actions/users/session';
import { getNextApiKey, createClient, getKeysCount } from '@/lib/gemini/client';
import { GeneratedTaskSchema, type GeneratedTask } from '@/lib/gemini/schemas';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/gemini/prompts';

export interface GenerateResult {
    success: boolean;
    data?: GeneratedTask;
    error?: string;
}

const cache = new Map<string, GeneratedTask>();

export async function generateTaskDetails(
    name: string,
    description: string
): Promise<GenerateResult> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Не авторизован' };

    if (!name.trim()) {
        return { success: false, error: 'Введите название задачи' };
    }

    const cacheKey = `${name.trim()}::${description.trim()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
        return { success: true, data: cached };
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

            cache.set(cacheKey, parsed.data);
            return { success: true, data: parsed.data };
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