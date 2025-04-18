import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { Switch } from '@/components/Common/UI/Switch'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
export interface SwitchFieldProps
  extends Omit<SwitchProps, 'name' | 'checked' | 'onChange'>,
    UseFieldProps<boolean> {}

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
  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <Switch {...fieldProps} {...switchProps} />
}
