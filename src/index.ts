import express from 'express'

import { createUser, findUserById, getUsers } from '~/controllers/user'

import { createCheckout } from './controllers/subscription'
import { createTask, getTasks } from './controllers/task'

const app = express()
const port = 3000

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
