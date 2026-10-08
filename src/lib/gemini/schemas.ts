import * as z from 'zod';

export const GeneratedTaskSchema = z.object({
    subtasks: z
        .array(
            z.object({
                name: z.string().min(1).max(200),
                description: z.string().max(1000).optional(),
            })
        )
        .max(20),

    items: z
        .array(
            z.object({
                kind: z.enum(['ITEM', 'ACTION', 'REQUIREMENT']),
                name: z.string().min(1).max(200),
                description: z.string().max(500).optional(),
                quantity: z.string().max(50).optional(),
            })
        )
        .max(30),
});

export type GeneratedTask = z.infer<typeof GeneratedTaskSchema>;