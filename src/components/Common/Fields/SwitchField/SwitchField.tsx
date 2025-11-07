import { useMemo } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { processDescription } from '@/components/Common/Fields/helpers/processDescription'

export interface SwitchFieldProps
  extends Omit<SwitchProps, 'name' | 'checked' | 'onChange' | 'isInvalid'>,
    UseFieldProps<boolean> {
  description?: React.ReactNode
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
    onBlur,
    inputRef,
  })

  const processedDescription = useMemo(() => processDescription(description), [description])

  return <Components.Switch {...switchProps} {...fieldProps} description={processedDescription} />
}
