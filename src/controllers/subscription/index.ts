import type { Request, Response } from 'express'

import { prisma } from '~/lib/prisma'
import { handleCheckoutSession } from '~/lib/stripe'

export const createCheckout = async (request: Request, response: Response) => {
  const userId = request.headers['x-user-id'] as string

  if (!userId) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const checkout = await handleCheckoutSession(userId)

  return response.status(200).send(checkout)
}
