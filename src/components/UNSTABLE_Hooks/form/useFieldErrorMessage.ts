import { useFormContext } from 'react-hook-form'
import { useFormFieldsMetadataContext } from './FormFieldsMetadataContext'

export function useFieldErrorMessage<TKeys extends string>(
  fieldName: string,
  validationMessages?: Partial<Record<TKeys, string>>,
): string | undefined {
  const {
    formState: { errors },
  } = useFormContext()
  const { error } = useFormFieldsMetadataContext()

  const errorCode = errors[fieldName]?.message as TKeys | undefined
  if (errorCode && validationMessages?.[errorCode]) {
    return validationMessages[errorCode]
  }

  const fieldError = error?.fieldErrors.find(fe => fe.field === fieldName)
  if (fieldError?.message) return fieldError.message

  return undefined
}
