---
title: Quickstart
sidebar_position: 0
---

Get the Gusto Embedded React SDK rendering in your app in five minutes. By the end of this guide you'll have an employee list component on screen, backed by a minimal proxy server.

## Prerequisites

- React 18+
- Node.js 18+

## 1. Install the SDK

```bash
npm install @gusto/embedded-react-sdk
```

## 2. Import styles

The SDK ships baseline styles for all components. Import the stylesheet at your application's entry point:

```jsx
import '@gusto/embedded-react-sdk/style.css'
```

## 3. Set up GustoProvider

Wrap your application with `GustoProvider` and point `baseUrl` to your backend proxy. The SDK sends all API requests through this URL — it never calls the Gusto API directly.

```jsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      {/* SDK components go here */}
    </GustoProvider>
  )
}
```

## 4. Render a component

Import a component namespace and render it inside the provider. `Employee.EmployeeList` displays the employees for a given company:

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function EmployeePage({ companyId }) {
  return <Employee.EmployeeList companyId={companyId} onEvent={() => {}} />
}
```

## 5. Set up a minimal proxy

The proxy sits between the SDK and the Gusto Embedded API. Its job is to attach your OAuth2 access token and forward requests. Here's a minimal Express example:

```javascript
import express from 'express'

const app = express()
app.use(express.json())

const GUSTO_API_BASE = 'https://api.gusto-demo.com'

app.all('/api/gusto/*', async (req, res) => {
  const gustoPath = req.originalUrl.replace('/api/gusto', '')
  const accessToken = await getAccessTokenForUser(req) // Your OAuth2 token logic

  const response = await fetch(`${GUSTO_API_BASE}${gustoPath}`, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'x-gusto-client-ip': req.ip,
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
  })

  res.status(response.status).json(await response.json())
})

app.listen(3001)
```

The `x-gusto-client-ip` header is required for form-signing operations. Setting it once in your proxy covers all workflows.

## Putting it all together

```jsx
import '@gusto/embedded-react-sdk/style.css'
import { GustoProvider, Employee } from '@gusto/embedded-react-sdk'

function App() {
  const companyId = 'your-company-uuid'

  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      <h1>Employees</h1>
      <Employee.EmployeeList companyId={companyId} onEvent={() => {}} />
    </GustoProvider>
  )
}

export default App
```

## Try it live

Explore a working example in [CodeSandbox](https://codesandbox.io/p/devbox/happy-ardinghelli-nzpslw) to see the full setup with a proxy and rendered components.

## Next steps

Ready to go beyond a list? [Render your first flow](./first-flow.md) to see a complete multi-step workflow in action.
