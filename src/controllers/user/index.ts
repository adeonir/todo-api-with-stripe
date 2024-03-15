import type { Request, Response } from 'express'
import { prisma } from "~/lib/prisma"

export const listUsers = async (request: Request, response: Response) => {
  const users = await prisma.user.findMany()

  response.send(users)
}

export const findUserById = async (request: Request, response: Response) => {
  const { id } = request.params
  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    return response.status(404).send({ error: 'User not found' })
  }

  response.send(user)
}
