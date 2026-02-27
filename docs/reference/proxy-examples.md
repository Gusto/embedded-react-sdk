---
title: 'Proxy Examples'
---

# Proxy Examples

Complete Express.js proxy examples for building endpoint allowlists with the Gusto Embedded React SDK. For a concise overview, see the [Proxy Security: Partner Guidance](../getting-started/proxy-security-partner-guidance.md).

## Using the JSON endpoint inventory

### Setup and middleware

```typescript
import express from 'express'
import session from 'express-session'
import { readFileSync } from 'fs'

const app = express()
const GUSTO_API_BASE = 'https://api.gusto.com'

const inventoryPath = require.resolve('@gusto/embedded-react-sdk/endpoint-inventory.json')
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf-8'))

app.use(express.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  }),
)

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}
```

### Building the allowlist from the inventory

```typescript
interface Endpoint {
  method: string
  path: string
}

function getAllowlistForUser(user: SessionUser): Endpoint[] {
  switch (user.role) {
    case 'payroll_admin':
      return buildAllowlistFromInventory(
        { flows: ['Employee.OnboardingFlow', 'Payroll.PayrollFlow'] },
        { companyId: user.companyId },
      )

    case 'onboarding_admin':
      return buildAllowlistFromInventory(
        {
          blocks: [
            'Employee.EmployeeList',
            'Employee.Profile',
            'Employee.Compensation',
            'Employee.FederalTaxes',
            'Employee.StateTaxes',
          ],
        },
        { companyId: user.companyId },
      )

    case 'employee_self_service':
      return buildAllowlistFromInventory(
        { flows: ['Employee.SelfOnboardingFlow'] },
        { companyId: user.companyId, employeeId: user.employeeId },
      )

    default:
      return []
  }
}

function buildAllowlistFromInventory(
  config: { flows?: string[]; blocks?: string[] },
  variables: Record<string, string>,
): Endpoint[] {
  const endpoints: Endpoint[] = []

  for (const flowName of config.flows ?? []) {
    const flow = inventory.flows[flowName]
    if (flow) endpoints.push(...flow.endpoints)
  }

  for (const blockName of config.blocks ?? []) {
    const block = inventory.blocks[blockName]
    if (block) endpoints.push(...block.endpoints)
  }

  return resolveEndpoints(endpoints, variables)
}

function resolveEndpoints(endpoints: Endpoint[], variables: Record<string, string>): Endpoint[] {
  const seen = new Set<string>()
  return endpoints
    .map(endpoint => ({
      method: endpoint.method,
      path: endpoint.path.replace(/:([a-zA-Z]+)/g, (_match, param) => {
        return variables[param] ?? '[^/]+'
      }),
    }))
    .filter(ep => {
      const key = `${ep.method} ${ep.path}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}
```

### Enforcing the allowlist

```typescript
function enforceAllowlist(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { user } = req.session
  const allowlist = getAllowlistForUser(user)

  const isAllowed = allowlist.some(endpoint => {
    if (endpoint.method !== req.method) return false
    return new RegExp(`^${endpoint.path}$`).test(req.path)
  })

  if (!isAllowed) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}
```

### Forwarding requests

```typescript
interface SessionUser {
  role: string
  companyId: string
  employeeId: string
  gustoAccessToken: string
}

app.all('/gusto-api/*', authenticate, enforceAllowlist, async (req, res) => {
  const gustoPath = req.path.replace('/gusto-api', '')
  const gustoUrl = `${GUSTO_API_BASE}${gustoPath}`

  try {
    const gustoResponse = await fetch(gustoUrl, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${req.session.user.gustoAccessToken}`,
        'Content-Type': 'application/json',
        'x-gusto-client-ip': req.ip!,
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    })

    const data = await gustoResponse.json()
    res.status(gustoResponse.status).json(data)
  } catch (error) {
    res.status(502).json({ error: 'Failed to reach Gusto API' })
  }
})

app.listen(3001)
```

---

## React SDK configuration

On the React side, point the SDK at your proxy:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return <GustoProvider config={{ baseUrl: '/gusto-api/' }}>{/* Your application */}</GustoProvider>
}
```
