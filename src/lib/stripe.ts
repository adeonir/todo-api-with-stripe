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

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
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

    return { error: 'An error occurred while creating the checkout session' }
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

export const handleWebhookUpdate = async (eventObj: Stripe.Subscription) => {
  const subscriptionId = eventObj.id
  const customerId = eventObj.customer as string
  const subscriptionStatus = eventObj.status

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
