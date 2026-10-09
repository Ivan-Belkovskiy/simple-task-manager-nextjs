'use server';

import { prisma } from '@/lib/prisma';

export async function cleanupAiCache() {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await prisma.ai_generation_cache.deleteMany({
        where: { last_used_at: { lt: cutoff } },
    });

    return { deleted: result.count };
}