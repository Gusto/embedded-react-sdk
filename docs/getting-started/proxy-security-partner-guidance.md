---
title: Proxy Security
description: Secure the SDK proxy with per-request authentication, endpoint allowlisting, resource ownership checks, and audit logging using the SDK endpoint inventory.
---

# Proxy Security

The Gusto API enforces application-level protections (scopes, company-bound tokens, rate limits). Your proxy enforces user-level authorization. Both layers are necessary -- UI-level restrictions alone are not sufficient since users can make API requests directly.

## What to do

1. **Authenticate every request.** Verify the user's session on every proxied request, not just at login.
2. **Allowlist endpoints.** Only forward requests to API endpoints your application actually uses. Deny everything else.
3. **Validate resource ownership.** Verify that the authenticated user is authorized to access the resource in the URL (e.g., an employee should only reach their own employee ID).
4. **Log proxied requests.** Maintain audit logs for security monitoring and incident response.

## Getting the endpoint list

Every SDK component makes a known set of API calls. Paths use named parameters (`:companyId`, `:employeeId`, etc.) that you replace with session values. The more you resolve, the tighter the allowlist:

| What you resolve             | Use case                                            |
| ---------------------------- | --------------------------------------------------- |
| Nothing                      | Generic allowlisting, no user scoping               |
| `:companyId` only            | Admin who can access any employee in their company  |
| `:companyId` + `:employeeId` | Self-service employee, restricted to their own data |

### Option A: JSON endpoint inventory (recommended, any platform)

The SDK ships a machine-readable JSON file listing every block and flow with their endpoints and required variables. It is auto-generated from source on every build and verified in CI.

Import it from the package:

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

Or load the file directly from `node_modules/@gusto/embedded-react-sdk/docs/appendix/endpoint-inventory.json` in any language.

The JSON structure:

```json
{
  "blocks": {
    "Employee.FederalTaxes": {
      "endpoints": [
        { "method": "GET", "path": "/v1/employees/:employeeId/federal_taxes" },
        { "method": "PUT", "path": "/v1/employees/:employeeId/federal_taxes" }
      ],
      "variables": ["employeeId"]
    }
  },
  "flows": {
    "Employee.SelfOnboardingFlow": {
      "blocks": ["Employee.Landing", "Employee.Profile", "..."],
      "endpoints": [
        { "method": "GET", "path": "/v1/employees/:employeeId" },
        { "method": "GET", "path": "/v1/companies/:companyId" }
      ],
      "variables": ["companyId", "employeeId"]
    }
  }
}
```

Look up the flows or blocks your app uses, substitute `:param` placeholders with session values, and use the result as your allowlist.

### Option B: Static reference

See the [endpoint reference tables](../appendix/endpoint-reference.md) for a human-readable list. Copy the method + path pairs for the components you use and substitute `:param` placeholders with session values at runtime.

## Content Security Policy

The SDK ships a static stylesheet at `@gusto/embedded-react-sdk/style.css` and injects two runtime `<style>` elements at the browser: one for active theme variables, and one inside the new window opened during a paystub PDF download. Both accept a CSP nonce.

`react-aria-components`, a dependency the SDK uses for accessible UI primitives, separately injects one global `<style>` element of its own (a `touch-action` rule that lets pressable elements distinguish a tap from a scroll gesture) the first time any pressable component mounts. This element has no nonce and the library exposes no option to add one, so it's blocked under a `style-src` policy that doesn't also allow `'unsafe-inline'`. Its content is static and version-pinned, so as a narrower alternative to `'unsafe-inline'`, you can allow it by hash instead — see [Minimum policy](#minimum-policy).

### Passing a nonce

Pass the same per-request nonce your app uses for `style-src 'nonce-…'` to `GustoProvider`. The SDK applies it to every `<style>` element it creates.

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App({ cspNonce }: { cspNonce: string }) {
  return (
    <GustoProvider config={{ baseUrl: '/proxy/' }} nonce={cspNonce}>
      …
    </GustoProvider>
  )
}
```

The same prop is available on `GustoProviderCustomUIAdapter`. If a custom UI component you supply injects its own runtime `<style>` or `<script>`, read the nonce with `useNonce`:

```tsx
import { useEffect } from 'react'
import { useNonce } from '@gusto/embedded-react-sdk'

function InjectedStyles({ css }: { css: string }) {
  const nonce = useNonce()
  useEffect(() => {
    const el = document.createElement('style')
    if (nonce) el.nonce = nonce
    el.textContent = css
    document.head.appendChild(el)
    return () => {
      el.remove()
    }
  }, [css, nonce])
  return null
}
```

`useNonce` returns `undefined` when no nonce was supplied.

### Minimum policy

```http
Content-Security-Policy:
  style-src 'self' 'nonce-XYZ' 'sha256-38RhXrc7EdReTKsOm23ZPOCUgniTUUcjky8QOOrQx6o=';
  style-src-attr 'unsafe-inline';
  script-src 'self' 'nonce-XYZ';
  img-src 'self' data:;
```

- `style-src 'self' 'nonce-XYZ'` covers the bundled stylesheet and the two runtime `<style>` elements once the nonce is wired through `GustoProvider`. The additional hash covers the one `<style>` element `react-aria-components` injects that can't be given a nonce (see above), as pinned in the SDK version you're on; without it, or `'unsafe-inline'`, that one rule is dropped and pressable elements fall back to default touch-action handling. Because the hash is tied to that exact dependency version, verify it against your own build rather than trusting this value indefinitely — recompute it from the CSP violation report, or from `sha256(document.getElementById('react-aria-pressable-style').textContent)`, after any SDK upgrade.
- `style-src-attr 'unsafe-inline'` is required by inline `style="…"` attributes the SDK uses to apply runtime-computed CSS custom properties (responsive flex and grid layouts, progress-bar fill width, animation timings) and by `react-aria-components` for overlay positioning. The CSP specification does not allow per-attribute nonces, so this directive cannot be tightened further without dropping these features upstream.
- `script-src 'self' 'nonce-XYZ'` — the SDK does not use `eval` or inject `<script>` elements. The nonce is for your own scripts.
- `img-src 'self' data:` is only required if your integration uploads images. The SDK converts uploaded files to `data:` URLs before submitting them.

## FAQ

**Can an authenticated employee access another employee's data?**
Not if you substitute the employee ID -- the resulting paths only match that employee's endpoints.

**How do we restrict some admins from running payroll?**
Only include payroll endpoints for roles that need them, or request removal of the `payrolls:run` scope entirely.

**How do we keep the allowlist up to date?**
The JSON inventory is auto-derived on every build and verified in CI. Upgrading the SDK automatically reflects endpoint changes.

## Further reading

- [Proxy examples with role-based access](../appendix/proxy-examples.md)
- [Endpoint reference tables](../appendix/endpoint-reference.md)
- [Gusto API Scopes](https://docs.gusto.com/embedded-payroll/docs/scopes)
- [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference)
