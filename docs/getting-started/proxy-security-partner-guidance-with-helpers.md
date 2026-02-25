---
title: 'Proxy Security: Partner Guidance'
---

# Proxy Security: Partner Guidance

## The Short Answer

Security is layered. The Gusto API enforces application-level restrictions (scopes, company-level token binding, rate limits) on every request. Your proxy enforces user-level restrictions (who can do what). Both layers are necessary, and your proxy is the right place to implement user-level authorization -- not the SDK UI.

Hiding a button in the UI is not a security control. Your proxy is.

## How Security Is Layered

### Layer 1: Gusto API Scopes (Gusto-enforced)

Every application registered with Gusto is granted a specific set of API scopes based on its use case. Scopes follow a `resource:action` pattern. Simple scopes like `employees:read` control broad access, while more specific scopes like `payrolls:run` or `employee_state_taxes:write` control individual operations.

- Any request outside your application's granted scopes is rejected with a **`403 Forbidden`** response, regardless of how the request reaches our API.
- If your application does not have the `payrolls:run` scope, no request through your proxy can run payroll. Period.
- You can view your current scopes in the [Developer Portal](https://dev.gusto.com) and request changes through your Technical Solutions representative.

**Recommendation:** Request only the scopes your application needs. This is the simplest and most effective way to limit your application's attack surface.

### Layer 2: Your Proxy (Partner-enforced)

Gusto API scopes define what your _application_ can do. User-level authorization -- controlling which of _your users_ can do what -- is enforced at your proxy. This is by design.

You know your users' roles and permission models. Gusto does not. Your proxy is the right place to enforce these rules because:

1. You already authenticate users at the proxy (the OAuth token is a server-side credential your users never see)
2. You already have the user's identity and role information in your session
3. You control the routing logic and can make per-request decisions

| User type                         | What your proxy checks                                   | What happens on violation                                                 |
| --------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Self-service employee**         | Employee ID in the URL matches the session's employee ID | Reject -- prevents accessing another employee's data                      |
| **Onboarding admin** (no payroll) | User's role permits the requested endpoint               | Reject -- even though the OAuth token has scope, the user's role does not |
| **Full admin**                    | User is authenticated                                    | Allow -- Gusto API scopes and token binding are the primary guardrails    |

### Layer 3: Gusto Resource Validation (Gusto-enforced)

Beyond scopes, the Gusto API enforces additional protections:

- **OAuth tokens are bound to a single company.** A token issued for one company cannot access another company's data. Cross-company access is impossible at the API level.
- **Optimistic version control** prevents conflicting or stale updates. Every updatable resource includes a `version` field, and updates submitted with an outdated version are rejected with `409 Conflict`.
- **Rate limiting** is enforced at 200 requests per minute per application-user pair.

## Securing Your Proxy

Here are concrete steps to secure your proxy. A backend engineer should be able to implement these in a day or less.

1. **Authenticate every request.** Verify the user's session on every proxied request, not just at login. Reject unauthenticated or expired sessions before they reach the Gusto API.

2. **Build a per-user endpoint allowlist.** Only forward requests to API endpoints your application actually uses. The SDK exports a `buildAllowlist` function that generates this list from the flows and blocks your application renders, scoped to the current user's session (see examples below).

3. **Log proxied requests.** Maintain audit logs of all requests forwarded through your proxy for security monitoring, debugging, and incident response.

### How SDK components map to API endpoints

Every SDK component (called a "block") makes a specific set of API calls. For example, the `Employee.FederalTaxes` block calls `GET /v1/employees/:employeeId/federal_taxes` and `PUT /v1/employees/:employeeId/federal_taxes`. Flows are groups of blocks -- `Employee.SelfOnboardingFlow` includes Profile, FederalTaxes, StateTaxes, PaymentMethod, and others.

The SDK exports the full mapping as `BLOCK_ENDPOINTS` and `FLOW_ENDPOINTS`:

```typescript
import { BLOCK_ENDPOINTS, FLOW_ENDPOINTS } from '@gusto/embedded-react-sdk'

console.log(BLOCK_ENDPOINTS['Employee.FederalTaxes'])
// [
//   { method: 'GET', path: '/v1/employees/:employeeId/federal_taxes' },
//   { method: 'PUT', path: '/v1/employees/:employeeId/federal_taxes' },
// ]
```

These paths reflect what the SDK actually sends to your proxy, which may differ from the paths shown in the [Gusto API reference](https://docs.gusto.com/embedded-payroll/reference) due to the SDK's internal HTTP client. Always use the paths from `BLOCK_ENDPOINTS` / `FLOW_ENDPOINTS` for your allowlist, not the API reference.

You can use these directly if your proxy is in a different language -- dump the endpoint list at build time and load it into your proxy as a static allowlist. For Node.js proxies, the SDK provides `buildAllowlist` as a convenience wrapper that combines these lookups with variable substitution.

### Using `buildAllowlist`

`buildAllowlist` is a convenience wrapper around `BLOCK_ENDPOINTS` and `FLOW_ENDPOINTS` that combines endpoint lookup with variable substitution in a single call. You tell it which flows or blocks to include, pass any user IDs you know from the session, and it returns the method + path pairs to allowlist:

```typescript
import { buildAllowlist } from '@gusto/embedded-react-sdk'

const allowlist = buildAllowlist({
  flows: ['Employee.SelfOnboardingFlow'],
  variables: { companyId: 'company-abc', employeeId: 'emp-123' },
})

// Returns:
// [
//   { method: 'GET', path: '/v1/employees/emp-123' },
//   { method: 'PUT', path: '/v1/employees/emp-123' },
//   { method: 'GET', path: '/v1/employees/emp-123/federal_taxes' },
//   { method: 'PUT', path: '/v1/employees/emp-123/federal_taxes' },
//   ... every endpoint the SelfOnboardingFlow uses, scoped to this employee
// ]
```

That's the core API. One call, and the allowlist is scoped to exactly this user's data.

#### Configuration

`buildAllowlist` accepts three optional fields:

- **`flows`** -- flow names (e.g., `'Employee.SelfOnboardingFlow'`, `'Payroll.PayrollFlow'`). Each flow includes all endpoints for that entire workflow.
- **`blocks`** -- block/component names (e.g., `'Employee.FederalTaxes'`, `'Payroll.PayrollList'`). Use when a role should only access specific steps. Flows and blocks can be mixed.
- **`variables`** -- URL parameter values from the user's session. **Pass every parameter you can resolve. The more you resolve, the tighter the allowlist.** Unresolved params become `*` wildcards.

All three fields are strongly typed -- TypeScript autocompletes valid flow names, block names, and variable keys (`companyId`, `employeeId`, `contractorId`, etc.) via the `FlowName`, `BlockName`, and `EndpointVariable` types.

#### How `variables` controls access

The `variables` field is how you bind session context into the allowlist. The more IDs you pass, the tighter the restriction:

| What you pass               | What happens                               | Use case                                            |
| --------------------------- | ------------------------------------------ | --------------------------------------------------- |
| Nothing                     | Paths keep `:param` placeholders           | Generic allowlisting, no user scoping               |
| `{ companyId }`             | Company is locked, other params become `*` | Admin who can access any employee in their company  |
| `{ companyId, employeeId }` | Company and employee are locked            | Self-service employee, restricted to their own data |

For example, with `{ companyId: 'abc', employeeId: 'emp-123' }`, a path becomes `/v1/employees/emp-123/federal_taxes`. A request for `/v1/employees/emp-456/federal_taxes` won't match any entry -- ownership validation is built into the allowlist itself.

### Example: Express proxy with allowlist

The following is a minimal but functional Express proxy. It's broken into three parts: setup and middleware, the request handler, and role mapping.

#### 1. Setup and middleware

The `enforceAllowlist` middleware calls `buildAllowlist` directly with the user's session IDs, then checks whether the incoming request matches any entry. Paths with `*` wildcards (unresolved params) are matched via regex; fully resolved paths are matched exactly.

```typescript
import express from 'express'
import session from 'express-session'
import { buildAllowlist, WILDCARD } from '@gusto/embedded-react-sdk'
import type { Endpoint } from '@gusto/embedded-react-sdk'

const app = express()
const GUSTO_API_BASE = 'https://api.gusto.com'

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

function enforceAllowlist(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { user } = req.session

  const allowlist = buildAllowlist({
    flows: ['Employee.SelfOnboardingFlow'],
    variables: { companyId: user.companyId, employeeId: user.employeeId },
  })

  const isAllowed = allowlist.some(endpoint => {
    if (endpoint.method !== req.method) return false

    if (endpoint.path.includes(WILDCARD)) {
      const pattern = endpoint.path.replace(/\*/g, '[^/]+')
      return new RegExp(`^${pattern}$`).test(req.path)
    }

    return endpoint.path === req.path
  })

  if (!isAllowed) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}
```

#### 2. Forward requests

Wire the middleware stack to a catch-all route and forward permitted requests to the Gusto API, attaching the OAuth token and client IP header.

```typescript
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

**Performance note:** This example builds the allowlist on every request. In production, consider caching the result per session or per `companyId + employeeId` tuple.

#### 3. Adding role-based access control

The example above hardcodes a single flow. In practice, you'll have multiple roles with different access levels. Wrap `buildAllowlist` in a function that maps your roles to the right flows, blocks, and variables:

```typescript
interface SessionUser {
  role: string
  companyId: string
  employeeId: string
  gustoAccessToken: string
}

function getAllowlistForUser(user: SessionUser): Endpoint[] {
  switch (user.role) {
    case 'payroll_admin':
      return buildAllowlist({
        flows: ['Employee.OnboardingFlow', 'Payroll.PayrollFlow'],
        variables: { companyId: user.companyId },
      })

    case 'onboarding_admin':
      return buildAllowlist({
        blocks: [
          'Employee.EmployeeList',
          'Employee.Profile',
          'Employee.Compensation',
          'Employee.FederalTaxes',
          'Employee.StateTaxes',
        ],
        variables: { companyId: user.companyId },
      })

    case 'employee_self_service':
      return buildAllowlist({
        flows: ['Employee.SelfOnboardingFlow'],
        variables: { companyId: user.companyId, employeeId: user.employeeId },
      })

    default:
      return []
  }
}
```

Then replace the `buildAllowlist` call in `enforceAllowlist` with `getAllowlistForUser(req.session.user)`. The role mapping is your business logic -- the SDK just needs the flows/blocks and whatever IDs you can provide.

On the React side, configure the SDK to point at this proxy:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return <GustoProvider config={{ baseUrl: '/gusto-api/' }}>{/* Your application */}</GustoProvider>
}
```

## FAQ

### "Can an authenticated employee access another employee's data?"

Not if you pass `employeeId` in the `variables` when building the allowlist. The resulting paths only match that specific employee's endpoints -- a request for a different employee ID won't match any entry.

### "We want some admins to not be able to run payroll. How do we enforce that?"

Map roles to endpoint allowlists using `buildAllowlist` with only the `blocks` that role needs -- exclude `Payroll.*` blocks for non-payroll admins. The SDK not rendering payroll UI is a UX decision, not a security control; the proxy enforces the actual restriction.

If your application should never run payroll at all, request that the `payrolls:run` scope be removed from your application entirely.

## Further Reading

- [Securing your proxy](./getting-started.md#securing-your-proxy) -- SDK Getting Started documentation
- [Gusto API Scopes](https://docs.gusto.com/embedded-payroll/docs/scopes) -- Gusto Embedded API documentation
- [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference) -- API reference, versioning, and endpoint details
- The SDK also exports `getFlowEndpoints`, `getBlockEndpoints`, and `resolveEndpoints` for fine-grained endpoint composition
