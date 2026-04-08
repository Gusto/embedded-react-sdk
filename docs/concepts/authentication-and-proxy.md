---
title: Authentication and Proxy
sidebar_position: 4
---

The SDK does not call the Gusto API directly. All API requests are routed through your backend proxy, which handles OAuth2 token management and enforces user-level authorization.

## Why a proxy is required

The SDK runs in the browser. Exposing API credentials or OAuth tokens to the client would be a security risk. Instead, the SDK sends requests to your backend, which:

1. Verifies the user's session
2. Acquires or refreshes an OAuth2 token from the Gusto API
3. Forwards the request to Gusto with the token attached
4. Returns the response to the SDK

## Setting up the proxy connection

Point the SDK to your proxy with the `baseUrl` config option on `GustoProvider`:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function App({ children }) {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      {children}
    </GustoProvider>
  )
}
```

The SDK appends Gusto API paths to this base URL. For example, a request to `/v1/companies/:companyId/employees` becomes `/api/gusto/v1/companies/:companyId/employees`.

## Adding headers

### Static headers

For headers that don't change (API keys, partner identifiers), pass them in `config.headers`:

```tsx
<GustoProvider
  config={{
    baseUrl: '/api/gusto/',
    headers: {
      'Authorization': 'Bearer your-api-key',
      'X-Partner-Id': 'partner_123',
    },
  }}
>
```

### Dynamic headers via request interceptors

For headers computed at request time (e.g., refreshing tokens), use the `hooks.beforeRequest` interceptor:

```tsx
<GustoProvider
  config={{
    baseUrl: '/api/gusto/',
    hooks: {
      beforeRequest: [
        {
          beforeRequest: (context, request) => {
            request.headers.set('Authorization', 'Bearer ' + getToken())
            return request
          },
        },
      ],
    },
  }}
>
```

### Client IP header for form signing

Some Gusto API endpoints require the end user's IP address for form signing compliance. Pass the `x-gusto-client-ip` header from your proxy with the user's real IP address.

## Proxy security

The Gusto API enforces application-level protections (scopes, company-bound tokens, rate limits). Your proxy enforces **user-level** authorization. Both layers are necessary — UI restrictions alone are not sufficient since users can make API requests directly.

### Requirements

1. **Authenticate every request** — verify the user's session on every proxied request, not just at login.
2. **Allowlist endpoints** — only forward requests to API endpoints your application uses. Deny everything else.
3. **Validate resource ownership** — verify that the authenticated user is authorized to access the resource in the URL (e.g., an employee should only reach their own employee ID).
4. **Log proxied requests** — maintain audit logs for security monitoring and incident response.

### Endpoint allowlisting

The SDK ships a machine-readable JSON file listing every Block and Flow with their endpoints. Import it from the package:

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

The JSON maps each component to its API endpoints and required URL parameters:

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

Look up the components your app uses, substitute `:param` placeholders with session values, and use the result as your allowlist. The inventory is auto-generated on every build and verified in CI, so upgrading the SDK automatically reflects endpoint changes.

### Scoping by role

The tighter you resolve URL parameters, the more restrictive the allowlist:

| What you resolve | Use case |
| --- | --- |
| Nothing | Generic allowlisting, no user scoping |
| `:companyId` only | Admin who can access any employee in their company |
| `:companyId` + `:employeeId` | Self-service employee, restricted to their own data |
