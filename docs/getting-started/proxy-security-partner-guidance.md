---
title: Proxy security
description: Secure the SDK proxy with per-request authentication, endpoint allowlisting, resource ownership checks, and audit logging using the SDK endpoint inventory.
---

# Proxy security

The Gusto API enforces application-level protections (scopes, company-bound tokens, rate limits). Your proxy enforces user-level authorization. Both layers are necessary—UI-level restrictions alone aren't sufficient because users can make API requests directly.

## What to do

1. **Authenticate every request.** Verify the user's session on every proxied request, not just at sign-in.
2. **Allowlist endpoints.** Only forward requests to API endpoints your application actually uses. Deny everything else.
3. **Validate resource ownership.** Verify that the authenticated user is authorized to access the resource in the URL (for example, an employee should only reach their own employee ID).
4. **Log proxied requests.** Maintain audit logs for security monitoring and incident response.

## Getting the endpoint list

Every SDK component makes a known set of API calls. Paths use named parameters (`:companyId`, `:employeeId`, and so on) that you replace with session values. The more you resolve, the tighter the allowlist:

| What you resolve             | Use case                                            |
| ---------------------------- | --------------------------------------------------- |
| Nothing                      | Generic allowlisting, no user scoping               |
| `:companyId` only            | Admin who can access any employee in their company  |
| `:companyId` + `:employeeId` | Self-service employee, restricted to their own data |

### Option A: JSON endpoint inventory (recommended, any platform)

The SDK ships a machine-readable JSON file listing every block, flow, and headless hook with their endpoints and required variables. It's auto-generated from source on every build and verified in CI.

Import it from the package:

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

Or load the file directly from `node_modules/@gusto/embedded-react-sdk/docs/guides/endpoint-inventory.json` in any language.

The JSON structure:

```json
{
  "blocks": {
    "EmployeeManagement.FederalTaxes": {
      "endpoints": [
        {
          "method": "GET",
          "path": "/v1/employees/:employeeUuid/federal_taxes",
          "docsUrl": "https://docs.gusto.com/embedded-payroll/v2026-02-01/reference/get-v1-employees-employee_id-federal_taxes"
        },
        {
          "method": "PUT",
          "path": "/v1/employees/:employeeUuid/federal_taxes",
          "docsUrl": "https://docs.gusto.com/embedded-payroll/v2026-02-01/reference/put-v1-employees-employee_id-federal_taxes"
        }
      ],
      "variables": ["employeeUuid"]
    }
  },
  "flows": {
    "CompanyOnboarding.OnboardingFlow": {
      "blocks": ["CompanyOnboarding.FederalTaxes", "CompanyOnboarding.PaySchedule", "..."]
    }
  },
  "hooks": {
    "useFederalTaxesForm": {
      "endpoints": [
        {
          "method": "GET",
          "path": "/v1/employees/:employeeUuid/federal_taxes",
          "docsUrl": "https://docs.gusto.com/embedded-payroll/v2026-02-01/reference/get-v1-employees-employee_id-federal_taxes"
        },
        {
          "method": "PUT",
          "path": "/v1/employees/:employeeUuid/federal_taxes",
          "docsUrl": "https://docs.gusto.com/embedded-payroll/v2026-02-01/reference/put-v1-employees-employee_id-federal_taxes"
        }
      ],
      "variables": ["employeeUuid"]
    }
  }
}
```

Each endpoint's `docsUrl` links to its page in the API reference (omitted for the few endpoints without a public reference page). Blocks and hooks list their `endpoints` directly; a flow lists the `blocks` it composes, and its endpoints are the union of those blocks' endpoints. Look up the flows, blocks, or hooks your app uses, substitute `:param` placeholders with session values, and use the result as your allowlist.

### Option B: Static reference

See the [endpoint reference tables](../guides/endpoint-reference.md) for a human-readable list. Copy the method + path pairs for the components and hooks you use and substitute `:param` placeholders with session values at runtime.

## FAQ

**Can an authenticated employee access another employee's data?**
Not if you substitute the employee ID—the resulting paths only match that employee's endpoints.

**How do we restrict some admins from running payroll?**
Only include payroll endpoints for roles that need them, or request removal of the `payrolls:run` scope entirely.

**How do we keep the allowlist up to date?**
The JSON inventory is auto-derived on every build and verified in CI. Upgrading the SDK automatically reflects endpoint changes.

## Further reading

- [Proxy examples with role-based access](../guides/integration-guide/proxy-examples.md)
- [Endpoint reference tables](../guides/endpoint-reference.md)
- [Gusto API scopes](https://docs.gusto.com/embedded-payroll/docs/scopes)
- [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference)
