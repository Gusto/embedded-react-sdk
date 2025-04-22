import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'
export interface RadioGroupFieldProps extends Omit<RadioGroupProps, 'value'>, UseFieldProps {}

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
  const Components = useComponentContext()
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <Components.RadioGroup {...fieldProps} {...radioGroupProps} />
}
