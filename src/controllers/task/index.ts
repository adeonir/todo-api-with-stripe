import type { Request, Response } from 'express'
import { z } from 'zod'

import { prisma } from '~/lib/prisma'

import type { CreateTaskInput } from './types'
import { createTaskSchema } from './types'

export const getTasks = async (request: Request, response: Response) => {
  const userId = request.headers['x-user-id'] as string

  if (!userId) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId,
    },
  })

  return response.status(200).send(tasks)
}

export const createTask = async (request: Request, response: Response) => {
  const userId = request.headers['x-user-id'] as string

  if (!userId) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  let parsed: CreateTaskInput

  try {
    parsed = createTaskSchema.parse(request.body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ')

      return response.status(400).send({ error: errorMessage })
    }

    return response.status(500).send({ error: 'Internal server error' })
  }

  const { title } = parsed

  const task = await prisma.task.create({
    data: {
      title,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })

  return response.status(201).send(task)
}
