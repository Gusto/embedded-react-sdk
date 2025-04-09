import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { ComboBoxItem } from '@/components/Common/UI/ComboBox/ComboBox'
import { ComboBox } from '@/components/Common/UI/ComboBox/ComboBox'

interface ComboBoxFieldProps
  extends Omit<React.ComponentProps<typeof ComboBox>, 'name' | 'onChange' | 'onBlur' | 'options'>,
    UseFieldProps<string> {
  options: ComboBoxItem[]
}

export const ComboBoxField: React.FC<ComboBoxFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  options,
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
      {...comboBoxProps}
      options={options.map(o => ({ label: o.name, value: o.id }))}
    />
  )
}
