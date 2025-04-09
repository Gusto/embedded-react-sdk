import type { SelectItem } from '../../UI/Select/Select'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { Select } from '@/components/Common/UI/Select'

interface SelectFieldProps
  extends Omit<React.ComponentProps<typeof Select>, 'name' | 'onChange' | 'onBlur' | 'options'>,
    UseFieldProps<string> {
  items: SelectItem[]
  children?: (item: SelectItem) => React.ReactNode
}

export const SelectField: React.FC<SelectFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  items,
  children,
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

  return <Select {...fieldProps} options={items.map(item => item)} {...selectProps} />
}
