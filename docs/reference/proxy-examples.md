---
title: 'Proxy Examples'
---

# Proxy Examples

Express.js examples for building endpoint allowlists. These examples assume a standard Express app with session-based authentication. For background, see the [Proxy Security: Partner Guidance](../getting-started/proxy-security-partner-guidance.md).

## Loading the endpoint inventory

```typescript
import { readFileSync } from 'fs'

const inventoryPath = require.resolve('@gusto/embedded-react-sdk/endpoint-inventory.json')
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf-8'))
```

## Building the allowlist

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

## Enforcing the allowlist

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
