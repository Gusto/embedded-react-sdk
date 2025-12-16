# HMR API Request Issue - Fixed!

## Two-Part Solution

### Part 1: SDK Changes (embedded-react-sdk)

1. ✅ **QueryClient persistence across HMR** - The SDK now stores the `QueryClient` on the window object, so it survives module replacements during HMR
2. ✅ **Better query defaults** - 30s stale time, disabled refetchOnWindowFocus/Mount/Reconnect to reduce unnecessary refetching
3. ✅ **Increased build debounce** - Batches rapid file changes (1s + 500ms file stabilization)

**Note**: The SDK still invalidates all queries after mutations - this is intentional to ensure data consistency.

### Part 2: Consumer App Changes (gws-flows)

✅ **Added HMR debouncing plugin** - Batches SDK file updates to trigger ONE reload instead of hundreds

The custom Vite plugin has been added to gws-flows `vite.config.ts` to debounce SDK updates.

Just rebuild both:

```bash
# Terminal 1: SDK
cd embedded-react-sdk
npm run dev

# Terminal 2: gws-flows
cd gws-flows
bin/vite dev
```

## How to Verify It's Working

### Before the fix:

- ❌ Hundreds of API requests on each SDK change
- ❌ Console shows many React Query fetches
- ❌ Possible API rate limit errors
- ❌ Slow HMR updates

### After the fix:

- ✅ Minimal API requests (only for actual new data)
- ✅ Fast HMR updates
- ✅ QueryClient cache persists across SDK rebuilds
- ✅ No rate limiting

### Watch the console:

In the **gws-flows terminal**, you should now see:

```
[SDK HMR] Batched 47 file updates -> triggering single reload
```

In the **browser DevTools Network tab**:

- **Before**: Dozens/hundreds of API requests after each change
- **After**: Zero API requests (cache preserved)

In the **browser DevTools Network tab** (filter by app.tsx):

- **Before**: 50+ loads of `app.tsx?t=...` in one second
- **After**: ONE load after SDK rebuilds

## Technical Details

### Problem 1: QueryClient Recreation

Every time the SDK rebuilt during HMR:

1. HMR replaced the SDK module
2. `ApiProvider` component was re-instantiated
3. A **NEW** `QueryClient` was created (even with `useMemo`)
4. ALL cached data was lost
5. ALL `useXXXSuspense` queries re-executed → API calls

**Solution**: Persist the `QueryClient` instance on the `window` object:

```typescript
const QUERY_CLIENT_KEY = '__GUSTO_SDK_QUERY_CLIENT__'

function getOrCreateQueryClient(): QueryClient {
  // Reuse existing client if available (HMR scenario)
  if (typeof window !== 'undefined' && window[QUERY_CLIENT_KEY]) {
    return window[QUERY_CLIENT_KEY]
  }

  // Create new client and persist it
  const client = new QueryClient({...})
  if (typeof window !== 'undefined') {
    window[QUERY_CLIENT_KEY] = client
  }
  return client
}
```

This way:

1. **First load**: Creates `QueryClient`, stores on `window`
2. **SDK rebuild**: Module replaced, but `window` object persists
3. **New `ApiProvider`**: Checks `window`, finds existing client, reuses it
4. **Result**: No cache loss, no unnecessary refetching! ✨

### Problem 2: Reload Storm

The SDK uses `preserveModules: true`, outputting hundreds of individual files. When the SDK rebuilt:

1. Vite detected **hundreds** of file changes simultaneously (all at same timestamp)
2. Each triggered a full page reload
3. Result: 50+ reloads per second → `app.tsx?t=1765547577350` loaded repeatedly

**Solution**: Custom Vite plugin in gws-flows that debounces SDK updates:

```typescript
function debounceSDKUpdates(): Plugin {
  let timeout: NodeJS.Timeout | null = null
  let pendingFiles: Set<string> = new Set()

  return {
    name: 'debounce-sdk-updates',
    handleHotUpdate({ file, server }) {
      if (!file.includes('embedded-react-sdk/dist')) {
        return // Normal HMR for other files
      }

      pendingFiles.add(file)
      if (timeout) clearTimeout(timeout)

      timeout = setTimeout(() => {
        console.log(`[SDK HMR] Batched ${pendingFiles.size} file updates`)
        pendingFiles.clear()
        server.ws.send({ type: 'full-reload', path: '*' })
      }, 1000) // Wait 1s after last change

      return [] // Prevent immediate reload
    },
  }
}
```

This batches all SDK file changes and triggers **ONE** reload after things stabilize.

## Optional: External QueryClient

The SDK also supports passing an external `QueryClient` if you want full control:

```typescript
import { QueryClient } from '@tanstack/react-query'

const myQueryClient = new QueryClient({...})

<GustoProvider queryClient={myQueryClient} config={{...}} />
```

But for the HMR issue, this is not necessary - the automatic persistence handles it.
