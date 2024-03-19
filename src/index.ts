/* eslint-disable tsdoc/syntax */
import express from 'express'
import type { Options } from 'swagger-jsdoc'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import { createCheckout, stripeWebhook } from '~/controllers/subscription'
import { createTask } from '~/controllers/task'
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

app.get('/users', getUsers)
app.get('/users/:id', findUserById)
app.post('/users', createUser)

app.get('/tasks', getTasks)
app.post('/tasks', createTask)

app.post('/checkout', createCheckout)

app.listen(port, () => {
  console.info(`Server is running on port ${port}`)
})
