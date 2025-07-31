---
title: Custom HTTP Client
---

# Custom HTTP Client

The Gusto React SDK supports custom HTTP clients, allowing you to provide your own HTTP client implementation for advanced use cases like custom authentication, retry logic, or request/response transformation.

## Usage

### Basic Example

```tsx
import { HTTPClient } from '@gusto/embedded-api/lib/http'
import { GustoProvider } from '@gusto/embedded-react-sdk'

const customHTTPClient = new HTTPClient({
  fetcher: async request => {
    // Your custom HTTP logic here
    return fetch(request)
  },
})

function App() {
  return (
    <GustoProvider
      config={{
        baseUrl: 'https://api.example.com',
        httpClient: customHTTPClient,
      }}
      components={{}}
    >
      {/* Your app components */}
    </GustoProvider>
  )
}
```

## Configuration

The `httpClient` and `headers` configurations are mutually exclusive - you can provide one or the other, but not both.

### With Custom HTTP Client

When using a custom HTTP client, you cannot provide headers since you have full control over the HTTP client:

```tsx
<GustoProvider
  config={{
    baseUrl: 'https://api.example.com',
    httpClient: customHTTPClient,
    // headers cannot be provided when httpClient is used
  }}
  components={{}}
>
```

### With Default HTTP Client (Existing Behavior)

When not providing a custom HTTP client, you can use headers as before:

```tsx
<GustoProvider
  config={{
    baseUrl: 'https://api.example.com',
    headers: {
      'Authorization': 'Bearer your-token',
    },
  }}
  components={{}}
>
```

## Type Safety

The custom HTTP client must implement the same interface as the default `HTTPClient` from `@gusto/embedded-api/lib/http`:

```tsx
import type { CustomHTTPClient } from '@gusto/embedded-react-sdk'

const myCustomClient: CustomHTTPClient = new HTTPClient({
  fetcher: async request => {
    // Your implementation
    return fetch(request)
  },
})
```

## Migration

If you're currently using the `headers` configuration and want to switch to a custom HTTP client:

1. Create your custom HTTP client implementation
2. Replace the `headers` configuration with `httpClient`
3. Move any header logic into your custom HTTP client's fetcher function

This change is backward compatible - existing code using `headers` will continue to work unchanged.
