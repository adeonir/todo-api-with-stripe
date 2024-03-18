import type { Request, Response } from 'express'
import type Stripe from 'stripe'

import { prisma } from '~/lib/prisma'
import { handleCheckoutSession, handleCheckoutWebhook, handleUpdateWebhook, stripe } from '~/lib/stripe'
import { env } from '~/utils/env'

export const createCheckout = async (request: Request, response: Response) => {
  const userId = request.headers['x-user-id'] as string

  if (!userId) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const checkout = await handleCheckoutSession(user)

  return response.send(checkout)
}

export const stripeWebhook = async (request: Request, response: Response) => {
  const signature = request.headers['stripe-signature'] as string

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(request.body as Buffer, signature, env.STRIPE_ENDPOINT_SECRET)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Webhook signature verification failed.`, error.message)

      response.status(400)
    }

    return
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutWebhook(event)
      break
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleUpdateWebhook(event)
      break
    default:
      console.warn(`Unhandled event type ${event.type}`)
  }

  response.send()
}
