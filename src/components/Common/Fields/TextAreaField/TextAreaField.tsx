import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { TextAreaProps } from '@/components/Common/UI/TextArea/TextAreaTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface TextAreaFieldProps
  extends Omit<TextAreaProps, 'name' | 'value' | 'isInvalid'>,
    UseFieldProps<string, HTMLTextAreaElement> {}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
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
  ...textAreaProps
}: TextAreaFieldProps) => {
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

  return <Components.TextArea {...textAreaProps} {...fieldProps} />
}
