---
title: Troubleshooting
description: Fixes for common SDK integration problems, including API version header issues and CORS errors, plus how to help Gusto debug your integration.
---

## Common issues

### Your proxy doesn't forward the SDK's headers

**Signs:** Gusto can't tell which SDK version sent your requests, so support takes longer.

**Cause:** The SDK sends two headers on every request:

- `X-Gusto-API-Version`: the API version this SDK release is built for.
- `X-Gusto-SDK-Version`: the SDK package and version, for example `@gusto/embedded-react-sdk 0.55.7`. Sent starting in version 0.55.7.

Your proxy builds its own request to Gusto, so these headers are not passed along unless you copy them.

**Fix:** Copy both headers to the outgoing request, unchanged:

```ts title="proxy.ts"
for (const name of ['x-gusto-api-version', 'x-gusto-sdk-version']) {
  const value = req.headers[name]
  if (typeof value === 'string') outboundHeaders[name] = value
}
```

We strongly recommend forwarding `X-Gusto-SDK-Version`. It lets Gusto see which SDK version sent a request, so we can find and fix your issue much faster.

### The API version is overridden

**Signs:** Requests fail, or screens show missing or wrong data. The browser console may show `Requested API version ... but the response reported version ...`.

**Cause:** Something replaced the SDK's `X-Gusto-API-Version` header. This is usually a proxy that sets its own version. It can also be `config.headers` or a [request interceptor](../guides/integration-guide/request-interceptors.md).

**Fix:** Don't set `X-Gusto-API-Version` yourself for SDK requests. Forward the value the SDK sends, as shown in [the first issue](#your-proxy-doesnt-forward-the-sdks-headers). Each SDK release reads responses in the shape of one API version. A different version can return data the SDK can't read.

### Requests fail with `406 invalid_api_version`

**Cause:** The API version sent is older than your application's minimum API version.

**Fix:**

1. Make sure your proxy forwards the SDK's `X-Gusto-API-Version` and doesn't replace it.
2. Upgrade to the latest SDK.
3. If the error continues, contact your Gusto solutions architect.

### CORS errors after an SDK upgrade

**Signs:** The browser blocks requests to your proxy with a CORS error. This often starts right after an upgrade.

**Cause:** Your proxy allows only a fixed list of request headers, and the SDK's headers aren't on it.

**Fix:** Add these to your proxy's `Access-Control-Allow-Headers`:

- `X-Gusto-API-Version`
- `X-Gusto-SDK-Version`
- Any headers you add through `config.headers` or request interceptors

## Getting help

When you contact Gusto, include:

- Your SDK version (from `package.json`)
- The failing request path and response status
- The response body and any browser console errors
