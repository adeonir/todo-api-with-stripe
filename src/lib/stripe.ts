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

export const handleCheckoutSession = async (userId: string) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      success_url: `${env.APP_URL}/success`,
      cancel_url: `${env.APP_URL}/cancel`,
      client_reference_id: userId,
      line_items: [
        {
          price: env.PRO_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating checkout session', error)
  }
}
