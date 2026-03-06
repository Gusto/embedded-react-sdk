import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  normalizeDateToLocal,
  normalizeToDate,
  formatDateToStringDate,
} from '@/helpers/dateFormatting'

type DateFieldValue = string | Date | null

interface DatePickerFieldProps<TValue extends DateFieldValue = Date | null>
  extends
    Omit<DatePickerProps, 'name' | 'onChange' | 'isInvalid' | 'value'>,
    UseFieldProps<TValue> {}

export const DatePickerField = <TValue extends DateFieldValue = Date | null>({
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
  ...datePickerProps
}: DatePickerFieldProps<TValue>) => {
  const Components = useComponentContext()
  const {
    value: fieldValue,
    onChange: fieldOnChange,
    ...restFieldProps
  } = useField<TValue>({
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

  const isStringMode = typeof fieldValue === 'string'

  const toDateValue = (): Date | null => {
    if (fieldValue == null) return null
    if (fieldValue instanceof Date) return fieldValue
    if (typeof fieldValue === 'string' && fieldValue) return normalizeToDate(fieldValue)
    return null
  }

  const handleChange = (value: Date | null) => {
    const normalizedDate = normalizeDateToLocal(value)

    if (isStringMode) {
      const dateString = normalizedDate ? (formatDateToStringDate(normalizedDate) ?? '') : ''
      fieldOnChange(dateString as TValue)
    } else {
      fieldOnChange(normalizedDate as TValue)
    }
  }

  return (
    <Components.DatePicker
      {...datePickerProps}
      {...restFieldProps}
      value={toDateValue()}
      onChange={handleChange}
    />
  )
}
