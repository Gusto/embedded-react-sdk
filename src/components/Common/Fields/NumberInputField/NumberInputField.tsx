import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { NumberInput } from '@/components/Common/UI/NumberInput'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'

export interface NumberInputFieldProps
  extends Omit<NumberInputProps, 'name' | 'value'>,
    UseFieldProps<number, number> {}

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

  return <NumberInput {...fieldProps} {...numberInputProps} />
}
