import express from 'express'
import { findUserById, listUsers } from "~/controllers/user"

const app = express()
const port = 3000

app.use(express.json())

app.get('/users', listUsers)
app.get('/users/:id', findUserById)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
