# Todo API

This is a RESTful API for a Todo application, created as a study project for understanding the integration of Express and Stripe.

It provides endpoints for managing users, tasks, and subscriptions.

## Features

- User Management: Create and retrieve users.
- Task Management: Create, retrieve, update, and delete tasks.
- Subscription Management: Create checkout sessions and handle Stripe webhooks.

## Endpoints

- `GET /users`: Get all users.
- `GET /users/:id`: Get a user by id.
- `POST /users`: Create a new user.
- `GET /tasks`: Get all tasks.
- `POST /tasks`: Create a new task.
- `PATCH /tasks/:id`: Update a task by id.
- `DELETE /tasks/:id`: Delete a task by id.
- `POST /checkout`: Create a checkout session.
- `POST /stripe`: Handle Stripe webhooks.

## Technologies

- [Express](https://expressjs.com/): Fast, unopinionated, minimalist web framework for Node.js.
- [Prisma](https://www.prisma.io/): Next-generation Node.js and TypeScript ORM.
- [Zod](https://github.com/colinhacks/zod): TypeScript-first schema declaration and validation library.
- [Stripe](https://stripe.com/): Online payment processing for internet businesses.
- [Swagger](https://swagger.io/): API design, building, and documentation tool.

## API Documentation

The API documentation is available at `/api-docs` endpoint. It is generated using Swagger UI.

You can access it by navigating to `http://localhost:3000/api-docs` in your browser when the server is running.

## Installation

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

## Local Development

This project uses [SQLite](https://www.sqlite.org/index.html) for local development. SQLite is a C library that provides a lightweight disk-based database that doesn’t require a separate server process and allows accessing the database using a nonstandard variant of the SQL query language.

To set up the SQLite database for local development:

```bash
bun prisma migrate dev
```

This project was created using `bun init` in bun 'v1.0.33'. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
