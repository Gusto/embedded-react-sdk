## CodeSandbox

[We have a demo environment in CodeSandbox](https://codesandbox.io/p/devbox/happy-ardinghelli-nzpslw?file=%2Fsrc%2FApp.jsx). You can view the project setup there which puts together what you are going to see in this guide with a working example.

## Installing the SDK

To get started with the Gusto Embedded React SDK, first install it from NPM via the package manager of your choice. You can see the SDK published to NPM here at [@gusto/embedded-react-sdk.](https://www.npmjs.com/package/@gusto/embedded-react-sdk)

In this case, installing via NPM:

```
npm i @gusto/embedded-react-sdk
```

## Configuring the API provider

The `GustoApiProvider` is used to configure the SDK at the application level. It must wrap the top-level component tree (typically at the root of the application) to ensure SDK components have access to the necessary configurations.

```jsx
import { GustoApiProvider } from '@gusto/embedded-react-sdk'

function App() {
  return <GustoApiProvider config={{ baseUrl: '/proxy-url/' }}>...</GustoApiProvider>
}

export default App
```

The `baseUrl` property is typically configured with the address of a backend proxy. The recommended approach is to use a backend service that acquires OAuth2 tokens from the Gusto Embedded API for authenticated users and proxies API calls using those tokens. Learn more about configurintg this and setting up authentication in the `Authentication` section.

For more configurations available on the GustoApiProvider, see the docs in the `Styles and Theming` and `Translation` sections.

## Including styles

The Gusto Embedded React SDK ships with preliminary styles for the UI components as a baseline. Those can be included by including the following import:

```typescript
import '@gusto/embedded-react-sdk/style.css'
```

See the `Styles and Theming` section for additional UI customization and making the SDK take on the look and feel of your application.
