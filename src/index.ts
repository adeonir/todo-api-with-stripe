/* eslint-disable tsdoc/syntax */
import express from 'express'
import type { Options } from 'swagger-jsdoc'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import { createCheckout, stripeWebhook } from '~/controllers/subscription'
import { createTask, getTasks, updateTask } from '~/controllers/task'
import { createUser, findUserById, getUsers } from '~/controllers/user'

const app = express()
const port = 3000

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo List API Docs',
      description: 'API documentation for the Todo List app',
      contact: {
        email: 'me@adeonir.dev',
      },
      version: '1.0.0',
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
            },
            done: {
              type: 'boolean',
            },
          },
        },
      },
    },
  },
  apis: ['./src/index.ts'],
}

const specs = swaggerJsdoc(swaggerOptions)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true, customSiteTitle: 'Todo List API Docs' }))

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

app.use(express.json())

/**
 * @swagger
 * tags:
 *   - name: Users
 *   - name: Tasks
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     description: Get all users
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/users', getUsers)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     description: Get a user by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cltx06u9s0000f2sew46r3pid
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/users/:id', findUserById)

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           examples:
 *             user:
 *               value:
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Success
 */
app.post('/users', createUser)

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     description: Get all tasks
 *     parameters:
 *      - in: header
 *        name: 'x-user-id'
 *        schema:
 *          type: string
 *        required: true
 *        description: User ID 'cltx06u9s0000f2sew46r3pid'
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/tasks', getTasks)

/**
 * @swagger
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     description: Create a new task
 *     parameters:
 *      - in: header
 *        name: 'x-user-id'
 *        schema:
 *          type: string
 *        required: true
 *        description: User ID 'cltx06u9s0000f2sew46r3pid'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *           examples:
 *            task:
 *             value:
 *              title: "Buy milk"
 *     responses:
 *       201:
 *         description: Created
 */
app.post('/tasks', createTask)

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     description: Update a task by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cltx06u9s0000f2sew46r3pid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *           examples:
 *             task:
 *               value:
 *                 title: "Buy milk"
 *                 done: true
 *     responses:
 *       200:
 *         description: Success
 */
app.patch('/tasks/:id', updateTask)

app.post('/checkout', createCheckout)

app.listen(port, () => {
  console.info(`Server is running on port ${port}`)
})
