import type { RegisterOptions } from 'react-hook-form'
import { useController, useFormContext } from 'react-hook-form'

export type Transform<TValue> = (value: TValue) => TValue

export interface UseFieldProps<TValue = string> {
  name: string
  rules?: RegisterOptions
  defaultValue?: TValue
  errorMessage?: string
  isRequired?: boolean
  onChange?: (value: TValue) => void
  transform?: Transform<TValue>
}

export function useField<TValue = string>({
  name,
  rules = {},
  defaultValue,
  errorMessage,
  isRequired = false,
  onChange,
  transform,
}: UseFieldProps<TValue>) {
  const { control } = useFormContext()
  const { field, fieldState } = useController({
    name,
    control,
    rules: {
      required: isRequired,
      ...rules,
    },
    defaultValue,
  })

  const { ref, ...restFieldProps } = field

  const handleChange = (updatedValue: TValue) => {
    const value = transform ? transform(updatedValue) : updatedValue
    field.onChange(value)
    onChange?.(value)
  }

  const isInvalid = !!fieldState.error

  return {
    ...restFieldProps,
    value: field.value as TValue,
    inputRef: ref,
    isInvalid,
    errorMessage: isInvalid ? (errorMessage ?? fieldState.error?.message) : undefined,
    onChange: handleChange,
    isRequired,
  }
}
