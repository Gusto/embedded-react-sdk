import type { ComponentType } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface NumberInputFieldProps
  extends Omit<NumberInputProps, 'name' | 'value' | 'isInvalid'>, UseFieldProps<number> {
  FieldComponent?: ComponentType<NumberInputProps>
}

export const NumberInputField: React.FC<NumberInputFieldProps> = ({
  rules: providedRules,
  defaultValue,
  name,
  control,
  errorMessage,
  isRequired,
  onChange,
  transform,
  description,
  onBlur,
  inputRef,
  FieldComponent,
  ...numberInputProps
}: NumberInputFieldProps) => {
  const Components = useComponentContext()
  const rules = {
    validate: (value: number) => {
      if (isRequired && isNaN(value)) {
        return false
      }
      return true
    },
    ...providedRules,
  }

  const fieldProps = useField({
    name,
    control,
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

  const RenderComponent = FieldComponent ?? Components.NumberInput
  return <RenderComponent {...numberInputProps} {...fieldProps} />
}
