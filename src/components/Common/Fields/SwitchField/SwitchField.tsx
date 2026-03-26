import type { ComponentType } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
export interface SwitchFieldProps
  extends Omit<SwitchProps, 'name' | 'checked' | 'onChange' | 'isInvalid'>, UseFieldProps<boolean> {
  FieldComponent?: ComponentType<SwitchProps>
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  description,
  onBlur,
  inputRef,
  FieldComponent,
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
    description,
    onBlur,
    inputRef,
  })

  const RenderComponent = FieldComponent ?? Components.Switch
  return <RenderComponent {...switchProps} {...fieldProps} />
}
