import type { FieldErrors } from 'react-hook-form'
import { get } from 'react-hook-form'
import type { ValidationMessages } from '../types'
import { normalizeErrorKeyForForm } from '@/helpers/formattedStrings'
import type { SDKError } from '@/types/sdkError'

/**
 * Resolves the display message for a single form field by combining
 * client-side validation errors with field-scoped SDK errors.
 *
 * @remarks
 * Client-side validation wins when the error code has a matching entry in
 * `validationMessages`. Otherwise the first matching `fieldErrors` entry from
 * `sdkErrors` is returned (field names are normalized so API-style keys like
 * `home_address.street_1` match form-style keys like `homeAddress.street1`).
 * Returns `undefined` when no error applies, so callers can fall back to the
 * raw client-side error code if needed.
 *
 * @typeParam TErrorCode - Error codes the field is guaranteed to produce.
 * @typeParam TOptionalErrorCode - Error codes that only apply in some configurations.
 * @param fieldName - Form-field name (dot-notation supported for nested fields).
 * @param formErrors - react-hook-form `formState.errors` for the form.
 * @param sdkErrors - Normalized SDK errors aggregated by the hook.
 * @param validationMessages - Map from error code to display string for
 *   client-side validation failures.
 * @returns The resolved display message, or `undefined` when no error matches.
 * @internal
 */
export function resolveFieldError<
  TErrorCode extends string,
  TOptionalErrorCode extends string = never,
>(
  fieldName: string,
  formErrors: FieldErrors,
  sdkErrors: SDKError[],
  validationMessages?: ValidationMessages<TErrorCode, TOptionalErrorCode>,
): string | undefined {
  const fieldError = get(formErrors, fieldName) as { message?: string } | undefined
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
