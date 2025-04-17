import { Switch as _Switch } from 'react-aria-components'
import classNames from 'classnames'
import { useRef, useEffect } from 'react'
import { useFieldIds } from '../hooks/useFieldIds'
import { HorizontalFieldLayout } from '../HorizontalFieldLayout'
import styles from './Switch.module.scss'
import type { SwitchProps } from './SwitchTypes'

export function Switch({
  name,
  label,
  description,
  errorMessage,
  inputRef,
  isRequired,
  checked,
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

  const internalInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef) {
      if (typeof inputRef === 'function') {
        inputRef(internalInputRef.current)
      } else {
        inputRef.current = internalInputRef.current
      }
    }
  }, [inputRef])

  return (
    <HorizontalFieldLayout
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={isRequired}
      htmlFor={inputId}
      errorMessageId={errorMessageId}
      descriptionId={descriptionId}
      className={classNames(styles.root, className)}
    >
      <_Switch
        isDisabled={isDisabled}
        isSelected={checked}
        onChange={onChange}
        name={name}
        id={inputId}
        aria-describedby={ariaDescribedBy}
        aria-invalid={isInvalid}
        aria-label={label}
        inputRef={internalInputRef}
        {...props}
      >
        <div className={styles.body}>
          <div className={styles.indicator} />
        </div>
      </_Switch>
    </HorizontalFieldLayout>
  )
}
