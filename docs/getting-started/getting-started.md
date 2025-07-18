---
title: Getting Started
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

The React SDK is designed to mirror the [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference/whats-new-in-v2024-04-01) with a 1:1 mapping of endpoints. The SDK maintains consistent naming conventions, parameters, and response structures with the Gusto API.

Your proxy server simply needs to forward any incoming SDK requests to the corresponding Embedded API endpoints. The proxy's main task is adding the necessary authentication headers before forwarding the request onwards. Since the SDK requests are already in the Embedded API format, no extra endpoint mapping or request transformation is required.

### Using the proxy for authentication

The proxy layer allows for authentication. The recommended approach is to use a backend service that acquires OAuth2 tokens from the Gusto Embedded API for authenticated users and proxies API calls using those tokens. Learn more about configuring this and setting up authentication in the `Authentication` section.

### Using the proxy to provide the user IP address

Some UI workflows require users to sign forms, which need the user's IP address for security purposes. To prevent vulnerabilities such as IP address spoofing, this information must be provided by your proxy server rather than collected client-side.

Your proxy server can provide the IP address by adding the `x-gusto-client-ip` header with the user IP address to all forwarded requests on the backend. By setting this header once in your proxy it will be configured for all form signing operations.

## Including styles

The Gusto Embedded React SDK ships with preliminary styles for the UI components as a baseline. Those can be included by including the following import:

```typescript
import '@gusto/embedded-react-sdk/style.css'
```

See the `Styles and Theming` section for additional UI customization and making the SDK take on the look and feel of your application.
