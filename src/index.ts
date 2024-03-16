import express from 'express'

import { createUser, findUserById, getUsers } from '~/controllers/user'

import { createTask, getTasks } from './controllers/task'

const app = express()
const port = 3000

app.use(express.json())

app.get('/users', getUsers)
app.post('/users', createUser)
app.get('/users/:id', findUserById)
app.get('/tasks', getTasks)
app.post('/tasks', createTask)

app.listen(port, () => {
  console.info(`Server is running on port ${port}`)
})
