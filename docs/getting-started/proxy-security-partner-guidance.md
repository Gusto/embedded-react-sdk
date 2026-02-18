---
title: 'Proxy Security: Partner Guidance'
---

# Proxy Security: Partner Guidance

This document addresses questions raised by partners about securing the proxy layer when building with the Gusto Embedded React SDK. It is intended to be shared directly with partners and used as a reference by Gusto team members during partner conversations.

## The Question

Partners have asked variations of the same core question:

> "The SDK makes API calls through our proxy. What's stopping an authenticated user from crafting requests directly to the proxy to access data or perform actions they shouldn't be allowed to?"

This is the right question to ask, and we want to be direct about how security works in this architecture.

## The Short Answer

Security is layered. The Gusto API enforces application-level restrictions (scopes, company-level token binding, rate limits) on every request. Your proxy enforces user-level restrictions (who can do what). Both layers are necessary, and your proxy is the right place to implement user-level authorization -- not the SDK UI.

Hiding a button in the UI is not a security control. Your proxy is.

## How Security Is Layered

### Layer 1: Gusto API Scopes (Gusto-enforced)

Every application registered with Gusto is granted a specific set of API scopes based on its use case. Scopes follow a `resource:action` pattern, such as `employees:read` or `payrolls:run`.

- Any request outside your application's granted scopes is rejected with a **`403 Forbidden`** response, regardless of how the request reaches our API.
- If your application does not have the `payrolls:run` scope, no request through your proxy can run payroll. Period.
- You can view your current scopes in the [Developer Portal](https://dev.gusto.com) and request changes through your Technical Solutions representative.

**Recommendation:** Request only the scopes your application needs. If you do not need the ability to run payroll, do not request that scope. This is the simplest and most effective way to limit your application's attack surface.

### Layer 2: Your Proxy (Partner-enforced)

The Gusto API scopes operate at the application level -- they define what your entire application can do. User-level authorization -- controlling which of your users can do what -- is enforced at your proxy. This is by design.

You know your users' roles and permission models. Gusto does not. Your proxy is the right place to enforce these rules because:

1. You already authenticate users at the proxy (to attach OAuth tokens to requests)
2. You already have the user's identity and role information in your session
3. You control the routing logic and can make per-request decisions

This is the same pattern used in any Backend for Frontend (BFF) architecture and is industry-standard for embedded financial products.

#### How this works in practice

To understand why the proxy is the natural place for user-level authorization, it helps to look at what each side of the system knows:

**What Gusto knows:** Your application has an OAuth token for a specific company. That token has a set of scopes (`employees:read`, `payrolls:run`, etc.). Gusto does not know who the end user is -- it only sees the token.

**What you know:** You have a user session. That session contains the user's identity, their role in your system, which company they belong to, and (for employees) their specific employee ID. You also have a Gusto OAuth token stored server-side that you attach to requests on their behalf.

The proxy sits at the intersection of these two worlds. It is the only place in the system that has both pieces of context: who the user is (from your session) and what the Gusto API will accept (from the OAuth token). This is what makes it the right place to make authorization decisions.

Here is what that looks like concretely for different types of users in a typical partner application:

**An employee onboarding themselves.** Your session knows this is employee `abc-123`. When the SDK makes a request to `GET /v1/employees/abc-123/federal_taxes`, your proxy checks that `abc-123` matches the employee ID in the session. If someone tampers with the request to say `GET /v1/employees/xyz-789/federal_taxes`, your proxy rejects it -- Gusto would have served the response because the OAuth token has `employees:read` scope for that company, but your proxy knows this user should not see another employee's data.

**An admin who manages onboarding but not payroll.** Your session knows this user has an `onboarding_admin` role. When the SDK makes a request to `POST /v1/companies/{id}/employees`, the proxy allows it. If the same user opens their browser's dev tools and crafts a `POST /v1/companies/{id}/payrolls` request, the proxy rejects it -- the Gusto API would have accepted it (the token has `payrolls:run` scope), but the proxy knows this user's role does not permit payroll operations.

**A full admin.** Your session knows this user has `payroll_admin` permissions. The proxy allows requests to all endpoints within the company. The Gusto API scopes and token binding are the primary guardrails here, and the proxy simply ensures the user is authenticated.

The pattern is always the same: your proxy maps **your user's identity and role** to **which Gusto API endpoints they are allowed to hit**. The mapping is yours to define because the permission model is yours. A small company might have a single admin role. A large enterprise might have a dozen roles with granular endpoint-level permissions. The proxy pattern supports both without requiring Gusto to understand your permission model.

This also means the Gusto OAuth token should be treated as a server-side credential. Your users should never see or handle the token directly. The proxy retrieves it from your database or token store based on the user's session, attaches it to the outgoing request, and the user never knows it exists. This keeps the token out of the browser and prevents it from being used to bypass the proxy entirely.

### Layer 3: Gusto Resource Validation (Gusto-enforced)

Beyond scopes, the Gusto API enforces additional protections:

- **OAuth tokens are bound to a single company.** A token issued for one of your partner-managed companies cannot access another company's data. Cross-company access is impossible at the API level.
- **Optimistic version control** prevents conflicting or stale updates. Every updatable resource includes a `version` field, and updates submitted with an outdated version are rejected with `409 Conflict`.
- **Rate limiting** is enforced at 200 requests per minute per application-user pair.

## What You Should Do

Here are concrete steps to secure your proxy. A backend engineer should be able to implement these in a day or less.

### 1. Authenticate every request

Verify the user's session or identity on every proxied request, not just at login. Reject requests from unauthenticated or expired sessions before they reach the Gusto API. You are likely already doing this if your proxy attaches OAuth tokens.

### 2. Build an allowlist using SDK permission sets

The SDK exports a `buildAllowlist` function that generates an endpoint allowlist from the flows and blocks your application uses. Instead of manually listing every API endpoint, you describe which flows and blocks a role should access, and optionally bind URL parameters to specific values:

```javascript
const { buildAllowlist } = require('@gusto/embedded-react-sdk')

function getAllowlistForUser(user) {
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

`buildAllowlist` accepts a configuration object with three optional fields:

- **`flows`** -- an array of flow names (e.g., `'Employee.SelfOnboardingFlow'`, `'Payroll.PayrollFlow'`). Each flow includes all the endpoints used by that entire workflow.
- **`blocks`** -- an array of block/component names (e.g., `'Employee.FederalTaxes'`, `'Payroll.PayrollList'`). Use this when a role should only access specific steps within a flow. Flows and blocks can be mixed in a single call.
- **`variables`** -- a map of URL parameter names to values. When provided, every `:param` placeholder in the endpoint paths is replaced with the corresponding value. This is where endpoint allowlisting and resource ownership validation merge into one step.

When you pass `{ employeeId: user.employeeId }` in the variables, every path in the returned allowlist contains that specific employee ID. A request targeting a different employee's data will not match any entry. No separate resource ownership middleware is needed.

For admin roles that need to access multiple employees, resolve only the `companyId` to lock the admin to their company, and use pattern matching (via `path-to-regexp`) for the remaining `:employeeId` parameters.

The SDK also exports the lower-level functions `getFlowEndpoints`, `getBlockEndpoints`, and `resolveEndpoints` individually if you need more control over composition.

### 3. Log proxied requests

Maintain audit logs of all requests forwarded through your proxy. This enables security monitoring, debugging, and incident response.

### Complete example: Express proxy with SDK permission sets

The following puts all the pieces together into a single Express application. This is a minimal but functional proxy that authenticates requests, builds a per-user allowlist from SDK permission sets, and forwards permitted requests to the Gusto Embedded API.

```javascript
const express = require('express')
const session = require('express-session')
const { match } = require('path-to-regexp')
const { buildAllowlist } = require('@gusto/embedded-react-sdk')

const app = express()
const GUSTO_API_BASE = 'https://api.gusto.com'

app.use(express.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
)

function getAllowlistForUser(user) {
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

function authenticate(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}

function enforceAllowlist(req, res, next) {
  const allowlist = getAllowlistForUser(req.session.user)

  const isAllowed = allowlist.some(endpoint => {
    if (endpoint.method !== req.method) return false

    if (endpoint.path.includes(':')) {
      const matchFn = match(endpoint.path, { decode: decodeURIComponent })
      return matchFn(req.path) !== false
    }

    return endpoint.path === req.path
  })

  if (!isAllowed) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}

app.all('/gusto-api/*', authenticate, enforceAllowlist, async (req, res) => {
  const gustoPath = req.path.replace('/gusto-api', '')
  const gustoUrl = `${GUSTO_API_BASE}${gustoPath}`

  const gustoResponse = await fetch(gustoUrl, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${req.session.user.gustoAccessToken}`,
      'Content-Type': 'application/json',
      'x-gusto-client-ip': req.ip,
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
  })

  const data = await gustoResponse.json()

  res.status(gustoResponse.status).json(data)
})

app.listen(3001)
```

In this example, a request flows through two checks before reaching Gusto:

1. **`authenticate`** -- rejects unauthenticated sessions
2. **`enforceAllowlist`** -- calls `buildAllowlist` to generate a per-user endpoint list and rejects any request that does not match

For self-service employees, passing `employeeId` in the variables binds their ID into every path, so requests targeting another employee's data are automatically rejected -- no separate resource ownership middleware is needed. For admin roles, only `companyId` is resolved while `:employeeId` parameters remain as patterns matched via `path-to-regexp`.

On the React side, configure the SDK to point at this proxy:

```jsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return <GustoProvider config={{ baseUrl: '/gusto-api/' }}>{/* Your application */}</GustoProvider>
}
```

This is a simplified reference implementation. Your production proxy will likely include additional concerns such as error handling, request logging, token refresh logic, and HTTPS configuration.

## Addressing Specific Scenarios

### "Can an authenticated employee access another employee's data?"

**Answer:** Not if your proxy validates resource ownership. When your proxy receives a request to `/v1/employees/{employee_id}/...`, check that the `employee_id` in the URL matches the authenticated user's employee ID (or that the user has a role that grants broader access). The Gusto API's token-resource binding also prevents cross-company access, but intra-company employee-to-employee isolation is your proxy's responsibility.

### "We want some admins to not be able to run payroll. How do we enforce that?"

**Answer:** This is a role-to-endpoint mapping problem. In your proxy, define which roles are permitted to call payroll-related endpoints (`POST /v1/companies/:id/payrolls`, `PUT /v1/payrolls/:id/submit`, etc.). When a request comes in, check the authenticated user's role against the allowlist. If their role does not permit payroll operations, reject the request at the proxy. The SDK not rendering the payroll UI for that user is a UX decision, not a security control.

Additionally, if your application truly should never run payroll, you can request that the `payrolls:run` scope be removed from your application entirely -- then no request through your proxy can run payroll, regardless of how it is constructed.

## The Tradeoff

The proxy pattern gives you flexibility and control over how your users interact with the Gusto API. That control comes with the responsibility to implement authorization. This is not unique to Gusto -- it is how every BFF and API gateway architecture works. The alternative would be for Gusto to dictate your user permission model, which would not work for the variety of use cases our partners support.

The Gusto API provides the guardrails (scopes, token binding, rate limits). Your proxy provides the fine-grained access control. Together, they form a defense-in-depth model that is appropriate for embedded financial products.

## Further Reading

- [Securing your proxy](./getting-started.md#securing-your-proxy) -- SDK Getting Started documentation
- [Gusto API Scopes](https://docs.gusto.com/embedded-payroll/docs/scopes) -- Gusto Embedded API documentation
- [Gusto API Fundamentals](https://docs.gusto.com/embedded-payroll/docs/scopes) -- Pagination, reliability, rate limits, and scopes
