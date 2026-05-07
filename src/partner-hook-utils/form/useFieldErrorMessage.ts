import { useFormContext, get } from 'react-hook-form'
import type { ValidationMessages } from '../types'
import { useFormFieldsMetadataContext } from './FormFieldsMetadataContext'
import { normalizeErrorKeyForForm } from '@/helpers/formattedStrings'

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
