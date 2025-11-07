import { useMemo } from 'react'
import {
  useField,
  type UseFieldProps,
  type UseFieldReturn,
} from '@/components/Common/Fields/hooks/useField'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { processDescription } from '@/components/Common/Fields/helpers/processDescription'

export interface TextInputFieldProps
  extends Omit<TextInputProps, 'name' | 'value' | 'isInvalid'>,
    UseFieldProps {
  renderInput?: (props: UseFieldReturn) => React.ReactNode
  description?: React.ReactNode
}

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
  renderInput,
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
    onBlur,
    inputRef,
  })

  const processedDescription = useMemo(() => processDescription(description), [description])

  return renderInput ? (
    renderInput(fieldProps)
  ) : (
    <Components.TextInput {...textInputProps} {...fieldProps} description={processedDescription} />
  )
}
