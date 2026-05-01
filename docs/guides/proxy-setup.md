---
title: Proxy Setup
sidebar_position: 7
---

The Gusto Embedded React SDK requires a server-side proxy to forward API requests to the Gusto API. This guide shows how to build a secure proxy with endpoint allowlisting using the SDK's built-in endpoint inventory.

For background on proxy security requirements, see the [Authentication and Proxy](../concepts/authentication-and-proxy.md) concept guide.

## Loading the Endpoint Inventory

The SDK ships an `endpoint-inventory.json` file that maps every component and flow to the API endpoints it uses:

```typescript
import { readFileSync } from 'fs'

const inventoryPath = require.resolve('@gusto/embedded-react-sdk/endpoint-inventory.json')
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf-8'))
```

## Building the Allowlist

Use the inventory to build per-user allowlists based on which SDK components they access:

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

## Enforcing the Allowlist

Apply the allowlist as Express middleware:

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

app.all('/gusto-api/*', authenticate, enforceAllowlist, async (req, res) => {
  // Forward the request to the Gusto API, adding auth and client IP headers
})
```

The `resolveEndpoints` function substitutes path parameters (`:companyId`, `:employeeId`, etc.) with the actual IDs for the current user, ensuring users can only access their own data. Parameters without a provided value are replaced with `[^/]+` to match any valid path segment.
