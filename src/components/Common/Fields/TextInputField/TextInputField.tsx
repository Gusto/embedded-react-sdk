import type { ChangeEvent } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { TextInput, type TextInputProps } from '@/components/Common/UI/TextInput'

interface TextInputFieldProps
  extends Omit<TextInputProps, 'name'>,
    UseFieldProps<ChangeEvent<HTMLInputElement>> {}

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
