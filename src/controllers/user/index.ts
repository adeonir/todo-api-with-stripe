import type { Request, Response } from 'express'
import { z } from 'zod'

import { prisma } from '~/lib/prisma'

import type { CreateUserInput } from './types'
import { createUserSchema } from './types'

export const listUsers = async (request: Request, response: Response) => {
  const users = await prisma.user.findMany()

  response.send(users)
}

export const findUserById = async (request: Request, response: Response) => {
  const { id } = request.params
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) {
    return response.status(404).send({ error: 'User not found' })
  }

  response.send(user)
}

export const createUser = async (request: Request, response: Response) => {
  let parsed: CreateUserInput

  try {
    parsed = createUserSchema.parse(request.body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ')

      return response.status(400).send({ error: errorMessage })
    }

    return response.status(500).send({ error: 'Internal server error' })
  }

  const { name, email } = parsed

  const emailAlreadyExists = await prisma.user.findFirst({ where: { email }, select: { email: true } })

  if (emailAlreadyExists) {
    return response.status(400).send({ error: 'Email already exists' })
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
    },
  })

  response.send(user)
}
