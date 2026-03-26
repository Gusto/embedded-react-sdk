import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { MultiSelectComboBoxProps } from '@/components/Common/UI/MultiSelectComboBox/MultiSelectComboBoxTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface MultiSelectComboBoxFieldProps
  extends
    Omit<MultiSelectComboBoxProps, 'name' | 'value' | 'onChange' | 'isInvalid'>,
    UseFieldProps<string[]> {}

export const MultiSelectComboBoxField: React.FC<MultiSelectComboBoxFieldProps> = ({
  rules,
  defaultValue,
  name,
  control,
  errorMessage,
  isRequired,
  onChange: onChangeFromProps,
  transform,
  description,
  onBlur,
  inputRef,
  ...multiSelectProps
}: MultiSelectComboBoxFieldProps) => {
  const Components = useComponentContext()
  const fieldProps = useField<string[]>({
    name,
    control,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange: onChangeFromProps,
    transform,
    description,
    onBlur,
    inputRef,
  })

  return <Components.MultiSelectComboBox {...multiSelectProps} {...fieldProps} />
}
