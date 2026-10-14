---
title: Authentication
description: Understand system and company access tokens, authenticate users in your application, and forward SDK requests through your backend proxy.
order: 0
---

# Authentication

The SDK sends requests to the backend proxy configured by `GustoProvider`'s `config.baseUrl`. Your proxy authenticates the user in your application, authorizes their request, and forwards it to the Gusto Embedded API with a Gusto access token. The SDK does not acquire or refresh Gusto tokens.

## Gusto access tokens

Gusto tokens authorize your application's API access. They do not encode the permissions of the person signed in to your application.

| Token                | Acts on behalf of                         | Use it for                                                                                                                 |
| -------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| System access token  | Your application                          | Application-level operations, such as creating a partner-managed company or subscribing to webhooks.                       |
| Company access token | A specific company using your application | Company-level operations, such as accessing employees or submitting payroll, within your application's granted API scopes. |

Use a system access token for system-level operations and a company token for regular access to that company's resources. A company token cannot access another company. See the REST API's [Authentication and authorization guide](https://docs.gusto.com/embedded-payroll/docs/authentication-and-authorization) for obtaining, storing, and refreshing tokens, and [API scopes](https://docs.gusto.com/embedded-payroll/docs/api-fundamentals#scopes) for the operations your application may perform.

### Example: creating and accessing a company

Your backend uses a system access token to create company A and receives its UUID and access and refresh tokens.

```mermaid
sequenceDiagram
    participant Backend as Your backend
    participant API as Gusto Embedded API

    rect rgba(80, 130, 200, 0.12)
        Note right of Backend: Authorization: Bearer SYSTEM_ACCESS_TOKEN
        Backend->>API: Create company A
        API-->>Backend: Company A UUID + access and refresh tokens
    end
```

When `EmployeeManagement.EmployeeList` renders, the SDK requests employees for the supplied `companyId`. Your backend authenticates the user, authorizes their access to the requested employees, and then selects the stored token for company A.

```mermaid
sequenceDiagram
    participant SDK as Your SDK app
    participant Backend as Your backend
    participant API as Gusto Embedded API

    rect rgba(70, 160, 110, 0.12)
        Note over SDK: #60;EmployeeManagement.EmployeeList companyId=#quot;A_UUID#quot; /#62;
        SDK->>Backend: GET /v1/companies/A_UUID/employees
        Backend->>Backend: Authenticate session and identify user
        Backend->>Backend: Authorize user's access to company A's employees
        Backend->>Backend: Select company A's stored token
        Note right of Backend: Authorization: Bearer COMPANY_A_TOKEN
        Backend->>API: GET /v1/companies/A_UUID/employees
        API-->>Backend: Company A's employees
        Backend-->>SDK: Company A's employees
    end
```

If your backend forwards a request for company B using company A's token, Gusto rejects the request.

Keep Gusto access tokens, refresh tokens, and application credentials on your backend. Select a company token only after establishing that the authenticated user may access that company. Gusto's company boundary does not determine which resources that user may access within the company.

## Your application's users

Your proxy authenticates each session and determines which companies and resources the user may access. The authorized company determines which Gusto token to use; the session's permissions determine which requests to forward.

**What Gusto sees:** Your application requests company A's payrolls using a company token. Gusto checks the token, API scopes, and company boundary.

```mermaid
sequenceDiagram
    participant Backend as Your backend
    participant API as Gusto Embedded API

    rect rgba(80, 130, 200, 0.12)
        Note right of Backend: Authorization: Bearer COMPANY_A_TOKEN
        Backend->>API: GET /v1/companies/A_UUID/payrolls
        API-->>Backend: Company A's payrolls
    end
```

**What your application sees:** The request comes from a specific user session. Your proxy must decide whether that person may access company A's payrolls before forwarding the request.

For example, your application might authorize a payroll administrator to read company A's payrolls. If a contractor self-onboarding session attempts the same request, your proxy must reject it before it reaches Gusto:

```mermaid
sequenceDiagram
    participant SDK as Your SDK app
    participant Backend as Your backend
    participant API as Gusto Embedded API

    rect rgba(70, 160, 110, 0.12)
        Note over SDK: Session for payroll administrator at company A
        SDK->>Backend: GET /v1/companies/A_UUID/payrolls
        Backend->>Backend: Authenticate session and identify administrator
        Backend->>Backend: Authorize access to company A's payrolls
        Note right of Backend: Authorization: Bearer COMPANY_A_TOKEN
        Backend->>API: GET /v1/companies/A_UUID/payrolls
        API-->>Backend: Company A's payrolls
        Backend-->>SDK: Company A's payrolls
    end

    rect rgba(200, 90, 90, 0.12)
        Note over SDK: Session for contractor self-onboarding at company A
        SDK->>Backend: GET /v1/companies/A_UUID/payrolls
        Backend->>Backend: Authenticate session and identify contractor
        Backend->>Backend: Deny access to company A's payrolls
        Backend-->>SDK: 403 Forbidden
    end
```

Gusto does not authenticate the person signed in to your application or evaluate their session permissions. Even when a company token permits an operation, your proxy must reject requests outside the user's permissions.

Use those permissions to decide which SDK components to display, and enforce them on every proxy request. See [Proxy security](./proxy-security-partner-guidance.md) for examples of mapping session permissions to components and API requests.

## Connecting the SDK to your proxy

Set `GustoProvider`'s `config.baseUrl` to your proxy's address. Use your application's authentication mechanism to identify the user making each request. If that mechanism requires request headers, the SDK supports static headers through `config.headers` and headers computed at request time through [request interceptors](../guides/integration-guide/request-interceptors.md). These browser-side headers authenticate requests to your proxy; supply Gusto credentials only on the backend request to the API.

Your proxy forwards the authorized request and returns the API response to the SDK. Add the `x-gusto-client-ip` header using a client IP established by your backend; signature workflows require it. We also recommend forwarding the SDK's `X-Gusto-SDK-Version` request header so Gusto can identify the SDK version when investigating API traffic.

The [demo application](./example-app.md) provides a runnable example of token management and forwarding. Its proxy does not currently implement user authentication or authorization.
