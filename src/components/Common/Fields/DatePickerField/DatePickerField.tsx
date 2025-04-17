import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { DatePicker } from '@/components/Common/UI/DatePicker/DatePicker'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'

interface DatePickerFieldProps
  extends Omit<DatePickerProps, 'name' | 'onChange' | 'onBlur'>,
    UseFieldProps<Date | null, Date | null> {}

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
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <DatePicker {...fieldProps} {...datePickerProps} />
}
