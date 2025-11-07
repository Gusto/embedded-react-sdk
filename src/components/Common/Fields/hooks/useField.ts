import type { RegisterOptions } from 'react-hook-form'
import { useController, useFormContext } from 'react-hook-form'
import type { Ref } from 'react'
import { useForkRef } from '@/hooks/useForkRef/useForkRef'

export type Transform<TValue> = (value: TValue) => TValue

export interface UseFieldProps<TValue = string, TRef = HTMLInputElement> {
  name: string
  rules?: RegisterOptions
  defaultValue?: TValue
  errorMessage?: string
  isRequired?: boolean
  onChange?: (value: TValue) => void
  onBlur?: () => void
  transform?: Transform<TValue>
  inputRef?: Ref<TRef>
}

export function useField<TValue = string, TRef = HTMLInputElement>({
  name,
  rules = {},
  defaultValue,
  errorMessage,
  isRequired = false,
  onChange,
  onBlur,
  transform,
  inputRef,
}: UseFieldProps<TValue, TRef>) {
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

  const { value } = field

  const ref = useForkRef(field.ref, inputRef)

  const handleChange = (updatedValue: TValue) => {
    const value = transform ? transform(updatedValue) : updatedValue
    field.onChange(value)
    onChange?.(value)
  }

  const handleBlur = () => {
    field.onBlur()
    onBlur?.()
  }

  const isInvalid = !!fieldState.error

  return {
    name: field.name,
    value: value as TValue,
    inputRef: ref,
    isInvalid,
    errorMessage: isInvalid ? (errorMessage ?? fieldState.error?.message) : undefined,
    onChange: handleChange,
    onBlur: handleBlur,
    isRequired,
  }
}

export type UseFieldReturn<TValue = string, TRef = HTMLInputElement> = ReturnType<
  typeof useField<TValue, TRef>
>
