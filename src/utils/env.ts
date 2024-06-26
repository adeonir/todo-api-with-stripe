import { z } from 'zod'

export const envSchema = z.object({
  APP_URL: z.string().url(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_ENDPOINT_SECRET: z.string(),
  PRO_PLAN_PRICE_ID: z.string(),
})

export type EnvSchemaType = z.infer<typeof envSchema>

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  throw new Error(`Invalid environment variables.\n${JSON.stringify(parsed.error.format(), null, 2)}`)
}

export const env = parsed.data
