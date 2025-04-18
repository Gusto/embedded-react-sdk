import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'
interface SelectFieldProps
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'onBlur'>,
    UseFieldProps {}

export const SelectField: React.FC<SelectFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...selectProps
}: SelectFieldProps) => {
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

  return <Components.Select {...fieldProps} {...selectProps} />
}
