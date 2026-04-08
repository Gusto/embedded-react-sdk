---
title: Request Interceptors
sidebar_position: 3
---

Request interceptors let you customize HTTP requests and responses in the Gusto Embedded React SDK. They are configured through the `hooks` property on `GustoProvider`'s `config`.

## Hook Types

| Hook | When it runs | Use case |
| --- | --- | --- |
| `beforeCreateRequest` | Before the `Request` object is created | URL modification, method changes |
| `beforeRequest` | Before the request is sent | Add headers, auth tokens, logging |
| `afterSuccess` | After a successful response (2xx) | Response logging, analytics |
| `afterError` | After an error response (4xx, 5xx) or network failure | Error tracking, retry logic |

For complete hook interface details, see the [Speakeasy SDK Hooks documentation](https://www.speakeasy.com/docs/customize/code/sdk-hooks).

## Configuration

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

                return input
              },
            },
          ],
          beforeRequest: [
            {
              beforeRequest: (context, request) => {
                // Access context properties: operationID, baseURL, options, etc.
                request.headers.set('Authorization', 'Bearer ' + getToken())

                return request
              },
            },
          ],
          afterSuccess: [
            {
              afterSuccess: (context, response) => {
                console.log(`${context.operationID} succeeded`)

                return response
              },
            },
          ],
          afterError: [
            {
              afterError: (context, response, error) => {
                console.error(`${context.operationID} failed`)

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

Each hook receives a `context` object with properties like `operationID`, `baseURL`, and `options`. The hook must return its input (or a modified version) to allow the request pipeline to continue.
