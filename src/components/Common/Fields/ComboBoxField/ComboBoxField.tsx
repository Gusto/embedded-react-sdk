import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { ComboBoxProps } from '@/components/Common/UI/ComboBox/ComboBoxTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'
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

  return <Components.ComboBox {...fieldProps} {...comboBoxProps} />
}
