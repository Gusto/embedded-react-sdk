import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { Switch, type SwitchProps } from '@/components/Common/UI/Switch'

export interface SwitchFieldProps
  extends Omit<SwitchProps, 'name' | 'checked' | 'onChange'>,
    UseFieldProps<boolean, boolean> {}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...switchProps
}: SwitchFieldProps) => {
  const { value, inputRef, ...fieldProps } = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <Switch {...fieldProps} {...switchProps} checked={value} />
}
