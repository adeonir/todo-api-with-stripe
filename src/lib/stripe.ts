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

export const handleWebhookCheckout = async (eventObj: Stripe.Checkout.Session) => {
  const clienteReferenceId = eventObj.client_reference_id
  const customerId = eventObj.customer as string
  const subscriptionId = eventObj.subscription as string
  const checkoutStatus = eventObj.status

  if (checkoutStatus !== 'complete') return

  if (!clienteReferenceId || !subscriptionId || !customerId) {
    throw new Error('Invalid checkout session')
  }

  const user = await prisma.user.findUnique({ where: { id: clienteReferenceId }, select: { id: true } })

  if (!user) {
    throw new Error('User not found')
  }

  await prisma.user.update({
    where: { id: clienteReferenceId },
    data: {
      customerId,
      subscriptionId,
    },
  })
}
