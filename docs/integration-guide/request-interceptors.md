---
title: Customizing HTTP Requests with Request Interceptors
---

Request interceptors let you customize HTTP requests and responses in the Gusto Embedded React SDK.

## Hook Types

- `beforeCreateRequest` - Execute before creating the `Request` object (URL modification, method changes)
- `beforeRequest` - Modify requests before they're sent (add headers, auth tokens, etc.)
- `afterSuccess` - Handle successful responses (2xx status codes)
- `afterError` - Handle error responses (4xx, 5xx) or network failures

For complete hook interface details, see the [Speakeasy SDK Hooks documentation](https://www.speakeasy.com/docs/customize/code/sdk-hooks).

## Basic Usage

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider
      config={{
        baseUrl: '/api/gusto/',
        hooks: {
          beforeCreateRequest: [
            {
              beforeCreateRequest: (context, input) => {
                // Access context properties: operationID, baseURL, options, etc.
                // Modify URL, method, etc. before Request object is created

                // Must return the input
                return input
              },
            },
          ],
          beforeRequest: [
            {
              beforeRequest: (context, request) => {
                // Access context properties: operationID, baseURL, options, etc.
                request.headers.set('Authorization', 'Bearer ' + getToken())

                // Must return the request
                return request
              },
            },
          ],
          afterSuccess: [
            {
              afterSuccess: (context, response) => {
                console.log(`✅ ${context.operationID} succeeded`)

                // Must return the response
                return response
              },
            },
          ],
          afterError: [
            {
              afterError: (context, response, error) => {
                console.error(`❌ ${context.operationID} failed`)

                // Must return both response and error
                return { response, error }
              },
            },
          ],
        },
      }}
    >
      <YourComponents />
    </GustoProvider>
  )
}
```
