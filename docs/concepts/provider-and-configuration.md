---
title: Provider and Configuration
sidebar_position: 2
---

`GustoProvider` is the root component that must wrap all SDK components. It configures API connectivity, theming, internationalization, and component adapters.

## Basic setup

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function App({ children }) {
  return (
    <GustoProvider
      config={{
        baseUrl: '/api/gusto/',
      }}
    >
      {children}
    </GustoProvider>
  )
}
```

## Config options

The `config` prop accepts an `APIConfig` object:

### `baseUrl` (required)

The URL of your backend proxy. All SDK API calls are sent to this base URL. See [Authentication and Proxy](./authentication-and-proxy.md).

```tsx
config={{ baseUrl: '/api/gusto/' }}
```

### `headers`

Static headers attached to every API request. Useful for API keys or simple auth tokens.

```tsx
config={{
  baseUrl: '/api/gusto/',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'X-Custom-Header': 'value',
  },
}}
```

### `hooks`

Request interceptors for dynamic request/response modification. Four hook points are available:

- `beforeCreateRequest` — modify URL or method before the `Request` object is created
- `beforeRequest` — modify the request before it's sent (e.g., add dynamic auth headers)
- `afterSuccess` — handle successful responses (2xx)
- `afterError` — handle error responses (4xx, 5xx) or network failures

```tsx
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
```

### `observability`

Error and performance tracking hooks. See [Error Handling](./error-handling.md).

```tsx
config={{
  baseUrl: '/api/gusto/',
  observability: {
    onError: (error) => Sentry.captureException(error),
    onMetric: (metric) => console.log(metric.name, metric.value),
  },
}}
```

## Top-level props

Beyond `config`, `GustoProvider` accepts these props:

| Prop | Type | Description |
| --- | --- | --- |
| `theme` | `GustoSDKTheme` | CSS variable overrides for colors, typography, shadows. See [Theming](./theming-and-customization.md). |
| `components` | `Partial<ComponentsContextType>` | Override SDK UI primitives with your own. See [Theming and Customization](./theming-and-customization.md). |
| `dictionary` | `ResourceDictionary` | i18n string overrides. See [Internationalization](./i18n.md). |
| `lng` | `string` | Language code (default: `'en'`). |
| `locale` | `string` | Locale for number/date formatting (default: `'en-US'`). |
| `currency` | `string` | Currency code (default: `'USD'`). |
| `queryClient` | `QueryClient` | Custom TanStack Query client instance. |

## Full example

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function App({ children }) {
  return (
    <GustoProvider
      config={{
        baseUrl: '/api/gusto/',
        headers: { 'X-Partner-Id': 'partner_123' },
        observability: {
          onError: (error) => errorTracker.capture(error),
        },
      }}
      theme={{
        colorPrimary: '#1a73e8',
        fontFamily: 'Inter, sans-serif',
      }}
      dictionary={{
        en: {
          'Employee.PaymentMethod': {
            title: 'Set up direct deposit',
          },
        },
      }}
    >
      {children}
    </GustoProvider>
  )
}
```

## Provider stack

Internally, `GustoProvider` composes several providers in this order:

```
GustoProvider
  → ComponentsProvider (UI component map)
    → LoadingIndicatorProvider
      → ObservabilityProvider
        → ErrorBoundary (top-level)
          → ThemeProvider
            → LocaleProvider
              → I18nextProvider
                → ApiProvider (React Query + HTTP client)
                  → {children}
```

You don't need to set up any of these individually — `GustoProvider` handles the full stack.
