import type { FieldErrors } from 'react-hook-form'
import type { ValidationMessages } from '@/types/sdkHooks'
import type { SDKError } from '@/types/sdkError'

export function resolveFieldError<
  TErrorCode extends string,
  TOptionalErrorCode extends string = never,
>(
  fieldName: string,
  formErrors: FieldErrors,
  sdkErrors: SDKError[],
  validationMessages?: ValidationMessages<TErrorCode, TOptionalErrorCode>,
): string | undefined {
  const errorCode = formErrors[fieldName]?.message as TErrorCode | undefined
  if (errorCode && validationMessages?.[errorCode]) {
    return validationMessages[errorCode]
  }

  for (const sdkError of sdkErrors) {
    const fieldError = sdkError.fieldErrors.find(fe => fe.field === fieldName)
    if (fieldError?.message) return fieldError.message
  }

  return undefined
}
