import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { CheckboxGroup } from '@/components/Common/UI/CheckboxGroup'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
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
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <CheckboxGroup {...fieldProps} {...checkboxGroupProps} />
}
