import { Switch as _Switch } from 'react-aria-components'
import classNames from 'classnames'
import { useRef, useEffect } from 'react'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './Switch.module.scss'
import type { SwitchProps } from './SwitchTypes'
import { SwitchDefaults } from './SwitchTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { HorizontalFieldLayout } from '@/components/Common/HorizontalFieldLayout'

export function Switch(rawProps: SwitchProps) {
  const resolvedProps = applyMissingDefaults(rawProps, SwitchDefaults)
  const {
    name,
    label,
    description,
    errorMessage,
    inputRef,
    isRequired,
    onChange,
    isInvalid,
    isDisabled,
    id,
    shouldVisuallyHideLabel,
    className,
    value,
    ...otherProps
  } = resolvedProps
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
      shouldVisuallyHideLabel={shouldVisuallyHideLabel}
      className={classNames(styles.root, className)}
    >
      <_Switch
        isDisabled={isDisabled}
        isSelected={value}
        onChange={onChange}
        name={name}
        id={inputId}
        aria-describedby={ariaDescribedBy}
        aria-invalid={isInvalid}
        aria-label={label}
        inputRef={internalInputRef}
        {...otherProps}
      >
        <div className={styles.body}>
          <div className={styles.indicator} />
        </div>
      </_Switch>
    </HorizontalFieldLayout>
  )
}
