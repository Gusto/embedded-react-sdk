import React from 'react'
import type { ComponentType } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { normalizeDateToLocal } from '@/helpers/dateFormatting'

export interface DatePickerFieldProps
  extends Omit<DatePickerProps, 'name' | 'onChange' | 'isInvalid'>, UseFieldProps<Date | null> {
  FieldComponent?: ComponentType<DatePickerProps>
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  description,
  onBlur,
  inputRef,
  FieldComponent,
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
    description,
    onBlur,
    inputRef,
  })

  const handleTimezoneSafeChange = React.useCallback(
    (value: Date | null) => {
      const normalizedDate = normalizeDateToLocal(value)
      fieldProps.onChange(normalizedDate)
    },
    [fieldProps],
  )

  const RenderComponent = FieldComponent ?? Components.DatePicker
  return (
    <RenderComponent {...datePickerProps} {...fieldProps} onChange={handleTimezoneSafeChange} />
  )
}
