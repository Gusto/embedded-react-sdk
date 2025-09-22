import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface TextInputFieldProps
  extends Omit<TextInputProps, 'name' | 'value' | 'isInvalid'>,
    UseFieldProps {}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  description,
  onBlur,
  inputRef,
  ...textInputProps
}: TextInputFieldProps) => {
  const Components = useComponentContext()
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
    description,
    onBlur,
    inputRef,
  })

  return <Components.TextInput {...textInputProps} {...fieldProps} />
}
