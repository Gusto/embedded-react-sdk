import type React from 'react'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import type { FieldElementRegistry } from '@/components/Common/Fields/hooks/fieldElementRegistry'
import type { SDKError } from '@/types/sdkError'

/**
 * Per-field metadata published by a form hook for the matching field component.
 *
 * @remarks
 * Carries the field's registered `name` plus presentation flags (required, disabled,
 * redacted server-side value) and optional date bounds. Consumed by hook field
 * components to render labels, inline validation, and bounded date pickers.
 *
 * @public
 */
export interface FieldMetadata {
  name: string
  isRequired?: boolean
  isDisabled?: boolean
  hasRedactedValue?: boolean
  /** ISO date string lower bound for date picker fields. Set by hooks; consumed by DatePickerHookField. */
  minDate?: string | null
  /** ISO date string upper bound for date picker fields. Set by hooks; consumed by DatePickerHookField. */
  maxDate?: string | null
}

/**
 * {@link FieldMetadata} extended with the option list for select-like fields.
 *
 * @remarks
 * Includes the `label`/`value` pairs used to render the control and, when
 * available, the raw `entries` (typed via `TEntry`) the options were derived
 * from so callers can read additional attributes off the originating record.
 *
 * @typeParam TEntry - Shape of the underlying records that produced `options`.
 * @public
 */
export interface FieldMetadataWithOptions<TEntry = unknown> extends FieldMetadata {
  options: Array<{ label: string; value: string }>
  entries?: readonly TEntry[]
}

/**
 * Map of form-field name to {@link FieldMetadata} or {@link FieldMetadataWithOptions}.
 *
 * @remarks
 * Exposed on every form hook as `form.fieldsMetadata` so field components can look
 * up their own metadata by name.
 *
 * @public
 */
export type FieldsMetadata = { [key: string]: FieldMetadata | FieldMetadataWithOptions }

/**
 * Maps every error code a schema field can produce to a display string.
 *
 * @remarks
 * Passed as the `validationMessages` prop on hook field components. The
 * required code set (`TErrorCode`) must be fully covered; codes in
 * `TOptionalErrorCode` may be omitted. When a message is missing, the field
 * falls back to displaying the raw error code.
 *
 * @typeParam TErrorCode - Error codes the field is guaranteed to produce.
 * @typeParam TOptionalErrorCode - Error codes that only apply in some configurations.
 * @public
 */
export type ValidationMessages<
  TErrorCode extends string,
  TOptionalErrorCode extends string = never,
> = Record<TErrorCode, string> & Partial<Record<TOptionalErrorCode, string>>

/**
 * Common presentation props accepted by every hook field component.
 *
 * @public
 */
export interface BaseFieldProps {
  label: string
  description?: React.ReactNode
}

/**
 * Strips `name` from a hook field's props type for domain-specific field components
 * that bind the form-field name internally.
 *
 * @typeParam TProps - Original hook field props type that includes a `name` property.
 * @public
 */
export type HookFieldProps<TProps extends { name: string }> = Omit<TProps, 'name'>

/**
 * Escape hatch exposing react-hook-form's `UseFormReturn` from a form hook.
 *
 * @remarks
 * Available at `form.hookFormInternals` on every form hook for advanced cases
 * not covered by the built-in API — for example, watching a field for reactive
 * UI updates outside of the SDK fields, programmatically setting values, or
 * triggering validation on specific fields. The built-in `Fields`,
 * `actions.onSubmit`, and `form.getFormSubmissionValues` are sufficient for
 * most use cases.
 *
 * @typeParam TFormData - Shape of the form values managed by react-hook-form.
 * @public
 */
export interface HookFormInternals<TFormData extends FieldValues = FieldValues> {
  formMethods: UseFormReturn<TFormData>
  /** @internal */
  _fieldElementRegistry?: FieldElementRegistry
}

/**
 * Discriminated union member returned by a hook while async data is being fetched.
 *
 * @remarks
 * Only `isLoading` and `errorHandling` are available in this branch — query
 * errors surfaced before the hook can render its form are exposed via
 * `errorHandling.errors`. Once `isLoading` narrows to `false`, the hook's
 * ready-state shape (data, form, actions, status) becomes available.
 *
 * @public
 */
export interface HookLoadingResult {
  isLoading: true
  errorHandling: HookErrorHandling
}

/**
 * Result returned by a form hook's `actions.onSubmit` after a successful submission.
 *
 * @remarks
 * `mode` reflects which API path ran — `'create'` when no existing entity was
 * loaded, `'update'` when editing one. `data` is the saved entity returned by
 * the API. A failed validation or mutation returns `undefined` instead, so
 * always null-check before reading `result.data`.
 *
 * @typeParam T - Type of the saved entity returned by the underlying mutation.
 * @public
 */
export interface HookSubmitResult<T> {
  mode: 'create' | 'update'
  data: T
}

/**
 * Error state and recovery actions returned by every hook in both loading and ready states.
 *
 * @remarks
 * `errors` aggregates fetch and submit errors as normalized `SDKError` values.
 * Recovery is split by source: `retryQueries` refetches every failed
 * data-fetching query (dependent queries re-trigger automatically when their
 * dependencies resolve), and `clearSubmitError` clears the most recent
 * submission error. Inferring which action to offer from those two methods is
 * the supported way to discriminate fetch vs submit failures today.
 *
 * @public
 */
export interface HookErrorHandling {
  errors: SDKError[]
  retryQueries: () => void
  clearSubmitError: () => void
}

/**
 * Base ready-state shape for non-form hooks (data-fetching or action hooks without a form).
 *
 * @remarks
 * Each concrete hook substitutes its own `data` and `status` shape via the
 * type parameters so consumers see fully-typed payloads without manual
 * narrowing. `isLoading: false` discriminates this branch from
 * {@link HookLoadingResult}.
 *
 * @typeParam TData - Shape of the data the hook exposes once loaded.
 * @typeParam TStatus - Shape of the status flags the hook exposes.
 * @public
 */
export interface BaseHookReady<
  TData extends Record<string, unknown> = Record<string, unknown>,
  TStatus extends Record<string, unknown> = Record<string, unknown>,
> {
  isLoading: false
  data: TData
  status: TStatus
  errorHandling: HookErrorHandling
}

/**
 * Base ready-state shape for form hooks.
 *
 * @remarks
 * Each concrete hook narrows `data`, `actions`, and `form.Fields` to its own
 * domain. `status.mode` matches {@link HookSubmitResult} — `'create'` when no
 * existing entity was loaded, `'update'` when editing one. Document-sign hooks
 * always surface `mode: 'create'`, which reflects the underlying submit
 * contract rather than a domain-level distinction. `form.Fields` carries the
 * pre-bound field components, `form.fieldsMetadata` carries per-field
 * presentation flags, and `form.getFormSubmissionValues` returns the current
 * parsed values (or `undefined` if invalid).
 *
 * @typeParam TFieldsMetadata - Shape of the per-field metadata exposed by the hook.
 * @typeParam TFormData - Shape of the form values managed by react-hook-form.
 * @typeParam TFields - Shape of the pre-bound `Fields` component map.
 * @public
 */
export interface BaseFormHookReady<
  TFieldsMetadata extends FieldsMetadata = FieldsMetadata,
  TFormData extends FieldValues = FieldValues,
  TFields extends object = Record<string, unknown>,
> {
  isLoading: false
  data: Record<string, unknown>
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: Record<string, unknown>
  errorHandling: HookErrorHandling
  form: {
    Fields: TFields
    fieldsMetadata: TFieldsMetadata
    hookFormInternals: HookFormInternals<TFormData>
    getFormSubmissionValues: () => Record<string, unknown> | undefined
  }
}

/**
 * Narrowed shape accepted by the `formHookResult` prop on hook field components.
 *
 * @remarks
 * Derived from {@link BaseFormHookReady} so the prop stays in sync with what
 * form hooks return — passing the hook result directly (e.g.
 * `formHookResult={employeeDetails}`) is always type-safe. Use this prop when
 * fields from multiple hooks need to be interleaved freely instead of grouped
 * under an `SDKFormProvider`.
 *
 * @public
 */
export type FormHookResult = {
  errorHandling: Pick<BaseFormHookReady['errorHandling'], 'errors'>
  form: Pick<BaseFormHookReady['form'], 'fieldsMetadata'> & {
    hookFormInternals: {
      formMethods: { control: unknown }
      _fieldElementRegistry?: FieldElementRegistry
    }
  }
}
