import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { RadioGroup } from '@/components/Common/UI/RadioGroup'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
export interface RadioGroupFieldProps
  extends Omit<RadioGroupProps, 'value'>,
    UseFieldProps<string> {}

export const RadioGroupField: React.FC<RadioGroupFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...radioGroupProps
}: RadioGroupFieldProps) => {
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <RadioGroup {...fieldProps} {...radioGroupProps} />
}
