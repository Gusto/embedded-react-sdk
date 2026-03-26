import React from 'react'
import type { ComponentType } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  normalizeDateToLocal,
  normalizeToDate,
  formatDateToStringDate,
} from '@/helpers/dateFormatting'

type DateFieldValue = string | Date | null

export interface DatePickerFieldProps<TValue extends DateFieldValue = Date | null>
  extends Omit<DatePickerProps, 'name' | 'onChange' | 'isInvalid'>, UseFieldProps<TValue> {
  FieldComponent?: ComponentType<DatePickerProps>
}

export const DatePickerField = <TValue extends DateFieldValue = Date | null>({
  rules,
  defaultValue,
  name,
  control,
  errorMessage,
  isRequired,
  onChange,
  transform,
  description,
  onBlur,
  inputRef,
  FieldComponent,
  ...datePickerProps
}: DatePickerFieldProps<TValue>) => {
  const Components = useComponentContext()
  const {
    value: fieldValue,
    onChange: fieldOnChange,
    ...restFieldProps
  } = useField<TValue>({
    name,
    control,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
    description,
    onBlur,
    inputRef,
  })

  const isStringMode = typeof fieldValue === 'string'

  const toDateValue = (): Date | null => {
    if (fieldValue == null) return null
    if (fieldValue instanceof Date) return fieldValue
    if (typeof fieldValue === 'string' && fieldValue) return normalizeToDate(fieldValue)
    return null
  }

  const handleChange = React.useCallback(
    (value: Date | null) => {
      const normalizedDate = normalizeDateToLocal(value)

      if (isStringMode) {
        const dateString = normalizedDate ? (formatDateToStringDate(normalizedDate) ?? '') : ''
        fieldOnChange(dateString as TValue)
      } else {
        fieldOnChange(normalizedDate as TValue)
      }
    },
    [isStringMode, fieldOnChange],
  )

  const RenderComponent = FieldComponent ?? Components.DatePicker
  return (
    <RenderComponent
      {...datePickerProps}
      {...restFieldProps}
      value={toDateValue()}
      onChange={handleChange}
    />
  )
}
