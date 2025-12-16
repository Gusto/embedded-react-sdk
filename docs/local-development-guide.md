# Local Development Guide

## Problem: Excessive API Requests During HMR

When developing locally with `npm link`, you may experience hundreds of API requests when making changes to the SDK, especially in quick succession. This happens due to:

1. **QueryClient recreation on HMR** - The SDK creates its own `QueryClient` internally. When the SDK rebuilds, HMR in your consumer app (gws-flows) detects the change and remounts components, creating a NEW `QueryClient` and losing ALL cached data
2. **Query invalidation after mutations** - The SDK invalidates all queries after mutations to ensure data consistency (this is intentional)
3. **Multiple Suspense queries** - SDK components use `useXXXSuspense` hooks that all fire simultaneously when cache is lost
4. **Multiple React instances** - `npm link` can cause duplicate React/React-Query instances if not properly configured

## Solution Overview

The SDK now **automatically persists** the `QueryClient` across HMR updates by storing it on the `window` object. This means:

1. **QueryClient persistence** - The same `QueryClient` instance is reused across SDK rebuilds
2. **Better query defaults** - 30s stale time, disabled refetchOnWindowFocus/refetchOnMount/refetchOnReconnect
3. **Increased build debounce** - Waits longer before rebuilding to batch rapid changes (1000ms + 500ms file stabilization)

**Note**: The SDK intentionally invalidates all queries after mutations to ensure data consistency. This is expected behavior.

## Setup Instructions

### 1. SDK Setup (embedded-react-sdk)

Run the dev setup script to link React from the consumer app:

```bash
npm run dev:setup
```

This ensures the SDK uses the same React instance as your consumer app (prevents "Invalid Hook" errors).

Then start the dev build:

```bash
npm run dev
```

### 2. Consumer App Setup (gws-flows)

**No changes needed!** The fix is entirely within the SDK.

Just make sure your consumer app is running:

```bash
# In gws-flows
npm run dev  # or yarn dev
```

### 3. Optional: Vite Configuration (Consumer App)

If you want to optimize HMR further, you can configure Vite to watch the linked package:

```typescript
// vite.config.ts (in gws-flows)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Watch the linked SDK for changes
      ignored: ['!**/node_modules/@gusto/embedded-react-sdk/**'],
    },
  },
  optimizeDeps: {
    // Exclude the linked SDK from pre-bundling
    exclude: ['@gusto/embedded-react-sdk'],
  },
})
```

## Verification

After the fix, you should see:

1. **Drastically reduced API calls** - Only new/necessary queries execute
2. **Preserved cache** - Data persists across HMR updates
3. **Fast HMR** - Changes apply quickly without full refetches
4. **No duplicate React warnings** - No "Invalid hook call" errors (after running `dev:setup`)

## Troubleshooting

### Still seeing duplicate React errors?

Make sure you've linked React from the consumer to the SDK:

```bash
cd embedded-react-sdk
npm link ../gws-flows/node_modules/react
npm link ../gws-flows/node_modules/@tanstack/react-query
```

### QueryClient still recreating?

This shouldn't happen anymore with the window-based persistence. If it does:

1. Check the browser console for errors
2. Verify you're using the updated SDK version
3. Try clearing your browser cache and restarting both dev servers

### Still seeing excessive API calls?

Check the React Query DevTools to see which queries are refetching:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <GustoProvider queryClient={queryClient}>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </GustoProvider>
  )
}
```

## Default Query Behavior

The SDK creates a `QueryClient` with these defaults (optimized for development):

- `retry: false` - No automatic retries
- `staleTime: 30000` - Data stays fresh for 30 seconds
- `refetchOnWindowFocus: false` - No refetch when window regains focus
- `refetchOnMount: false` - No refetch when component mounts
- `refetchOnReconnect: false` - No refetch when network reconnects

These defaults reduce unnecessary API calls during development. If you need different settings, you can provide your own `QueryClient`:

```typescript
import { QueryClient } from '@tanstack/react-query'

const customQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 3,
    },
  },
})

<GustoProvider config={{...}} queryClient={customQueryClient} />
```

## Advanced: Debugging Query Behavior

To see when queries are created/refetched:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: error => console.error('Query error:', error),
      onSuccess: data => console.log('Query success:', data),
    },
    mutations: {
      onError: error => console.error('Mutation error:', error),
      onSuccess: data => console.log('Mutation success:', data),
      onSettled: () => console.log('Mutation settled'),
    },
  },
})
```
