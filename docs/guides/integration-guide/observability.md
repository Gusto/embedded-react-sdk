---
title: Observability and Error Tracking
description: Connect SDK errors and performance metrics to monitoring tools, understand default redaction, and choose which telemetry to forward.
order: 8
---

# Observability and Error Tracking

Configure observability callbacks to receive SDK errors and performance metrics. By default, the SDK excludes raw errors and redacts recognized sensitive values in error messages, field-error metadata, and metric tags. You choose which parts of those payloads to forward to your monitoring tools.

Redaction reduces sensitive data exposure, but does not detect every PII value. This guide explains the default processing and how to configure additional redaction or send a smaller set of diagnostic data.

## Connect Your Monitoring Tool

Pass an [`ObservabilityHook`](../../reference/observability.md#observabilityhook) to `GustoProvider` through `config.observability`. Define `onError`, `onMetric`, or both. The SDK processes each payload before invoking these callbacks; no sanitization configuration is needed to use the defaults.

The following example forwards selected diagnostic fields to the console. Replace the callback bodies with calls to your monitoring tool:

```tsx
import type { ReactNode } from 'react'
import { GustoProvider, type ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    console.error({
      category: error.category,
      component: error.componentName,
      httpStatus: error.httpStatus,
      message: error.message,
    })
  },
  onMetric: metric => {
    console.log({
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      component: metric.tags?.component,
    })
  },
}

export function App({ children }: { children: ReactNode }) {
  return <GustoProvider config={{ baseUrl: '/api/', observability }}>{children}</GustoProvider>
}
```

### Sentry

This example creates an exception from the processed message and attaches selected context. It does not forward the original error or field-error metadata.

```tsx
import * as Sentry from '@sentry/react'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    Sentry.captureException(new Error(error.message), {
      level: error.category === 'validation_error' ? 'warning' : 'error',
      tags: {
        error_category: error.category,
        component: error.componentName ?? 'unknown',
        http_status: String(error.httpStatus ?? ''),
      },
      contexts: {
        sdk_error: {
          field_error_count: error.fieldErrors.length,
        },
      },
      fingerprint: ['gusto-sdk', error.category, error.componentName ?? 'unknown'],
    })
  },
  onMetric: metric => {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${metric.value}${metric.unit ?? ''}`,
      level: 'info',
      data: { component: metric.tags?.component },
    })
  },
}
```

### Datadog

```tsx
import { datadogRum } from '@datadog/browser-rum'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    const datadogError = new Error(error.message)
    datadogError.name = error.category

    datadogRum.addError(datadogError, {
      category: error.category,
      component: error.componentName,
      httpStatus: error.httpStatus,
    })
  },
  onMetric: metric => {
    if (metric.unit === 'ms') {
      datadogRum.addTiming(metric.name, metric.value)
    }
  },
}
```

These examples select SDK fields to forward. Your monitoring tool may also collect browser context, breadcrumbs, or other application data independently; configure that collection in the tool itself.

## Understand the Telemetry

### Errors

`onError` receives an [`ObservabilityError`](../../reference/observability.md#observabilityerror): the SDK's normalized error shape plus a timestamp and component context when available.

| Property         | Diagnostic information                                           |
| ---------------- | ---------------------------------------------------------------- |
| `category`       | Classification of the error, listed below                        |
| `message`        | Error message, with recognized patterns redacted by default      |
| `httpStatus`     | HTTP status when available                                       |
| `fieldErrors`    | Field-level errors from structured API validation responses      |
| `timestamp`      | Unix timestamp in milliseconds                                   |
| `componentName`  | SDK component, such as `Employee.Profile`, when known            |
| `componentStack` | React component hierarchy for errors caught by an error boundary |
| `raw`            | Original error, excluded by default                              |

| Category           | When it occurs                                                   |
| ------------------ | ---------------------------------------------------------------- |
| `api_error`        | HTTP error response from the Gusto API                           |
| `validation_error` | Client-side schema validation failure                            |
| `network_error`    | Network failure, such as a refused connection or aborted request |
| `internal_error`   | Unexpected runtime error                                         |

Each field error contains a `field` path, a `category`, a `message`, and optional `metadata`. Field paths identify the affected input, such as `firstName` or `states.CA.filingStatus.value`. Metadata can include additional API details. You can forward field paths and categories for diagnostics while omitting messages or metadata you do not need.

See the [error type reference](../../reference/error-handling.md) for the normalized `SDKError` and `SDKFieldError` shapes, and the [observability reference](../../reference/observability.md) for the complete callback types.

### Performance Metrics

`onMetric` receives an [`ObservabilityMetric`](../../reference/observability.md#observabilitymetric) with a `name`, numeric `value`, optional `unit` and `tags`, and a Unix `timestamp` in milliseconds.

| Metric name                      | Description                          | Unit | Tags                                                        |
| -------------------------------- | ------------------------------------ | ---- | ----------------------------------------------------------- |
| `sdk.form.submit_duration`       | Form submission time                 | ms   | `status` (`success` or `error`), `component` when available |
| `sdk.component.loading_duration` | Time spent in loading/suspense state | ms   | `component` when available                                  |

## Understand Default Redaction

The SDK applies the following processing before invoking observability callbacks:

| Payload location                            | Default behavior                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Error `message` and `fieldErrors[].message` | Replace recognized string patterns with placeholders such as `[EMAIL-REDACTED]`                            |
| `fieldErrors[].metadata` and metric `tags`  | Recursively replace sensitive key values with `[REDACTED]` and redact recognized patterns in string values |
| Error `raw`                                 | Set to `undefined`                                                                                         |
| Other properties                            | Preserve without redaction                                                                                 |

String patterns recognize SSN formats, email addresses, US phone-number formats, 16-digit credit-card formats, and long token-like strings. These are format matches: they can redact unrelated values with the same format and miss sensitive values in other formats.

The built-in sensitive keys are listed below. Matching is recursive inside field-error metadata and metric tags.

| Group                         | Sensitive keys                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Credentials                   | `password`, `token`, `apiKey`, `secret`, `pin`                                                                                           |
| Financial and tax identifiers | `ssn`, `social_security_number`, `bankAccount`, `routingNumber`, `accountNumber`, `creditCard`, `cvv`, `ein`, `retirementLoanIdentifier` |
| Personal details              | `firstName`, `lastName`, `middleName`, `fullName`, `employeeName`, `dateOfBirth`, `birthDate`, `birthday`, `dob`, `phone`                |
| Addresses                     | `address`, `street1`, `street2`, `zipCode`, `postalCode`, `zip`, `city`                                                                  |
| Document identifiers          | `caseNumber`, `orderNumber`, `remittanceNumber`, `documentNumber`                                                                        |
| Signatures                    | `signatureText`                                                                                                                          |

Matching is case-insensitive. The listed keys containing multiple words also support snake_case spellings, such as `first_name`, `date_of_birth`, and `account_number`; `street_1` and `street_2` are also covered. Most keys match as substrings, so `employeeFirstName` is redacted. The short keys `ein`, `dob`, `zip`, and `city` match only the whole key to avoid matches within unrelated names.

Form-signing address keys `preparerCity` and `preparerZip`, their numbered variants for preparers 2 through 4, and their snake_case spellings are also redacted.

This processing does not identify every sensitive value. For example, a person's name or street address embedded in an error message can remain because it does not match a known string pattern. A sensitive value under an unrecognized metadata key can also remain. Properties outside the locations in the table, including custom top-level properties, are not redacted.

These protections apply to `observability.onError` and `observability.onMetric`. They do not sanitize errors returned by form hooks, component `onEvent` payloads, request-hook payloads, or data your callback adds after processing.

## Choose Additional Redaction

Use key-based configuration for structured data, custom sanitizers for payload transformations, and your callbacks to select what you send.

### Add Sensitive Keys

`additionalSensitiveFields` extends sensitive key matching inside field-error metadata and metric tags. Entries use case-insensitive substring matching, including in nested objects and arrays. They do not match field-error `field` paths or text inside messages.

```tsx
import type { SanitizationConfig } from '@gusto/embedded-react-sdk'

const sanitization: SanitizationConfig = {
  additionalSensitiveFields: ['employeeId', 'customerReference'],
}
```

Set this object as `observability.sanitization`. For example, metadata with an `employeeId` key will retain the key and replace its value with `[REDACTED]`. Adding a name to this list does not redact a property outside metadata or tags.

### Transform Messages or Omit Metadata

Custom sanitizers let you replace free-text messages, omit metadata, or transform metric tags. This example replaces error messages with summaries and excludes field-error metadata:

```tsx
import type { SanitizationConfig } from '@gusto/embedded-react-sdk'

const sanitization: SanitizationConfig = {
  customErrorSanitizer: error => ({
    ...error,
    message: `SDK ${error.category}`,
    fieldErrors: error.fieldErrors.map(fieldError => ({
      ...fieldError,
      message: 'Field validation failed',
      metadata: undefined,
    })),
  }),
}
```

For both `customErrorSanitizer` and `customMetricSanitizer`, processing runs in this order:

1. The SDK applies configured redaction and raw-error exclusion.
2. Your custom sanitizer receives the processed payload and returns an error or metric of the same type.
3. The SDK applies the same configured processing to the returned payload.
4. The SDK invokes `onError` or `onMetric`.

With default settings, your function receives redacted values and no raw error. Recognized sensitive content added to messages, field-error metadata, or metric tags is redacted again. A `raw` error added by your function is excluded again. Other properties, including custom top-level properties, are preserved without redaction.

### Select What You Forward

You do not need to forward the entire callback payload. Select the fields that provide useful diagnostics. If free-text messages or metadata are unnecessary, omit them from the monitoring call even when redaction is enabled.

```tsx
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    console.error({
      category: error.category,
      component: error.componentName,
      httpStatus: error.httpStatus,
      fieldErrors: error.fieldErrors.map(({ field, category }) => ({ field, category })),
    })
  },
}
```

Inspect representative emitted payloads when configuring your integration. Check messages, nested metadata, custom sanitizer output, and any data your callback or monitoring tool adds. Use those observations to choose additional keys, message transformations, or a smaller set of forwarded fields.

## Understand Configuration Tradeoffs

`enabled` controls redaction; `includeRawError` controls raw-error inclusion. They are independent, and custom sanitizers still run when redaction is disabled.

| Configuration                                     | Messages, metadata, and tags | Raw error                     |
| ------------------------------------------------- | ---------------------------- | ----------------------------- |
| Defaults                                          | Redacted                     | Excluded                      |
| `enabled: false`                                  | ⚠️ SDK redaction disabled    | Excluded                      |
| `includeRawError: true`                           | Redacted                     | ⚠️ Included without redaction |
| Both `enabled: false` and `includeRawError: true` | ⚠️ SDK redaction disabled    | ⚠️ Included without redaction |

### Raw Errors for Debugging

The original error can contain form inputs, API response bodies, and request headers, including credentials. If you need it for debugging, explicitly set `includeRawError: true` and decide how to inspect it before forwarding it anywhere. The SDK does not redact `raw`, even when `enabled: true`.

Keep raw-error inclusion scoped to the environment and diagnostic session where you need it. Review which data your monitoring tool stores and who can access it before sending raw errors. Creating an exception from `error.message`, as in the Sentry example, provides a processed message without including the original error object.

### Disabling Built-in Redaction

Set `enabled: false` only when you intend to handle redaction yourself. Messages, field-error metadata, and metric tags then reach your custom sanitizer and callbacks without built-in redaction, and the SDK does not redact custom output. Raw errors remain excluded unless separately enabled with `includeRawError: true`.

See [`SanitizationConfig`](../../reference/observability.md#sanitizationconfig) for the complete configuration reference.

## Review an Existing Integration When Upgrading from `0.56.x` or earlier

The change to custom-sanitizer composition is a breaking behavior change, even though the callback types are unchanged. Previously, a custom sanitizer replaced SDK processing. It now runs between two applications of the configured SDK processing. The built-in sensitive-key list has also expanded to cover more personal details and identifiers.

When upgrading to this behavior:

- Check custom functions that parse original messages or rely on metadata or tag values. With redaction enabled, those values may now be placeholders when your function runs.
- Check custom functions that read or return `raw`. It is excluded before and after the function unless `includeRawError: true` is explicitly configured.
- Check telemetry that depends on newly redacted keys, including personal-name, birth-date, address, and document-identifier fields. Choose diagnostic grouping fields that do not depend on those values.
- Verify the payloads your monitoring tool receives with your configured callbacks and sanitizers.

If an integration requires original input for its own redaction, `enabled: false` supplies that input to the custom function, but also disables SDK redaction of its output. Raw-error access still requires a separate opt-in. Review both choices explicitly rather than assuming custom functions bypass the configured defaults.

## Other Tracking Mechanisms

| Mechanism                                 | Purpose                           |
| ----------------------------------------- | --------------------------------- |
| `observability.onError`                   | SDK error diagnostics             |
| `observability.onMetric`                  | SDK performance metrics           |
| Component `onEvent`                       | Business events and flow progress |
| Request hooks, such as `hooks.afterError` | Request/response interception     |

Choose the mechanism for the data you need. Observability redaction does not extend to the other mechanisms.
