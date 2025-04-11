import { Switch as _Switch, type SwitchProps as AriaSwitchProps } from 'react-aria-components'
import { useFieldIds } from '../hooks/useFieldIds'
import {
  HorizontalFieldLayout,
  type SharedHorizontalFieldLayoutProps,
} from '../HorizontalFieldLayout'
import styles from './Switch.module.scss'

export interface SwitchProps
  extends SharedHorizontalFieldLayoutProps,
    Omit<AriaSwitchProps, 'children'> {
  isSelected?: boolean
  onChange?: (isSelected: boolean) => void
  isInvalid?: boolean
  isDisabled?: boolean
  className?: string
  label: string
}

export function Switch({
  name,
  label,
  description,
  errorMessage,
  isRequired,
  isSelected,
  onChange,
  isInvalid = false,
  isDisabled = false,
  id,
  className,
  ...props
}: SwitchProps) {
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  return (
    <HorizontalFieldLayout
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={isRequired}
      htmlFor={inputId}
      errorMessageId={errorMessageId}
      descriptionId={descriptionId}
      className={className}
    >
      <_Switch
        isDisabled={isDisabled}
        isSelected={isSelected}
        onChange={onChange}
        name={name}
        id={inputId}
        aria-describedby={ariaDescribedBy}
        aria-invalid={isInvalid}
        aria-label={label}
        {...props}
      >
        <div className={styles.body}>
          <div className={styles.indicator} />
        </div>
      </_Switch>
    </HorizontalFieldLayout>
  )
}
