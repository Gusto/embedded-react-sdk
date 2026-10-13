---
title: 'Proxy examples'
description: Express.js example code for loading the SDK endpoint inventory, building role-based endpoint allowlists, and enforcing them in a session-authenticated proxy.
---

# Proxy examples

Express.js examples for building endpoint allowlists. These examples assume a standard Express app with session-based authentication. For background, see the [Proxy Security](../../getting-started/proxy-security-partner-guidance.md).

## Loading the endpoint inventory

```typescript
import { readFileSync } from 'fs'

const inventoryPath = require.resolve('@gusto/embedded-react-sdk/endpoint-inventory.json')
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf-8'))
```

## Building the allowlist

Every `:placeholder` in an inventory path must be resolved in one of two ways, or the allowlist build throws:

- **Bound** to a value from the user's session. The resolved path matches only that value.
- **Owned**, with an explicit ownership check. The resolved path matches an identifier of the expected shape, and the proxy runs the check on every matching request.

An identifier that is neither bound nor owned is never turned into a wildcard. See [Identifier placeholders](../../getting-started/proxy-security-partner-guidance.md#identifier-placeholders) for how each inventory variable is classified.

Inventory paths name some identifiers differently (`:employeeId` in some paths and `:employeeUuid` in others for the same employee), so bind every name a role's endpoints use.

```typescript
interface Endpoint {
  method: string
  path: string
}

type OwnershipCheck = (id: string) => Promise<boolean>

interface Scope {
  bindings: Record<string, string>
  ownedIdentifiers?: Record<string, OwnershipCheck>
}

interface ResolvedEndpoint {
  method: string
  pattern: RegExp
  ownershipChecks: Record<string, OwnershipCheck>
}

type Owner = { companyId: string } | { employeeId: string }

// Your lookup: is the resource identified by `id` (for example a form or an address) owned by `owner`?
declare function isOwnedBy(owner: Owner, identifier: string, id: string): Promise<boolean>

function ownedBy(owner: Owner, identifiers: string[]): Record<string, OwnershipCheck> {
  return Object.fromEntries(
    identifiers.map(identifier => [identifier, (id: string) => isOwnedBy(owner, identifier, id)]),
  )
}

function getAllowlistForUser(user: SessionUser): ResolvedEndpoint[] {
  switch (user.role) {
    case 'payroll_admin':
      return buildAllowlistFromInventory(
        { flows: ['EmployeeOnboarding.OnboardingFlow', 'Payroll.PayrollFlow'] },
        {
          bindings: { companyId: user.companyId, companyUuid: user.companyId },
          ownedIdentifiers: ownedBy({ companyId: user.companyId }, [
            'employeeId',
            'employeeUuid',
            'compensationId',
            'jobId',
            'locationUuid',
            'garnishmentId',
            'homeAddressUuid',
            'workAddressUuid',
            'payrollId',
            'payrollUuid',
            'payScheduleId',
            'wireInRequestUuid',
          ]),
        },
      )

    case 'onboarding_admin':
      return buildAllowlistFromInventory(
        {
          blocks: [
            'EmployeeManagement.EmployeeList',
            'EmployeeManagement.Profile',
            'EmployeeManagement.Compensation',
            'EmployeeManagement.FederalTaxes',
            'EmployeeManagement.StateTaxes',
          ],
        },
        {
          bindings: { companyId: user.companyId },
          ownedIdentifiers: ownedBy({ companyId: user.companyId }, [
            'employeeId',
            'employeeUuid',
            'jobId',
          ]),
        },
      )

    case 'employee_self_service':
      return buildAllowlistFromInventory(
        { flows: ['EmployeeOnboarding.SelfOnboardingFlow'] },
        {
          bindings: {
            companyId: user.companyId,
            employeeId: user.employeeId,
            employeeUuid: user.employeeId,
          },
          ownedIdentifiers: ownedBy({ employeeId: user.employeeId }, [
            'formId',
            'homeAddressUuid',
            'workAddressUuid',
          ]),
        },
      )

    default:
      return []
  }
}

function buildAllowlistFromInventory(
  config: { flows?: string[]; blocks?: string[] },
  scope: Scope,
): ResolvedEndpoint[] {
  const names = [...(config.flows ?? []), ...(config.blocks ?? [])]
  return resolveEndpoints(
    names.flatMap(name => collectEndpoints(name)),
    scope,
  )
}

function collectEndpoints(name: string, visited = new Set<string>()): Endpoint[] {
  const block = inventory.blocks[name]
  if (block) return block.endpoints

  const flow = inventory.flows[name]
  if (!flow) throw new Error(`Unknown block or flow: ${name}`)
  if (visited.has(name)) return []
  visited.add(name)

  return flow.blocks.flatMap((child: string) => collectEndpoints(child, visited))
}

const IDENTIFIER_SHAPE = '[A-Za-z0-9_-]+'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function resolveEndpoints(endpoints: Endpoint[], scope: Scope): ResolvedEndpoint[] {
  const seen = new Set<string>()
  const resolved: ResolvedEndpoint[] = []

  for (const endpoint of endpoints) {
    const ownershipChecks: Record<string, OwnershipCheck> = {}

    const source = endpoint.path.replace(/:([a-zA-Z]+)/g, (_match, name: string) => {
      const boundValue = scope.bindings[name]
      if (boundValue !== undefined) return escapeRegExp(boundValue)

      const ownershipCheck = scope.ownedIdentifiers?.[name]
      if (ownershipCheck) {
        ownershipChecks[name] = ownershipCheck
        return `(?<${name}>${IDENTIFIER_SHAPE})`
      }

      throw new Error(`No binding or ownership check for :${name} in ${endpoint.path}`)
    })

    const key = `${endpoint.method} ${source}`
    if (seen.has(key)) continue
    seen.add(key)

    resolved.push({ method: endpoint.method, pattern: new RegExp(`^${source}$`), ownershipChecks })
  }

  return resolved
}
```

## Enforcing the allowlist

```typescript
async function enforceAllowlist(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  try {
    const allowlist = getAllowlistForUser(req.session.user)

    for (const endpoint of allowlist) {
      if (endpoint.method !== req.method) continue

      const match = endpoint.pattern.exec(req.path)
      if (!match) continue

      const results = await Promise.all(
        Object.entries(endpoint.ownershipChecks).map(([name, check]) => {
          const id = match.groups?.[name]
          return id === undefined ? false : check(id)
        }),
      )
      if (results.every(Boolean)) return next()
    }

    return res.status(403).json({ error: 'Forbidden' })
  } catch (error) {
    return next(error)
  }
}

app.all('/gusto-api/*', authenticate, enforceAllowlist, async (req, res) => {
  // Forward the request to the Gusto API, adding auth and client IP headers.
  // Not required, but we highly recommend also forwarding the incoming
  // X-Gusto-SDK-Version header so Gusto can attribute traffic to SDK versions.
})
```
