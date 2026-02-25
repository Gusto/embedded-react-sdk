---
title: Getting Started
order: 2
---

## CodeSandbox

[We have a demo environment in CodeSandbox](https://codesandbox.io/p/devbox/happy-ardinghelli-nzpslw?file=%2Fsrc%2FApp.jsx). You can view the project setup there which puts together what you are going to see in this guide with a working example.

## Installing the SDK

To get started with the Gusto Embedded React SDK, first install it from NPM via the package manager of your choice. You can see the SDK published to NPM here at [@gusto/embedded-react-sdk.](https://www.npmjs.com/package/@gusto/embedded-react-sdk)

In this case, installing via NPM:

```
npm i @gusto/embedded-react-sdk
```

## Configuring the API provider

The `GustoProvider` is used to configure the SDK at the application level. It must wrap the top-level component tree (typically at the root of the application) to ensure SDK components have access to the necessary configurations.

```jsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return <GustoProvider config={{ baseUrl: '/proxy-url/' }}>...</GustoProvider>
}

export default App
```

The `baseUrl` property is configured with the address of your backend proxy which is detailed further in the following section.

## Configuring a backend proxy

When building with the React SDK, a backend proxy is required. React SDK components do not make calls to the Gusto Embedded API directly. Instead, the `baseUrl` configuration defines the URL of your proxy server. This proxy layer gives you complete control over requests sent to Gusto, which is essential for:

1. Authentication
2. Providing the user IP address for form signing operations

The React SDK is designed to mirror the [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference/whats-new-in-v2025-06-15) with a 1:1 mapping of endpoints. The SDK maintains consistent naming conventions, parameters, and response structures with the Gusto API.

Your proxy server simply needs to forward any incoming SDK requests to the corresponding Embedded API endpoints. The proxy's main task is adding the necessary authentication headers before forwarding the request onwards. Since the SDK requests are already in the Embedded API format, no extra endpoint mapping or request transformation is required.

### Using the proxy for authentication

The proxy layer allows for authentication. The recommended approach is to use a backend service that acquires OAuth2 tokens from the Gusto Embedded API for authenticated users and proxies API calls using those tokens. Learn more about configuring this and setting up authentication in the `Authentication` section.

### Using the proxy to provide the user IP address

Some UI workflows require users to sign forms, which need the user's IP address for security purposes. To prevent vulnerabilities such as IP address spoofing, this information must be provided by your proxy server rather than collected client-side.

Your proxy server can provide the IP address by adding the `x-gusto-client-ip` header with the user IP address to all forwarded requests on the backend. By setting this header once in your proxy it will be configured for all form signing operations.

### Securing your proxy

Your proxy server is more than just a pass-through -- it is the authorization layer between your users and the Gusto Embedded API. While the Gusto API provides several built-in security mechanisms, your proxy is where you enforce your own application's user-level permissions. Relying solely on the SDK not rendering certain UI is not sufficient; an authenticated user with access to your proxy could craft API requests directly.

#### Built-in protections from the Gusto API

The Gusto Embedded API enforces several layers of security on every request, regardless of how your proxy is configured:

- **API scopes** restrict what your entire application is allowed to do. Each application is granted scopes based on its use case (e.g., `employees:read`, `payrolls:run`). Any request outside your granted scopes is rejected with a `403 Forbidden` response. You can view and manage your scopes in the [Developer Portal](https://dev.gusto.com). To request scope changes, contact your Technical Solutions representative. We recommend requesting only the scopes you need.
- **OAuth token resource binding** ensures that each access token is bound to a specific company. A token issued for one of your partner-managed companies cannot be used to access another company's data.
- **Optimistic version control** prevents conflicting updates. Every updatable resource includes a `version` field, and updates are rejected with `409 Conflict` if the resource has changed since it was last fetched.
- **Rate limiting** is enforced at 200 requests per minute per application-user pair. Requests exceeding this limit receive a `429 Too Many Requests` response.

These protections serve as your baseline. Even if your proxy forwarded every request without any additional checks, the Gusto API would still enforce scope restrictions, company-level isolation, and rate limits.

#### Recommended proxy-level security practices

The protections above operate at the application level. User-level authorization -- controlling which users in your application can perform which actions -- is your responsibility to enforce at the proxy. This is by design: you know your users' roles and permissions better than Gusto does.

We recommend implementing the following practices in your proxy:

1. **Authenticate every request.** Verify the user's session or identity on every proxied request, not just at login. Reject requests from unauthenticated or expired sessions before they reach the Gusto API.

2. **Implement endpoint allowlisting.** Only forward requests to the Gusto API endpoints your application actually uses. Deny everything else. This limits the attack surface even if an authenticated user attempts to call endpoints that your UI does not expose.

3. **Enforce role-based access control.** If your application has user roles with different permission levels (e.g., an admin who can run payroll vs. one who cannot), map those roles to the specific Gusto API endpoints and HTTP methods each role is permitted to use. Deny requests that fall outside the user's allowed set.

4. **Validate resource ownership.** When a request includes a resource identifier (such as an employee ID in the URL path), verify that the authenticated user is authorized to access that specific resource. For example, in a self-onboarding flow, an employee should only be able to access endpoints for their own employee ID, not another employee's.

5. **Validate request payloads.** Inspect request bodies before forwarding them. Do not blindly pass through arbitrary JSON to the Gusto API.

6. **Log proxied requests.** Maintain audit logs of all requests forwarded through your proxy for security monitoring, debugging, and incident response.

#### Further reading

For complete, runnable Express.js examples and detailed guidance on building endpoint allowlists, role-based access control, and resource ownership validation, see the [Proxy Security: Partner Guidance](./proxy-security-partner-guidance.md).

## Including styles

The Gusto Embedded React SDK ships with preliminary styles for the UI components as a baseline. Those can be included by importing the following stylesheet:

```typescript
import '@gusto/embedded-react-sdk/style.css'
```

See [Customizing SDK UI](../integration-guide/customizing-sdk-ui.md) for complete guidance on UI customization and making the SDK take on the look and feel of your application.
