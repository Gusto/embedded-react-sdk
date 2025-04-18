import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { Select } from '@/components/Common/UI/Select'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
interface SelectFieldProps
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'onBlur'>,
    UseFieldProps {}

export const SelectField: React.FC<SelectFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...selectProps
}: SelectFieldProps) => {
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <Select {...fieldProps} {...selectProps} />
}
