import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export interface NumberInputFieldProps
  extends Omit<NumberInputProps, 'name' | 'value'>,
    UseFieldProps<number> {}

export const NumberInputField: React.FC<NumberInputFieldProps> = ({
  rules: providedRules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
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
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <Components.NumberInput {...fieldProps} {...numberInputProps} />
}
