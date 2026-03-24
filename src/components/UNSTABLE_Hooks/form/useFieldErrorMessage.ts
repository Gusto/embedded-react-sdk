import { useFormContext } from 'react-hook-form'
import { useFormFieldsMetadataContext } from './FormFieldsMetadataContext'
import type { ValidationMessages } from './types'

export function useFieldErrorMessage<TErrorCode extends string>(
  fieldName: string,
  validationMessages?: ValidationMessages<TErrorCode>,
): string | undefined {
  const {
    formState: { errors },
  } = useFormContext()
  const { errors: sdkErrors } = useFormFieldsMetadataContext()

  const errorCode = errors[fieldName]?.message as TErrorCode | undefined
  if (errorCode && validationMessages?.[errorCode]) {
    return validationMessages[errorCode]
  }

  for (const sdkError of sdkErrors) {
    const fieldError = sdkError.fieldErrors.find(fe => fe.field === fieldName)
    if (fieldError?.message) return fieldError.message
  }

  return undefined
}
