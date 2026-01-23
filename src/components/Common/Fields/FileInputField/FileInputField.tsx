import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { FileInputProps } from '@/components/Common/UI/FileInput/FileInputTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface FileInputFieldProps
  extends
    Omit<FileInputProps, 'name' | 'value' | 'onChange' | 'isInvalid'>,
    UseFieldProps<File | null> {}

export const FileInputField: React.FC<FileInputFieldProps> = ({
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
  ...fileInputProps
}: FileInputFieldProps) => {
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

  return <Components.FileInput {...fileInputProps} {...fieldProps} />
}
