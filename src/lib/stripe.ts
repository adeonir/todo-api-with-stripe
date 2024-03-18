import type { User } from '@prisma/client'
import Stripe from 'stripe'

import { env } from '~/utils/env'

import { prisma } from './prisma'

const config = {
  stripe: {
    publicApiKey: env.STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
  },
}

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
})

const getCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({ email })

  return customers.data.length > 0 ? customers.data[0] : null
}

export const createCustomer = async ({ name, email }: { name: string; email: string }) => {
  const customer = await getCustomerByEmail(email)

  if (customer) return customer

  return await stripe.customers.create({ name, email })
}

export const handleCheckoutSession = async (user: User) => {
  try {
    const customer = await createCustomer({ name: user.name, email: user.email })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      success_url: `${env.APP_URL}/success`,
      cancel_url: `${env.APP_URL}/cancel`,
      client_reference_id: user.id,
      customer: customer.id,
      line_items: [
        {
          price: env.PRO_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
    })

    return { customerId: customer.id, url: session.url }
  } catch (error) {
    throw new Error('An error occurred while creating the checkout session')
  }
}

export const handleCheckoutWebhook = async (event: { data: { object: Stripe.Checkout.Session } }) => {
  const clienteReferenceId = event.data.object.client_reference_id
  const customerId = event.data.object.customer as string
  const subscriptionId = event.data.object.subscription as string
  const checkoutStatus = event.data.object.status

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

export const handleUpdateWebhook = async (event: { data: { object: Stripe.Subscription } }) => {
  const subscriptionId = event.data.object.id
  const customerId = event.data.object.customer as string
  const subscriptionStatus = event.data.object.status

  const user = await prisma.user.findFirst({ where: { customerId }, select: { id: true } })

  if (!user) {
    throw new Error('User not found')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      customerId,
      subscriptionId,
      subscriptionStatus,
    },
  })
}
