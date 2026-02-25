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

2. **Build a per-user endpoint allowlist.** Only forward requests to API endpoints your application actually uses. Each SDK component makes a known set of API calls -- use the reference below to build an allowlist scoped to the current user's session.

3. **Log proxied requests.** Maintain audit logs of all requests forwarded through your proxy for security monitoring, debugging, and incident response.

### How SDK components map to API endpoints

Every SDK component makes a specific set of API calls. For example, `Employee.FederalTaxes` calls `GET /v1/employees/:employeeId/federal_taxes` to load data and `PUT /v1/employees/:employeeId/federal_taxes` to save it. Multi-step flows like employee self-onboarding compose several components, each with their own endpoints.

The simplest way to identify exactly which endpoints your application uses: open your browser's Network tab while using the SDK in development and note the requests that flow through your proxy. These are the paths that belong in your allowlist.

Below is a reference of common SDK components and their API endpoints. Paths use named parameters (`:companyId`, `:employeeId`, etc.) that correspond to real IDs at runtime.

#### Employee components

| Component                      | Method | Path                                                        |
| ------------------------------ | ------ | ----------------------------------------------------------- |
| **Employee.Profile**           | GET    | `/v1/companies/:companyId/locations`                        |
|                                | POST   | `/v1/companies/:companyId/employees`                        |
|                                | GET    | `/v1/employees/:employeeId`                                 |
|                                | PUT    | `/v1/employees/:employeeId`                                 |
|                                | GET    | `/v1/employees/:employeeId/home_addresses`                  |
|                                | POST   | `/v1/employees/:employeeId/home_addresses`                  |
|                                | PUT    | `/v1/home_addresses/:homeAddressUuid`                       |
|                                | GET    | `/v1/employees/:employeeId/work_addresses`                  |
|                                | POST   | `/v1/employees/:employeeId/work_addresses`                  |
|                                | PUT    | `/v1/work_addresses/:workAddressUuid`                       |
|                                | PUT    | `/v1/employees/:employeeId/onboarding_status`               |
| **Employee.FederalTaxes**      | GET    | `/v1/employees/:employeeId/federal_taxes`                   |
|                                | PUT    | `/v1/employees/:employeeId/federal_taxes`                   |
| **Employee.StateTaxes**        | GET    | `/v1/employees/:employeeId/state_taxes`                     |
|                                | PUT    | `/v1/employees/:employeeId/state_taxes`                     |
| **Employee.PaymentMethod**     | GET    | `/v1/employees/:employeeId/payment_method`                  |
|                                | PUT    | `/v1/employees/:employeeId/payment_method`                  |
|                                | GET    | `/v1/employees/:employeeId/bank_accounts`                   |
|                                | POST   | `/v1/employees/:employeeId/bank_accounts`                   |
|                                | PUT    | `/v1/employees/:employeeId/bank_accounts/:bankAccountUuid`  |
|                                | DELETE | `/v1/employees/:employeeId/bank_accounts/:bankAccountUuid`  |
| **Employee.EmployeeList**      | GET    | `/v1/companies/:companyId/employees`                        |
|                                | DELETE | `/v1/employees/:employeeId`                                 |
|                                | PUT    | `/v1/employees/:employeeId/onboarding_status`               |
| **Employee.Compensation**      | GET    | `/v1/employees/:employeeId/jobs`                            |
|                                | POST   | `/v1/employees/:employeeId/jobs`                            |
|                                | PUT    | `/v1/jobs/:jobId`                                           |
|                                | DELETE | `/v1/jobs/:jobId`                                           |
|                                | PUT    | `/v1/compensations/:compensationId`                         |
|                                | GET    | `/v1/locations/:locationUuid/minimum_wages`                 |
|                                | GET    | `/v1/employees/:employeeId/work_addresses`                  |
|                                | GET    | `/v1/companies/:companyId/federal_tax_details`              |
|                                | GET    | `/v1/employees/:employeeId`                                 |
| **Employee.Deductions**        | GET    | `/v1/employees/:employeeId/garnishments`                    |
|                                | GET    | `/v1/employees/:employeeId/garnishments/child_support_data` |
|                                | POST   | `/v1/employees/:employeeId/garnishments`                    |
|                                | PUT    | `/v1/employees/:employeeId/garnishments/:garnishmentId`     |
| **Employee.OnboardingSummary** | GET    | `/v1/employees/:employeeId`                                 |
|                                | GET    | `/v1/employees/:employeeId/onboarding_status`               |
| **Employee.DocumentSigner**    | GET    | `/v1/employees/:employeeId/forms`                           |
|                                | GET    | `/v1/employees/:employeeId/forms/:formId`                   |
|                                | GET    | `/v1/employees/:employeeId/forms/:formId/pdf`               |
|                                | POST   | `/v1/employees/:employeeId/forms/:formId/sign`              |
| **Employee.Landing**           | GET    | `/v1/employees/:employeeId`                                 |
|                                | GET    | `/v1/companies/:companyId`                                  |

#### Company components

| Component                      | Method | Path                                                             |
| ------------------------------ | ------ | ---------------------------------------------------------------- |
| **Company.Locations**          | GET    | `/v1/companies/:companyId/locations`                             |
| **Company.FederalTaxes**       | GET    | `/v1/companies/:companyId/federal_tax_details`                   |
|                                | PUT    | `/v1/companies/:companyId/federal_tax_details`                   |
| **Company.Industry**           | GET    | `/v1/companies/:companyId/industry_selection`                    |
|                                | PUT    | `/v1/companies/:companyId/industry_selection`                    |
| **Company.BankAccount**        | GET    | `/v1/companies/:companyId/bank_accounts`                         |
|                                | POST   | `/v1/companies/:companyId/bank_accounts`                         |
|                                | PUT    | `/v1/companies/:companyId/bank_accounts/:bankAccountUuid/verify` |
| **Company.PaySchedule**        | GET    | `/v1/companies/:companyId/pay_schedules`                         |
|                                | POST   | `/v1/companies/:companyId/pay_schedules`                         |
|                                | PUT    | `/v1/companies/:companyId/pay_schedules/:payScheduleId`          |
|                                | GET    | `/v1/companies/:companyId/pay_schedules/preview`                 |
| **Company.StateTaxes**         | GET    | `/v1/companies/:companyId/tax_requirements`                      |
|                                | GET    | `/v1/companies/:companyId/tax_requirements/:state`               |
|                                | PUT    | `/v1/companies/:companyId/tax_requirements/:state`               |
| **Company.OnboardingOverview** | GET    | `/v1/companies/:companyId/onboarding_status`                     |
| **Company.DocumentSigner**     | GET    | `/v1/companies/:companyId/signatories`                           |
|                                | GET    | `/v1/companies/:companyId/forms`                                 |
|                                | GET    | `/v1/companies/:companyId/forms/:formId`                         |
|                                | GET    | `/v1/companies/:companyId/forms/:formId/pdf`                     |
|                                | POST   | `/v1/companies/:companyId/forms/:formId/sign`                    |
| **Company.AssignSignatory**    | GET    | `/v1/companies/:companyId/signatories`                           |
|                                | POST   | `/v1/companies/:companyId/signatories`                           |
|                                | POST   | `/v1/companies/:companyId/signatories/invite`                    |

#### Contractor components

| Component                        | Method | Path                                                |
| -------------------------------- | ------ | --------------------------------------------------- |
| **Contractor.ContractorList**    | GET    | `/v1/companies/:companyId/contractors`              |
|                                  | DELETE | `/v1/contractors/:contractorUuid`                   |
| **Contractor.ContractorProfile** | GET    | `/v1/contractors/:contractorUuid`                   |
|                                  | POST   | `/v1/companies/:companyId/contractors`              |
|                                  | PUT    | `/v1/contractors/:contractorUuid`                   |
| **Contractor.Address**           | GET    | `/v1/contractors/:contractorUuid`                   |
|                                  | GET    | `/v1/contractors/:contractorUuid/address`           |
|                                  | PUT    | `/v1/contractors/:contractorUuid/address`           |
| **Contractor.PaymentMethod**     | GET    | `/v1/contractors/:contractorUuid/payment_method`    |
|                                  | PUT    | `/v1/contractors/:contractorUuid/payment_method`    |
|                                  | GET    | `/v1/contractors/:contractorUuid/bank_accounts`     |
|                                  | POST   | `/v1/contractors/:contractorUuid/bank_accounts`     |
| **Contractor.NewHireReport**     | GET    | `/v1/contractors/:contractorUuid`                   |
|                                  | PUT    | `/v1/contractors/:contractorUuid`                   |
| **Contractor.ContractorSubmit**  | GET    | `/v1/contractors/:contractorUuid/onboarding_status` |
|                                  | PUT    | `/v1/contractors/:contractorUuid/onboarding_status` |
|                                  | GET    | `/v1/contractors/:contractorUuid`                   |

#### Contractor Payments components

| Component                              | Method | Path                                                    |
| -------------------------------------- | ------ | ------------------------------------------------------- |
| **Contractor.Payments.PaymentList**    | GET    | `/v1/companies/:companyId/contractor_payment_groups`    |
|                                        | GET    | `/v1/companies/:companyId/contractors`                  |
|                                        | GET    | `/v1/companies/:companyId/bank_accounts`                |
|                                        | GET    | `/v1/companies/:companyId/information_requests`         |
|                                        | POST   | `/v1/information_requests/:informationRequestId/submit` |
| **Contractor.Payments.CreatePayment**  | POST   | `/v1/companies/:companyId/contractor_payment_groups`    |
|                                        | POST   | `/v1/contractor_payment_groups/:paymentGroupId/preview` |
|                                        | DELETE | `/v1/contractor_payments/:paymentId`                    |
|                                        | GET    | `/v1/companies/:companyId/contractors`                  |
| **Contractor.Payments.PaymentReceipt** | GET    | `/v1/contractor_payment_groups/:paymentGroupId`         |
|                                        | GET    | `/v1/contractor_payment_groups/:paymentGroupId/receipt` |

#### Payroll components

| Component                        | Method | Path                                                    |
| -------------------------------- | ------ | ------------------------------------------------------- |
| **Payroll.PayrollList**          | GET    | `/v1/companies/:companyId/payrolls`                     |
|                                  | GET    | `/v1/companies/:companyId/pay_schedules`                |
|                                  | GET    | `/v1/companies/:companyId/payrolls/blockers`            |
|                                  | GET    | `/v1/companies/:companyId/wire_in_requests`             |
|                                  | POST   | `/v1/payrolls/:payrollId/skip`                          |
| **Payroll.PayrollConfiguration** | GET    | `/v1/payrolls/:payrollId`                               |
|                                  | PUT    | `/v1/payrolls/:payrollId`                               |
|                                  | POST   | `/v1/payrolls/:payrollId/calculate`                     |
|                                  | GET    | `/v1/companies/:companyId/payrolls/blockers`            |
| **Payroll.PayrollOverview**      | GET    | `/v1/payrolls/:payrollId`                               |
|                                  | POST   | `/v1/payrolls/:payrollId/submit`                        |
|                                  | POST   | `/v1/payrolls/:payrollId/cancel`                        |
|                                  | GET    | `/v1/companies/:companyId/bank_accounts`                |
|                                  | GET    | `/v1/companies/:companyId/employees`                    |
|                                  | GET    | `/v1/wire_in_requests/:wireInRequestId`                 |
|                                  | GET    | `/v1/payrolls/:payrollId/pay_stubs/:employeeId`         |
| **Payroll.PayrollEditEmployee**  | GET    | `/v1/employees/:employeeId`                             |
|                                  | GET    | `/v1/employees/:employeeId/bank_accounts`               |
|                                  | GET    | `/v1/payrolls/:payrollId`                               |
|                                  | PUT    | `/v1/payrolls/:payrollId`                               |
| **Payroll.PayrollReceipts**      | GET    | `/v1/payrolls/:payrollId/receipt`                       |
| **Payroll.PayrollBlockerList**   | GET    | `/v1/companies/:companyId/payrolls/blockers`            |
|                                  | GET    | `/v1/companies/:companyId/recovery_cases`               |
|                                  | GET    | `/v1/companies/:companyId/information_requests`         |
|                                  | POST   | `/v1/information_requests/:informationRequestId/submit` |
|                                  | POST   | `/v1/recovery_cases/:recoveryCaseId/redebit`            |

### Building your allowlist

Pick the components your application uses from the tables above and collect their endpoints into an allowlist. Replace `:param` placeholders with values from the user's session to scope the allowlist to that user. Any parameter you can resolve makes the allowlist tighter.

| What you resolve             | Effect                                                            | Use case                                            |
| ---------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| Nothing                      | Paths keep `:param` placeholders, match any value in that segment | Generic allowlisting, no user scoping               |
| `:companyId` only            | Company is locked, other params match any value                   | Admin who can access any employee in their company  |
| `:companyId` + `:employeeId` | Both are locked                                                   | Self-service employee, restricted to their own data |

For example, if a self-service employee with ID `emp-123` at company `abc` is using the `Employee.FederalTaxes` component, the allowlist entries become:

- `GET /v1/employees/emp-123/federal_taxes`
- `PUT /v1/employees/emp-123/federal_taxes`

A request for `/v1/employees/emp-456/federal_taxes` won't match -- ownership validation is built into the allowlist itself.

### Example: Express proxy with allowlist

The following is a minimal but functional Express proxy. It's broken into three parts: setup and middleware, the request handler, and role mapping.

#### 1. Setup and middleware

The `enforceAllowlist` middleware builds an allowlist from a static endpoint table, replaces `:param` placeholders with session values, then checks whether the incoming request matches any entry.

```typescript
import express from 'express'
import session from 'express-session'

const app = express()
const GUSTO_API_BASE = 'https://api.gusto.com'

interface Endpoint {
  method: string
  path: string
}

const EMPLOYEE_SELF_ONBOARDING_ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/v1/employees/:employeeId' },
  { method: 'GET', path: '/v1/companies/:companyId' },
  { method: 'GET', path: '/v1/companies/:companyId/locations' },
  { method: 'POST', path: '/v1/companies/:companyId/employees' },
  { method: 'PUT', path: '/v1/employees/:employeeId' },
  { method: 'GET', path: '/v1/employees/:employeeId/home_addresses' },
  { method: 'POST', path: '/v1/employees/:employeeId/home_addresses' },
  { method: 'PUT', path: '/v1/home_addresses/:homeAddressUuid' },
  { method: 'GET', path: '/v1/employees/:employeeId/work_addresses' },
  { method: 'POST', path: '/v1/employees/:employeeId/work_addresses' },
  { method: 'PUT', path: '/v1/work_addresses/:workAddressUuid' },
  { method: 'PUT', path: '/v1/employees/:employeeId/onboarding_status' },
  { method: 'GET', path: '/v1/employees/:employeeId/federal_taxes' },
  { method: 'PUT', path: '/v1/employees/:employeeId/federal_taxes' },
  { method: 'GET', path: '/v1/employees/:employeeId/state_taxes' },
  { method: 'PUT', path: '/v1/employees/:employeeId/state_taxes' },
  { method: 'GET', path: '/v1/employees/:employeeId/payment_method' },
  { method: 'PUT', path: '/v1/employees/:employeeId/payment_method' },
  { method: 'GET', path: '/v1/employees/:employeeId/bank_accounts' },
  { method: 'POST', path: '/v1/employees/:employeeId/bank_accounts' },
  { method: 'PUT', path: '/v1/employees/:employeeId/bank_accounts/:bankAccountUuid' },
  { method: 'DELETE', path: '/v1/employees/:employeeId/bank_accounts/:bankAccountUuid' },
  { method: 'GET', path: '/v1/employees/:employeeId/onboarding_status' },
]

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

function resolveAllowlist(endpoints: Endpoint[], variables: Record<string, string>): Endpoint[] {
  return endpoints.map(endpoint => ({
    method: endpoint.method,
    path: endpoint.path.replace(/:([a-zA-Z]+)/g, (_match, param) => {
      return variables[param] ?? '[^/]+'
    }),
  }))
}

function enforceAllowlist(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { user } = req.session

  const allowlist = resolveAllowlist(getAllowlistForUser(user), {
    companyId: user.companyId,
    employeeId: user.employeeId,
  })

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

When a variable is provided, the path segment becomes a literal match (e.g., `/v1/employees/emp-123/federal_taxes`). When a variable isn't available, it becomes a regex pattern `[^/]+` that matches any single path segment. The more variables you resolve, the tighter the allowlist.

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

The example above uses `getAllowlistForUser` to select endpoints based on the user's role. Here's a straightforward implementation that maps roles to endpoint lists:

```typescript
const PAYROLL_ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/v1/companies/:companyId/payrolls' },
  { method: 'GET', path: '/v1/companies/:companyId/pay_schedules' },
  { method: 'GET', path: '/v1/companies/:companyId/payrolls/blockers' },
  { method: 'GET', path: '/v1/companies/:companyId/wire_in_requests' },
  { method: 'POST', path: '/v1/payrolls/:payrollId/skip' },
  { method: 'GET', path: '/v1/payrolls/:payrollId' },
  { method: 'PUT', path: '/v1/payrolls/:payrollId' },
  { method: 'POST', path: '/v1/payrolls/:payrollId/calculate' },
  { method: 'POST', path: '/v1/payrolls/:payrollId/submit' },
  { method: 'POST', path: '/v1/payrolls/:payrollId/cancel' },
  { method: 'GET', path: '/v1/companies/:companyId/bank_accounts' },
  { method: 'GET', path: '/v1/companies/:companyId/employees' },
  { method: 'GET', path: '/v1/payrolls/:payrollId/receipt' },
]

const ONBOARDING_ADMIN_ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/v1/companies/:companyId/employees' },
  { method: 'DELETE', path: '/v1/employees/:employeeId' },
  { method: 'PUT', path: '/v1/employees/:employeeId/onboarding_status' },
  { method: 'GET', path: '/v1/employees/:employeeId' },
  { method: 'PUT', path: '/v1/employees/:employeeId' },
  { method: 'GET', path: '/v1/employees/:employeeId/federal_taxes' },
  { method: 'PUT', path: '/v1/employees/:employeeId/federal_taxes' },
  { method: 'GET', path: '/v1/employees/:employeeId/state_taxes' },
  { method: 'PUT', path: '/v1/employees/:employeeId/state_taxes' },
]

interface SessionUser {
  role: string
  companyId: string
  employeeId: string
  gustoAccessToken: string
}

function getAllowlistForUser(user: SessionUser): Endpoint[] {
  switch (user.role) {
    case 'payroll_admin':
      return [...EMPLOYEE_SELF_ONBOARDING_ENDPOINTS, ...PAYROLL_ENDPOINTS]

    case 'onboarding_admin':
      return ONBOARDING_ADMIN_ENDPOINTS

    case 'employee_self_service':
      return EMPLOYEE_SELF_ONBOARDING_ENDPOINTS

    default:
      return []
  }
}
```

The role mapping is your business logic. Build endpoint arrays for each role from the reference tables above, then compose them as needed.

On the React side, configure the SDK to point at this proxy:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return <GustoProvider config={{ baseUrl: '/gusto-api/' }}>{/* Your application */}</GustoProvider>
}
```

## FAQ

### "Can an authenticated employee access another employee's data?"

Not if you pass the employee ID when resolving the allowlist. The resulting paths only match that specific employee's endpoints -- a request for a different employee ID won't match any entry.

### "We want some admins to not be able to run payroll. How do we enforce that?"

Only include payroll endpoints in the allowlist for roles that should have access. The SDK not rendering payroll UI is a UX decision, not a security control; the proxy enforces the actual restriction.

If your application should never run payroll at all, request that the `payrolls:run` scope be removed from your application entirely.

### "How do we keep our allowlist up to date when the SDK changes?"

When upgrading the SDK, check the release notes for any new or changed API endpoints. You can also compare network traffic before and after upgrading to identify new requests. If an endpoint is missing from your allowlist, the proxy will block it and the SDK component will receive an error -- making gaps easy to spot during development.

## Further Reading

- [Securing your proxy](./getting-started.md#securing-your-proxy) -- SDK Getting Started documentation
- [Gusto API Scopes](https://docs.gusto.com/embedded-payroll/docs/scopes) -- Gusto Embedded API documentation
- [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference) -- API reference, versioning, and endpoint details
