import type { RegisterOptions } from 'react-hook-form'
import { useController, useFormContext } from 'react-hook-form'

export type Transform<TEvent, TValue> = (event: TEvent) => TValue

export interface UseFieldProps<TEvent, TValue = string> {
  name: string
  rules?: RegisterOptions
  defaultValue?: TValue
  errorMessage?: string
  isRequired?: boolean
  onChange?: (event: TEvent) => void
  transform?: Transform<TEvent, TValue>
}

export function useField<TEvent, TValue = string>({
  name,
  rules = {},
  defaultValue,
  errorMessage,
  isRequired = false,
  onChange,
  transform,
}: UseFieldProps<TEvent, TValue>) {
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

  const handleChange = (event: TEvent) => {
    const value = transform ? transform(event) : event
    field.onChange(value)
    onChange?.(event)
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
