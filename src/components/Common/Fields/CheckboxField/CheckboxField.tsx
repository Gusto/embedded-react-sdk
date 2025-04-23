import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface CheckboxFieldProps
  extends Omit<CheckboxProps, 'name' | 'value'>,
    UseFieldProps<boolean> {}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...checkboxProps
}: CheckboxFieldProps) => {
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

  return <Components.Checkbox {...fieldProps} {...checkboxProps} />
}
