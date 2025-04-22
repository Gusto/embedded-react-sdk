import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'
export interface CheckboxGroupFieldProps
  extends Omit<CheckboxGroupProps, 'value'>,
    UseFieldProps<string[]> {}

export const CheckboxGroupField: React.FC<CheckboxGroupFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...checkboxGroupProps
}: CheckboxGroupFieldProps) => {
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

  return <Components.CheckboxGroup {...fieldProps} {...checkboxGroupProps} />
}
