import React from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { normalizeDateToLocal } from '@/helpers/dateFormatting'

interface DatePickerFieldProps
  extends Omit<DatePickerProps, 'name' | 'onChange' | 'onBlur'>,
    UseFieldProps<Date | null> {}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...datePickerProps
}: DatePickerFieldProps) => {
  const Components = useComponentContext()
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  /**
   * Normalizes dates from any adapter to ensure they represent the intended local date,
   * handling timezone issues that can occur when adapters use `new Date(dateString)`.
   */
  const handleTimezoneSafeChange = React.useCallback(
    (value: Date | null) => {
      // Normalize the date to ensure it represents the intended local date
      const normalizedDate = normalizeDateToLocal(value)
      fieldProps.onChange(normalizedDate)
    },
    [fieldProps],
  )

  return (
    <Components.DatePicker
      {...fieldProps}
      {...datePickerProps}
      onChange={handleTimezoneSafeChange}
    />
  )
}
