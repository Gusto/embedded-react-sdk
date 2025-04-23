import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
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

  return <Components.Switch {...fieldProps} {...switchProps} />
}
