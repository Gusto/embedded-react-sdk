import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { MultiSelectComboBoxProps } from '@/components/Common/MultiSelectComboBox/MultiSelectComboBoxTypes'
import { MultiSelectComboBox } from '@/components/Common/MultiSelectComboBox/MultiSelectComboBox'

export interface MultiSelectComboBoxFieldProps
  extends
    Omit<MultiSelectComboBoxProps, 'name' | 'value' | 'onChange' | 'isInvalid'>,
    UseFieldProps<string[]> {}

export const MultiSelectComboBoxField: React.FC<MultiSelectComboBoxFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange: onChangeFromProps,
  transform,
  description,
  onBlur,
  inputRef,
  ...multiSelectProps
}: MultiSelectComboBoxFieldProps) => {
  const fieldProps = useField<string[]>({
    name,
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

  return <MultiSelectComboBox {...multiSelectProps} {...fieldProps} />
}
