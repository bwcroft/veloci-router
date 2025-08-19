# @bwcroft/octane

A lightweight, powerful routing library designed for modern JavaScript and TypeScript applications.

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

const port =  '3000'

router.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
```

