import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
