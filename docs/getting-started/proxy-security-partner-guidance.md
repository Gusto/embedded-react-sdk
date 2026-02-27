---
title: 'Proxy Security: Partner Guidance'
---

# Proxy Security: Partner Guidance

Security is layered. The Gusto API enforces application-level restrictions (scopes, company-level token binding, rate limits) on every request. Your proxy enforces user-level restrictions (who can do what). Both layers are necessary, and your proxy is the right place to implement user-level authorization -- not the SDK UI.

Hiding a button in the UI is not a security control. Your proxy is.

## What to do

1. **Authenticate every request.** Verify the user's session on every proxied request, not just at login.
2. **Allowlist endpoints.** Only forward requests to API endpoints your application actually uses. Deny everything else.
3. **Validate resource ownership.** Verify that the authenticated user is authorized to access the resource in the URL (e.g., an employee should only reach their own employee ID).
4. **Log proxied requests.** Maintain audit logs for security monitoring and incident response.

## Getting the endpoint list

Every SDK component makes a known set of API calls. Paths use named parameters (`:companyId`, `:employeeId`, etc.) that you replace with values from the user's session. The more parameters you resolve, the tighter the allowlist.

| What you resolve             | Effect                                 | Use case                                            |
| ---------------------------- | -------------------------------------- | --------------------------------------------------- |
| Nothing                      | Paths keep `:param` placeholders       | Generic allowlisting, no user scoping               |
| `:companyId` only            | Company locked, other params match any | Admin who can access any employee in their company  |
| `:companyId` + `:employeeId` | Both locked                            | Self-service employee, restricted to their own data |

Choose the approach that fits your stack:

### Option A: JSON endpoint inventory (recommended, any platform)

The SDK ships a machine-readable JSON file at `docs/reference/endpoint-inventory.json` that contains every block and flow with their endpoints and the variables you need to resolve. This is auto-generated from the SDK source code on every build and verified in CI.

Import it programmatically from the package:

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

Or load it directly from the SDK package in any language:

```python
import json

with open("node_modules/@gusto/embedded-react-sdk/docs/reference/endpoint-inventory.json") as f:
    inventory = json.load(f)
```

The JSON structure includes endpoints and the variables each block expects:

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

Look up the flows or blocks your app uses, substitute `:param` placeholders with values from the user's session, and use the result as your proxy allowlist. The `variables` array tells you exactly which session values you need for each block or flow.

### Option B: Static reference

If you prefer to build your allowlist manually, see the [endpoint reference tables](../reference/endpoint-reference.md) for a human-readable list of every SDK component and the API endpoints it calls. Copy the method + path pairs for the components you use into your proxy configuration and substitute `:param` placeholders with session values at runtime.

## FAQ

**Can an authenticated employee access another employee's data?**
Not if you substitute the employee ID when building the allowlist. The resulting paths only match that specific employee's endpoints.

**How do we restrict some admins from running payroll?**
Only include payroll endpoints in the allowlist for roles that need them. If your application should never run payroll, request that the `payrolls:run` scope be removed entirely.

**How do we keep the allowlist up to date?**
The JSON inventory is automatically derived from the SDK's source code on every build. A CI check verifies the committed inventory matches the codebase, so it cannot go stale. When you upgrade the SDK, the JSON reflects any endpoint changes automatically.

## Further reading

- [Proxy examples with role-based access](../reference/proxy-examples.md)
- [Endpoint reference tables](../reference/endpoint-reference.md)
- [Securing your proxy](./getting-started.md#securing-your-proxy) -- Getting Started
- [Gusto API Scopes](https://docs.gusto.com/embedded-payroll/docs/scopes)
- [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference)
