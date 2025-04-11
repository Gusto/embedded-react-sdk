import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { DatePicker } from '@/components/Common/UI/DatePicker/DatePicker'

interface DatePickerFieldProps
  extends Omit<React.ComponentProps<typeof DatePicker>, 'name' | 'onChange' | 'onBlur'>,
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
