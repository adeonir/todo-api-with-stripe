import type { Request, Response } from 'express'
import { z } from 'zod'

import { prisma } from '~/lib/prisma'

import type { CreateTaskInput, UpdateTaskInput } from './types'
import { createTaskSchema, updateTaskSchema } from './types'

const FREE_LIMIT_QUOTA = 5

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      subscriptionId: true,
      subscriptionStatus: true,
      _count: { select: { tasks: true } },
    },
  })

  if (!user) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const hasQuotaAvailable = user._count.tasks <= FREE_LIMIT_QUOTA
  const hasSubscriptionId = Boolean(user.subscriptionId)
  const hasActiveSubscription = user.subscriptionStatus === 'active'

  if (!hasQuotaAvailable && !hasSubscriptionId && !hasActiveSubscription) {
    return response.status(403).send({ error: 'No quota available. Please upgrade your plan!' })
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

export const updateTask = async (request: Request, response: Response) => {
  const userId = request.headers['x-user-id'] as string

  if (!userId) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const taskId = request.params.id

  if (!taskId) {
    return response.status(400).send({ error: 'Task ID not provided' })
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } })

  if (!task) {
    return response.status(404).send({ error: 'Task not found' })
  }

  if (task.userId !== userId) {
    return response.status(403).send({ error: 'Forbidden' })
  }

  let parsed: UpdateTaskInput

  try {
    parsed = updateTaskSchema.parse(request.body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ')

      return response.status(400).send({ error: errorMessage })
    }

    return response.status(500).send({ error: 'Internal server error' })
  }

  const { title, done } = parsed

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      done,
    },
  })

  return response.status(200).send(updatedTask)
}

export const deleteTask = async (request: Request, response: Response) => {
  const userId = request.headers['x-user-id'] as string

  if (!userId) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    return response.status(401).send({ error: 'Unauthorized' })
  }

  const taskId = request.params.id

  if (!taskId) {
    return response.status(400).send({ error: 'Task ID not provided' })
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } })

  if (!task) {
    return response.status(404).send({ error: 'Task not found' })
  }

  if (task.userId !== userId) {
    return response.status(403).send({ error: 'Forbidden' })
  }

  await prisma.task.delete({ where: { id: taskId } })

  return response.status(204).send()
}
