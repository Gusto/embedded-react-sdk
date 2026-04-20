import type { FieldErrors } from 'react-hook-form'
import { get } from 'react-hook-form'
import type { ValidationMessages } from '../types'
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
  const fieldError = get(formErrors, fieldName) as { message?: string } | undefined
  const errorCode = fieldError?.message as TErrorCode | undefined
  if (errorCode && validationMessages?.[errorCode]) {
    return validationMessages[errorCode]
  }

  for (const sdkError of sdkErrors) {
    const sdkFieldError = sdkError.fieldErrors.find(fe => fe.field === fieldName)
    if (sdkFieldError?.message) return sdkFieldError.message
  }

  return undefined
}
