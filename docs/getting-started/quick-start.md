---
title: Quick Start
description: Install the Gusto Embedded React SDK, configure GustoProvider and a backend proxy, customize the UI, and try a runnable demo locally.
order: 2
---

This guide is for developers building with the Gusto Embedded React SDK.

> **Install the SDK** ([@gusto/embedded-react-sdk](https://www.npmjs.com/package/@gusto/embedded-react-sdk)):
>
> ```bash title="Command line"
> npm add @gusto/embedded-react-sdk
> ```

After installation you'll need to:

1. **Set up your proxy.** Stand up a backend proxy that forwards SDK requests to the Gusto Embedded API and handles authentication.
2. **Configure GustoProvider.** Wrap your app in `GustoProvider` and point its `baseUrl` at your proxy.
3. **Include styles.** Import the SDK's baseline stylesheet (and customize from there).

[Clone our demo application](#try-it-with-the-demo-application) or read more about [configuration](#configuration).

## Try it with the demo application

Ramp quickly on developing with the SDK by cloning the [`embedded-react-sdk-demo-app`](https://github.com/Gusto/embedded-react-sdk-demo-app), a React frontend wired to an Express proxy that runs against your own demo company in Gusto.

```bash title="Command line"
git clone https://github.com/Gusto/embedded-react-sdk-demo-app.git
```

See the [demo application's README](https://github.com/Gusto/embedded-react-sdk-demo-app#readme) for full installation and usage instructions.

## Configuration

### Backend proxy

A backend proxy is required when building with the React SDK. SDK components don't call the Gusto Embedded API directly—they call your proxy, which forwards requests with the correct auth headers attached. The proxy gives you a place to handle three things:

- **Authentication.** Your proxy acquires OAuth2 tokens from the Gusto Embedded API on behalf of the authenticated user. See [Authentication](./authentication.mdx) for the full setup.
- **User IP address.** Some workflows require users to sign forms, which needs the user's IP. Your proxy must add the `x-gusto-client-ip` header to forwarded requests so the IP can't be spoofed client-side.
- **Authorization.** User-level authorization is your responsibility. At minimum, your proxy should authenticate every request, allowlist endpoints, validate resource ownership, and log proxied traffic. See [Proxy Security](./proxy-security-partner-guidance.md) for detailed practices.

For a complete working example, see [`proxy.ts`](https://github.com/Gusto/embedded-react-sdk-demo-app/blob/main/backend/src/proxy.ts) in the [demo application](./example-app.md), which implements OAuth token management, IP forwarding, and request proxying in Express.

The SDK mirrors the [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference/whats-new-in-v2025-06-15) with a 1:1 endpoint mapping, so your proxy doesn't need to transform requests—it just forwards them with authentication attached.

### GustoProvider

`GustoProvider` configures the SDK at the application level. Wrap your top-level component tree so all SDK components have access to the necessary configurations:

```jsx title="App.tsx"
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return <GustoProvider config={{ baseUrl: '/proxy-url/' }}>...</GustoProvider>
}

export default App
```

The `baseUrl` property is the address of the backend proxy you set up above.

### Styles

The SDK ships with baseline styles for its UI components. Include them with:

```typescript
import '@gusto/embedded-react-sdk/style.css'
```

The SDK is designed to take on your application's look and feel via theming and component adapters. See [Customizing SDK UI](../integration-guide/customizing-sdk-ui.md) for the full guide.

## Next steps

- Read [Authentication](./authentication.mdx) for the full picture on how your proxy should acquire and use OAuth tokens in production.
- Review [Proxy Security](./proxy-security-partner-guidance.md) before pointing a proxy at real partner traffic.
- Explore the [Reference](../reference/index.md) for the pre-built flows you can drop into your app.
