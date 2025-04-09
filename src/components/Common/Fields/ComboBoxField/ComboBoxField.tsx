import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { ComboBox } from '@/components/Common/UI/ComboBox/ComboBox'

interface ComboBoxItem {
  id: string
  name: string
}

interface ComboBoxFieldProps
  extends Omit<React.ComponentProps<typeof ComboBox>, 'name' | 'onChange' | 'onBlur' | 'options'>,
    UseFieldProps<string> {
  items: ComboBoxItem[]
}

export const ComboBoxField: React.FC<ComboBoxFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  items,
  ...comboBoxProps
}: ComboBoxFieldProps) => {
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return (
    <ComboBox
      {...fieldProps}
      options={items.map(item => ({ label: item.name, value: item.id }))}
      {...comboBoxProps}
    />
  )
}
