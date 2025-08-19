<div align="center"> 
    <img
      src="./images/octane-logo.jpg"
      width="250"
      height="auto"
      style="border-radius: 12px; margin-bottom: 30px;"
    />
</div>

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
```ts
import { Router } from '@bwcroft/octane'

const router = new Router()

router.get('/', (req, res) => {
  res.sendText('Hello World')
})

const port = '3000'

router.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
```

### Route Parameters

```ts
router.get("/posts/:postId", (req, res, ctx) => {
  res.sendJson(200, { postId: ctx.params?.postId })
}) 

router.get("/users/:id/addresses/:addressId", (req, res, ctx) => {
  res.sendJson(200, { 
    id: ctx.params?.id,
    addressId: ctx.params?.addressId
  })
})
