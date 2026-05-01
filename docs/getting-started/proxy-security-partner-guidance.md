---
title: 'Proxy Security: Partner Guidance'
---

The Gusto API enforces application-level protections (scopes, company-bound tokens, rate limits). Your proxy enforces user-level authorization. Both layers are necessary -- UI-level restrictions alone are not sufficient since users can make API requests directly.

## What to do

1. **Authenticate every request.** Verify the user's session on every proxied request, not just at login.
2. **Allowlist endpoints.** Only forward requests to API endpoints your application actually uses. Deny everything else.
3. **Validate resource ownership.** Verify that the authenticated user is authorized to access the resource in the URL (e.g., an employee should only reach their own employee ID).
4. **Log proxied requests.** Maintain audit logs for security monitoring and incident response.

## Getting the endpoint list

Every SDK component makes a known set of API calls. Paths use named parameters (`:companyId`, `:employeeId`, etc.) that you replace with session values. The more you resolve, the tighter the allowlist:

| What you resolve             | Use case                                            |
| ---------------------------- | --------------------------------------------------- |
| Nothing                      | Generic allowlisting, no user scoping               |
| `:companyId` only            | Admin who can access any employee in their company  |
| `:companyId` + `:employeeId` | Self-service employee, restricted to their own data |

### Option A: JSON endpoint inventory (recommended, any platform)

The SDK ships a machine-readable JSON file listing every block and flow with their endpoints and required variables. It is auto-generated from source on every build and verified in CI.

Import it from the package:

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

Or load the file directly from `node_modules/@gusto/embedded-react-sdk/docs/reference/endpoint-inventory.json` in any language.

The JSON structure:

```json
{
  "blocks": {
    "Employee.FederalTaxes": {
      "endpoints": [
        { "method": "GET", "path": "/v1/employees/:employeeId/federal_taxes" },
        { "method": "PUT", "path": "/v1/employees/:employeeId/federal_taxes" }
      ],
      "variables": ["employeeId"]
    }
  },
  "flows": {
    "Employee.SelfOnboardingFlow": {
      "blocks": ["Employee.Landing", "Employee.Profile", "..."],
      "endpoints": [
        { "method": "GET", "path": "/v1/employees/:employeeId" },
        { "method": "GET", "path": "/v1/companies/:companyId" }
      ],
      "variables": ["companyId", "employeeId"]
    }
  }
}
```

Look up the flows or blocks your app uses, substitute `:param` placeholders with session values, and use the result as your allowlist.

### Option B: Static reference

See the [endpoint reference tables](../reference/endpoint-reference.md) for a human-readable list. Copy the method + path pairs for the components you use and substitute `:param` placeholders with session values at runtime.

## FAQ

**Can an authenticated employee access another employee's data?**
Not if you substitute the employee ID -- the resulting paths only match that employee's endpoints.

**How do we restrict some admins from running payroll?**
Only include payroll endpoints for roles that need them, or request removal of the `payrolls:run` scope entirely.

**How do we keep the allowlist up to date?**
The JSON inventory is auto-derived on every build and verified in CI. Upgrading the SDK automatically reflects endpoint changes.

## Further reading

- [Proxy examples with role-based access](../reference/proxy-examples.md)
- [Endpoint reference tables](../reference/endpoint-reference.md)
- [Securing your proxy](./getting-started.md#securing-your-proxy) -- Getting Started
- [Gusto API Scopes](https://docs.gusto.com/embedded-payroll/docs/scopes)
- [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference)
