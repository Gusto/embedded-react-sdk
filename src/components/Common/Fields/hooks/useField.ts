import type { RegisterOptions } from 'react-hook-form'
import { useController, useFormContext } from 'react-hook-form'
import React, { useMemo, type Ref } from 'react'
import { createMarkup } from '@/helpers/formattedStrings'
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
  description?: React.ReactNode
  inputRef?: Ref<TRef>
}

const processDescription = (description: React.ReactNode): React.ReactNode => {
  if (!description || typeof description !== 'string') {
    return description
  }

  // Use DOMPurify to sanitize the string and return a React element
  return React.createElement('div', {
    dangerouslySetInnerHTML: createMarkup(description),
  })
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
  description,
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

  const processedDescription = useMemo(() => processDescription(description), [description])

  return {
    name: field.name,
    value: value as TValue,
    inputRef: ref,
    isInvalid,
    errorMessage: isInvalid ? (errorMessage ?? fieldState.error?.message) : undefined,
    onChange: handleChange,
    onBlur: handleBlur,
    isRequired,
    description: processedDescription,
  }
}
