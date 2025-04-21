import { TextInput } from '../../UI/TextInput'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'

export interface TextInputFieldProps
  extends Omit<TextInputProps, 'name' | 'value'>,
    UseFieldProps {}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...textInputProps
}: TextInputFieldProps) => {
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <TextInput {...fieldProps} {...textInputProps} />
}
