<div align="center"> 
  <img src="https://raw.githubusercontent.com/bwcroft/nodejs-toolkit/refs/heads/main/packages/octane/images/octane-logo-round-250x250.png">
</div>
<br>

**Octane** is a blazing-fast, lightweight, and fully type-safe routing library for modern JavaScript and TypeScript applications. Designed with performance and simplicity in mind, Octane gives you the power of an expressive API without the overhead of large frameworks.  

Whether you’re building a small API or a large-scale backend service, Octane provides all the essentials you need to define and organize your routes while keeping your application lean and maintainable.  

## Features

- **Ultra-fast routing** – optimized for speed, competitive with Fastify and much faster than Express.  
- **Lightweight & zero dependencies** – no unnecessary bloat, just pure performance.  
- **Full TypeScript support** – first-class typings out of the box for safety and great DX.  
- **Route definitions** – easily register GET, POST, PUT, DELETE, and other routes.  
- **Route parameters** – capture and work with dynamic path parameters seamlessly.  
- **Middleware support** – attach per-route or global middleware for request handling.  
- **Route grouping** – organize related routes with clean, hierarchical grouping.  
- **Group middleware** – apply middleware at the group level for maximum flexibility.  

## Installation

```bash
npm install @bwcroft/octane
# or
pnpm add @bwcroft/octane
# or
yarn add @bwcroft/octane
```

## Example Usage
  This snippet demonstrates a basic usage of the Router. It creates a new router instance, defines a GET 
  route at the root path (/) that responds with "Hello World", and then starts the server on port 3000,
  logging the server URL once it’s running. The Router supports all standard HTTP methods, 
  including GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS. 

```ts
import { Router } from '@bwcroft/octane'

const router = new Router()

router.get('/', (req, res) => {
  res.send('Hello World')
})

const port = '3000'

router.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
```

### Route Parameters

Route parameters let you capture dynamic values directly from the URL path. Parameters are defined by prefixing a segment with 
a colon (`:`). These values are automatically extracted and made available on `ctx.params`.  

```ts
router.get("/users/:id", (req, res, ctx) => {
  res.send({ id: ctx.params?.id })
}) 

router.get("/users/:id/addresses/:addressId", (req, res, ctx) => {
  res.send({ 
    id: ctx.params?.id,
    addressId: ctx.params?.addressId
  })
})
```

### Query Parameters

Query parameters (the values after `?` in a URL) are available as a standard `URLSearchParams` object on `ctx.searchParams`. 
This allows you to easily get, check, or iterate over query parameters.

For example, for the URL `/users?active=true&sort=asc`:

```ts
router.get("/users", (req, res, ctx) => {
  const active = ctx.searchParams?.get("active") // get the "active" query parameter
  const sort = ctx.searchParams?.get("sort")     // get the "sort" query parameter

  res.send({ 
    active,
    sort
  })
})
```

### Route Middleware

You can attach middleware to individual routes using the `middleware` option. The middleware runs only for that specific route.

```ts
const authMiddleware = (req, res, ctx, next) => {
  if (!ctx.user) {
    return res.unauthorized()
  }
  next()
}

router.get("/", (req, res, ctx) => {
  res.send({ message: "Hello, authorized user!" })
}, { middleware: [authMiddleware] })
```

### Route Groups

Route groups allow you to organize multiple routes under a common path prefix.

```ts
router.group("/users", (r) => {
  r.get("/", (req, res, ctx) => {
    res.send([])
  })

  r.get("/:id", (req, res, ctx) => {
    res.send({ id: ctx.params?.id })
  })
})
```

You can attach middleware to a route group so that it runs for all routes within the group. In this example, 
`authMiddleware` ensures that only authorized users can access the `/users` routes.

```ts
const authMiddleware = (req, res, ctx, next) => {
  if (!ctx.user) {
    return res.unauthorized()
  }
  next()
}

router.group("/users", [authMiddleware], (r) => {
  r.get("/", (req, res, ctx) => {
    res.send({ message: "List all users" })
  })

  r.get("/:id", (req, res, ctx) => {
    res.send({ userId: ctx.params?.id })
  })
})
```

### HttpResponse Decorators

Octane extends Node's `ServerResponse`, offering convenient helpers for sending responses, managing status codes, setting
content types, and handling common HTTP patterns.

```ts
// Set the response status code
res.code(201)

// Set the Content-Type header
res.type('application/json')

// Send a response body; automatically detects type
res.send({ message: 'ok' })          // Content-Type: application/json
res.send('Hello world')              // Content-Type: text/plain
res.send(Buffer.from('binary data')) // Content-Type: application/octet-stream
```

Send only a status code with an empty body:
```ts
res.code(201).send()
```

Prevent send() from auto-setting Content-Type:
```ts
res.type('text/plain').send({})
```

Set both status code and Content-Type:
```ts
res.code(201).type('text/plain').send()
```

Handling Redirects:
```ts
res.redirect('/login')           // Defaults to status code 301
res.redirect('/new-page', false) // Sets status code to 302 
```

Convenience helpers for common status codes:
```ts
res.unauthorized()      // 401 Unauthorized
res.methodNotAllowed()  // 405 Method Not Allowed
res.notFound()          // 404 Not Found
res.serverError()       // 500 Internal Server Error
```
