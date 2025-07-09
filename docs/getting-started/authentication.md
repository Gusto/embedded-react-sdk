---
title: Authentication
order: 0
---

## Authentication

To get started, you’ll need to create a way to properly create and retrieve access tokens on behalf of your authenticated user from your application.

Since there are a vast number of ways this might work for a partner, what we can suggest to get up and running is to implement a proxy server that handles translating requests from the SDK to the Gusto Embedded API.

### How access tokens work

To maximize compatibility with a wide range of partner security postures and implementations, the Gusto Embedded React SDK does not include built-in OAuth2 token acquisition and refresh flows but instead is built to fit into a partner’s existing flows.

The most simple implementation is one where a partner has a backend service that acquires OAuth2 tokens from the Gusto Embedded API on behalf of an authenticated user and then proxies calls to the Gusto Embedded API using those tokens. The following provides a high level graphical representation of how that configuration would look:

![](https://files.readme.io/161c4c0c0952486a811a18c71d959a8bd74ca4884f2fc1abe39737c988f3a05f-image.png)

The `<GustoProvider>` can receive a `baseUrl` that can be configured with the address of your backend proxy service and can also be used if necessary to pass along vendor authentication credentials.

```jsx react
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return <GustoProvider config={{ baseUrl: '/proxy-url/' }}>Your app here!</GustoProvider>
}

export default App
```

### How components utilize the API

Components which are part of the Gusto Embedded SDK utilize the `baseUrl` to call the appropriate public Gusto API endpoint. These components are custom built in order to abstract complicated API interactions. The baseUrl serves as a foundational element within the Embedded SDK framework, directing its components to the correct public Gusto API endpoint.

For example, the `<EmployeeList>` component accesses a list of employees via the documented Gusto Embedded API endpoint at `/v1/companies/<company-uuid>/employees`. When your proxy server receives an inbound request, it can verify authentication & authorization, then after it’s been identified as valid, retrieve or create an OAuth2 token, and finally use that token create a request to Gusto Embedded API’s endpoint at `/v1/companies/<company-uuid>/employees` , returning the result received at that endpoint.
