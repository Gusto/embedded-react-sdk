import type { RegisterOptions } from 'react-hook-form'
import { useController, useFormContext } from 'react-hook-form'

export type Transform<TChangeArg, TValue> = (changeArg: TChangeArg) => TValue

export interface UseFieldProps<TChangeArg, TValue = string> {
  name: string
  rules?: RegisterOptions
  defaultValue?: TValue
  errorMessage?: string
  isRequired?: boolean
  onChange?: (changeArg: TChangeArg) => void
  transform?: Transform<TChangeArg, TValue>
}

export function useField<TChangeArg, TValue = string>({
  name,
  rules = {},
  defaultValue,
  errorMessage,
  isRequired = false,
  onChange,
  transform,
}: UseFieldProps<TChangeArg, TValue>) {
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

  const handleChange = (changeArg: TChangeArg) => {
    const value = transform ? transform(changeArg) : changeArg
    field.onChange(value)
    onChange?.(changeArg)
  }

  const isInvalid = !!fieldState.error

  return {
    ...restFieldProps,
    inputRef: ref,
    isInvalid,
    errorMessage: isInvalid ? (errorMessage ?? fieldState.error?.message) : undefined,
    onChange: handleChange,
    isRequired,
  }
}
