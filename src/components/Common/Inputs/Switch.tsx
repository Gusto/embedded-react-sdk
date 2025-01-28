import { useId, type ReactNode } from 'react'
import { Switch as _Switch, type SwitchProps as AriaSwitchProps } from 'react-aria-components'
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form'

interface SwitchProps<T extends FieldValues>
  extends Omit<AriaSwitchProps, 'isSelected' | 'onChange' | 'defaultSelected'> {
  control: Control<T>
  children?: ReactNode
  name: Path<T>
  label: ReactNode
  description?: string | ReactNode
  isRequired?: boolean
}

export function Switch<T extends FieldValues>({
  control,
  name,
  label,
  children,
  isRequired,
  ...props
}: SwitchProps<T>) {
  const descriptionId = useId()
  const { field } = useController({ name, control })

  return (
    <>
      <input type="checkbox" checked={field.value} style={{ display: 'none' }} {...field} />
      <_Switch isSelected={field.value} aria-describedby={descriptionId} {...field} {...props}>
        <div className="indicator" />
        <div className="switch-details">
          {label && <span className="switch-label">{label}</span>}
        </div>
      </_Switch>
    </>
  )
}
Switch.displayName = 'Switch'
