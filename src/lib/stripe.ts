import Stripe from 'stripe'

import { env } from '~/utils/env'

const config = {
  stripe: {
    publicApiKey: env.STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
  },
}

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
})
