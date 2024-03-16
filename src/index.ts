import express from 'express'
import { createUser, findUserById, listUsers } from "~/controllers/user"
import { createTask } from "./controllers/todo"

const app = express()
const port = 3000

app.use(express.json())

app.get('/users', listUsers)
app.post('/users', createUser)
app.get('/users/:id', findUserById)
app.post('/tasks', createTask)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
