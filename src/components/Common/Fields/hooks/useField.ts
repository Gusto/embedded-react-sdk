import type { RegisterOptions } from 'react-hook-form'
import { useController, useFormContext } from 'react-hook-form'
import React, { useMemo } from 'react'
import { createMarkup } from '@/helpers/formattedStrings'

export type Transform<TValue> = (value: TValue) => TValue

export interface UseFieldProps<TValue = string> {
  name: string
  rules?: RegisterOptions
  defaultValue?: TValue
  errorMessage?: string
  isRequired?: boolean
  onChange?: (value: TValue) => void
  transform?: Transform<TValue>
  description?: React.ReactNode
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

export function useField<TValue = string>({
  name,
  rules = {},
  defaultValue,
  errorMessage,
  isRequired = false,
  onChange,
  transform,
  description,
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

  const processedDescription = useMemo(() => processDescription(description), [description])

  return {
    ...restFieldProps,
    value: field.value as TValue,
    inputRef: ref,
    isInvalid,
    errorMessage: isInvalid ? (errorMessage ?? fieldState.error?.message) : undefined,
    onChange: handleChange,
    isRequired,
    description: processedDescription,
  }
}
