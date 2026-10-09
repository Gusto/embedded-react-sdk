---
title: Proxy security
description: Secure the SDK proxy with per-request authentication, endpoint allowlisting, resource ownership checks, and audit logging using the SDK endpoint inventory.
---

# Proxy security

The Gusto API enforces application-level protections (scopes, company-bound tokens, rate limits). Your proxy enforces user-level authorization. Both layers are necessary—UI-level restrictions alone aren't sufficient because users can make API requests directly.

## What to do

1. **Authenticate every request.** Verify the user's session on every proxied request, not just at sign-in.
2. **Allowlist endpoints.** Only forward requests to API endpoints your application actually uses. Deny everything else.
3. **Validate resource ownership.** Verify that the authenticated user is authorized to access the resource in the URL (for example, an employee should only reach their own employee ID).
4. **Log proxied requests.** Maintain audit logs for security monitoring and incident response.

## Getting the endpoint list

Every SDK component makes a known set of API calls. Paths use named parameters (`:companyId`, `:employeeId`, and so on) that you replace with session values. The more you resolve, the tighter the allowlist:

| What you resolve             | Use case                                            |
| ---------------------------- | --------------------------------------------------- |
| Nothing                      | Generic allowlisting, no user scoping               |
| `:companyId` only            | Admin who can access any employee in their company  |
| `:companyId` + `:employeeId` | Self-service employee, restricted to their own data |

### Option A: JSON endpoint inventory (recommended, any platform)

The SDK ships a machine-readable JSON file listing every block, flow, and headless hook with their endpoints and required variables. It's auto-generated from source on every build and verified in CI.

Import it from the package:

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

Or load the file directly from `node_modules/@gusto/embedded-react-sdk/docs/guides/endpoint-inventory.json` in any language.

The JSON structure:

```json
{
  "blocks": {
    "EmployeeManagement.FederalTaxes": {
      "endpoints": [
        {
          "method": "GET",
          "path": "/v1/employees/:employeeUuid/federal_taxes",
          "docsUrl": "https://docs.gusto.com/embedded-payroll/v2026-02-01/reference/get-v1-employees-employee_id-federal_taxes"
        },
        {
          "method": "PUT",
          "path": "/v1/employees/:employeeUuid/federal_taxes",
          "docsUrl": "https://docs.gusto.com/embedded-payroll/v2026-02-01/reference/put-v1-employees-employee_id-federal_taxes"
        }
      ],
      "variables": ["employeeUuid"]
    }
  },
  "flows": {
    "CompanyOnboarding.OnboardingFlow": {
      "blocks": ["CompanyOnboarding.FederalTaxes", "CompanyOnboarding.PaySchedule", "..."]
    }
  },
  "hooks": {
    "useFederalTaxesForm": {
      "endpoints": [
        {
          "method": "GET",
          "path": "/v1/employees/:employeeUuid/federal_taxes",
          "docsUrl": "https://docs.gusto.com/embedded-payroll/v2026-02-01/reference/get-v1-employees-employee_id-federal_taxes"
        },
        {
          "method": "PUT",
          "path": "/v1/employees/:employeeUuid/federal_taxes",
          "docsUrl": "https://docs.gusto.com/embedded-payroll/v2026-02-01/reference/put-v1-employees-employee_id-federal_taxes"
        }
      ],
      "variables": ["employeeUuid"]
    }
  }
}
```

Each endpoint's `docsUrl` links to its page in the API reference (omitted for the few endpoints without a public reference page). Blocks and hooks list their `endpoints` directly; a flow lists the `blocks` it composes, and its endpoints are the union of those blocks' endpoints. Look up the flows, blocks, or hooks your app uses, substitute `:param` placeholders with session values, and use the result as your allowlist.

### Option B: Static reference

See the [endpoint reference tables](../guides/endpoint-reference.md) for a human-readable list grouped by domain. Each component, flow, and hook's own [reference page](../reference/index.md) also lists the endpoints it calls. Copy the method + path pairs for the components and hooks you use and substitute `:param` placeholders with session values at runtime.

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

### Embedding PDF documents

Signature and form flows (`SignatureForm`, `I9SignatureForm`, company and employee document signing) render the document's PDF inline using an `<embed>` element, gated under `object-src`. Allow the origin that serves your document URLs under `object-src` or these documents won't render. These documents are served from Amazon S3; the exact host (bucket/region-specific, e.g. `*.s3.<region>.amazonaws.com`) varies by environment, so confirm it against an actual `pdfUrl` value returned by a signature hook rather than assuming a fixed domain.

If your policy can't allow `object-src`, override the `DocumentEmbed` component to render with an `<iframe>` instead, gated under `frame-src`:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function IframeEmbed({
  url,
  title,
  className,
}: {
  url: string
  title: string
  className?: string
}) {
  return <iframe src={url} title={title} className={className} />
}

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/proxy/' }} components={{ DocumentEmbed: IframeEmbed }}>
      …
    </GustoProvider>
  )
}
```

Notes on the override:

- `className` is passed through for sizing — without it, neither the default `<embed>` nor your override has any width or height.
- The override receives the raw URL; the default `<embed>` appends parameters to hide the native PDF viewer's chrome, which your implementation is free to replicate or skip.

### Minimum policy

```http
Content-Security-Policy:
  style-src 'self' 'nonce-XYZ' 'sha256-38RhXrc7EdReTKsOm23ZPOCUgniTUUcjky8QOOrQx6o=';
  style-src-attr 'unsafe-inline';
  script-src 'self' 'nonce-XYZ';
  img-src 'self' data:;
  object-src <your-s3-document-host>;
```

- `style-src 'self' 'nonce-XYZ'` covers the bundled stylesheet and the two runtime `<style>` elements once the nonce is wired through `GustoProvider`. The additional hash covers the one `<style>` element `react-aria-components` injects that can't be given a nonce (see above), as pinned in the SDK version you're on; without it, or `'unsafe-inline'`, that one rule is dropped and pressable elements fall back to default touch-action handling. Because the hash is tied to that exact dependency version, verify it against your own build rather than trusting this value indefinitely — recompute it from the CSP violation report, or from `sha256(document.getElementById('react-aria-pressable-style').textContent)`, after any SDK upgrade.
- `style-src-attr 'unsafe-inline'` is required by inline `style="…"` attributes the SDK uses to apply runtime-computed CSS custom properties (responsive flex and grid layouts, progress-bar fill width, animation timings) and by `react-aria-components` for overlay positioning. The CSP specification does not allow per-attribute nonces, so this directive cannot be tightened further without dropping these features upstream.
- `script-src 'self' 'nonce-XYZ'` — the SDK does not use `eval` or inject `<script>` elements. The nonce is for your own scripts.
- `img-src 'self' data:` is only required if your integration uploads images. The SDK converts uploaded files to `data:` URLs before submitting them.
- `object-src <your-s3-document-host>` is required for the default PDF `<embed>` to render. Documents are served from Amazon S3; the exact host varies by environment, so inspect a `pdfUrl` value returned by a signature hook (e.g. `useSignEmployeeForm`) rather than assuming a fixed domain. Replace this with a `frame-src` entry instead if you provide your own `DocumentEmbed` override (see [Embedding PDF documents](#embedding-pdf-documents)).

## FAQ

**Can an authenticated employee access another employee's data?**
Not if you substitute the employee ID—the resulting paths only match that employee's endpoints.

**How do we restrict some admins from running payroll?**
Only include payroll endpoints for roles that need them, or request removal of the `payrolls:run` scope entirely.

**How do we keep the allowlist up to date?**
The JSON inventory is auto-derived on every build and verified in CI. Upgrading the SDK automatically reflects endpoint changes.

## Further reading

- [Proxy examples with role-based access](../guides/integration-guide/proxy-examples.md)
- [Endpoint reference tables](../guides/endpoint-reference.md)
- [Gusto API scopes](https://docs.gusto.com/embedded-payroll/docs/scopes)
- [Gusto Embedded API Reference](https://docs.gusto.com/embedded-payroll/reference)
