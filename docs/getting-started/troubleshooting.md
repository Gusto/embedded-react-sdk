---
title: Troubleshooting
description: Fixes for common SDK integration problems, including API version header issues and CORS errors, plus how to help Gusto debug your integration.
---

## Start here: forward the SDK's headers

The SDK adds two headers to every request. You don't set them or choose their values. The SDK handles that.

- `X-Gusto-API-Version`: the API version this SDK release is built for.
- `X-Gusto-SDK-Version`: the SDK package and version, for example `@gusto/embedded-react-sdk 0.55.7`. Added in version 0.55.7.

Your proxy only needs to pass them through to Gusto unchanged. If your proxy forwards the incoming request headers, this already works. If it builds a new request with only certain headers, add these two.

We strongly recommend forwarding `X-Gusto-SDK-Version`. It lets Gusto see which SDK version sent a request, so we can find and fix your issue much faster.

## Common issues

### The API version is overridden

**Signs:** Requests fail, or screens show missing or wrong data.

**Cause:** Something replaced the SDK's `X-Gusto-API-Version` header. This is usually a proxy that sets its own version. It can also be `config.headers` or a [request interceptor](../guides/integration-guide/request-interceptors.md).

**Fix:** Don't set `X-Gusto-API-Version` yourself for SDK requests. Pass through the value the SDK sends. Each SDK release reads responses in the shape of one API version. A different version can return data the SDK can't read.

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

- Your SDK version, from `package.json` or the `X-Gusto-SDK-Version` header on any SDK request. The header shows the exact installed version.
- The failing request path and response status
- The response body and any browser console errors
