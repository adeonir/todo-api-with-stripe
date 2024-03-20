import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  done: z.boolean().optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
