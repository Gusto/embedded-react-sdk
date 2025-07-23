import React from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { parseDateStringToLocal, formatDateToStringDate } from '@/helpers/dateFormatting'

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
   * Timezone-safe onChange handler that fixes the core DatePicker interface issue.
   * This intercepts Date objects from component adapters and corrects timezone problems
   * before they reach the form system, ensuring ALL DatePicker usage is timezone-safe.
   */
  const handleTimezoneSafeChange = React.useCallback(
    (value: Date | null) => {
      if (!value) {
        fieldProps.onChange(value)
        return
      }

      // Check if this Date object has timezone shift issues
      // (non-midnight time usually indicates it was created from `new Date(dateString)`)
      const hasTimezoneIssue =
        value.getHours() !== 0 || value.getMinutes() !== 0 || value.getSeconds() !== 0

      if (hasTimezoneIssue) {
        // Fix the date by extracting intended date components and recreating in local timezone
        const dateString = formatDateToStringDate(value)
        if (dateString) {
          const correctedDate = parseDateStringToLocal(dateString)
          fieldProps.onChange(correctedDate)
        } else {
          // Fallback to original value if formatting fails (e.g., invalid date)
          fieldProps.onChange(value)
        }
      } else {
        fieldProps.onChange(value)
      }
    },
    [fieldProps.onChange],
  )

  return (
    <Components.DatePicker
      {...fieldProps}
      {...datePickerProps}
      onChange={handleTimezoneSafeChange}
    />
  )
}
