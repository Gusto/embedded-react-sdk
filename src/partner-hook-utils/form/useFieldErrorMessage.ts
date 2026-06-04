import { useFormContext, get } from 'react-hook-form'
import type { ValidationMessages } from '../types'
import { useFormFieldsMetadataContext } from './FormFieldsMetadataContext'
import { normalizeErrorKeyForForm } from '@/helpers/formattedStrings'

/**
 * Resolves the display string for a field's current error from either client-side validation or server-side `SDKError`s.
 *
 * @remarks
 * Use inside a custom field component rendered under a form hook's
 * provider to surface the same error message the built-in `Fields` would
 * render. Looks up the field's error in this order:
 *
 * 1. The react-hook-form error for `fieldName`. If its message matches a
 *    key in `validationMessages`, returns that mapped string.
 * 2. Any matching field-level error attached to a server-side error
 *    available on the form provider.
 * 3. `undefined` when no error applies.
 *
 * Must be called from a component rendered inside the form hook's
 * `FormProvider`.
 *
 * @typeParam TErrorCode - Error codes the field can produce; each key in `validationMessages` maps a code to its display string.
 * @param fieldName - Name of the field as registered with react-hook-form.
 * @param validationMessages - Map of validation error codes to display strings. When omitted, only server-side errors are returned.
 * @returns The display message for the field's current error, or `undefined` when the field is valid.
 * @internal
 *
 * @example
 * ```tsx
 * function StreetAddressField() {
 *   const errorMessage = useFieldErrorMessage('street1', {
 *     REQUIRED: 'Street address is required',
 *   })
 *   return (
 *     <label>
 *       Street
 *       <input name="street1" aria-invalid={errorMessage ? true : undefined} />
 *       {errorMessage ? <span role="alert">{errorMessage}</span> : null}
 *     </label>
 *   )
 * }
 * ```
 */
export function useFieldErrorMessage<TErrorCode extends string>(
  fieldName: string,
  validationMessages?: ValidationMessages<TErrorCode>,
): string | undefined {
  const {
    formState: { errors },
  } = useFormContext()
  const context = useFormFieldsMetadataContext()
  const sdkErrors = context?.errors ?? []

  const fieldError = get(errors, fieldName) as { message?: string } | undefined
  const errorCode = fieldError?.message as TErrorCode | undefined
  if (errorCode && validationMessages?.[errorCode]) {
    return validationMessages[errorCode]
  }

  for (const sdkError of sdkErrors) {
    const sdkFieldError = sdkError.fieldErrors.find(
      fe => normalizeErrorKeyForForm(fe.field) === fieldName,
    )
    if (sdkFieldError?.message) return sdkFieldError.message
  }

  return undefined
}
