import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { ComboBox } from '@/components/Common/UI/ComboBox/ComboBox'
import type { ComboBoxProps } from '@/components/Common/UI/ComboBox/ComboBoxTypes'
interface ComboBoxFieldProps
  extends Omit<ComboBoxProps, 'name' | 'onChange' | 'onBlur'>,
    UseFieldProps {}

export const ComboBoxField: React.FC<ComboBoxFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
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

  return <ComboBox {...fieldProps} {...comboBoxProps} />
}
