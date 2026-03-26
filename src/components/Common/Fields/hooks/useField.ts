import type { Control, RegisterOptions } from 'react-hook-form'
import { useController, useFormContext } from 'react-hook-form'
import React, { useMemo, type Ref } from 'react'
import { createMarkup } from '@/helpers/formattedStrings'
import { useForkRef } from '@/hooks/useForkRef/useForkRef'

export type Transform<TValue> = (value: TValue) => TValue

export interface UseFieldProps<TValue = string, TRef = HTMLInputElement> {
  name: string
  control?: Control
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
  control: controlProp,
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
  // useFormContext returns null outside FormProvider at runtime despite its non-null type signature
  const formContext = useFormContext() as ReturnType<typeof useFormContext> | null
  const resolvedControl = controlProp ?? formContext?.control

  if (!resolvedControl) {
    throw new Error('useField requires either a `control` prop or a FormProvider ancestor.')
  }

  const { field, fieldState } = useController({
    name,
    control: resolvedControl,
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

  // When control is explicitly provided (UNSTABLE_Hooks prop-based path),
  // errorMessage is a resolved error and is authoritative.
  // When control comes from context (legacy pre-built path),
  // errorMessage is a static i18n template — only display it when RHF has an error.
  const isInvalid = controlProp ? !!fieldState.error || !!errorMessage : !!fieldState.error

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
