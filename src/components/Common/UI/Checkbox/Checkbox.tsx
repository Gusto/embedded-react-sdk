import { type ChangeEvent, useCallback, useEffect, useRef } from 'react'
import classNames from 'classnames'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './Checkbox.module.scss'
import type { CheckboxProps } from './CheckboxTypes'
import { CheckboxDefaults } from './CheckboxTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { HorizontalFieldLayout } from '@/components/Common/HorizontalFieldLayout'
import IconChecked from '@/assets/icons/checkbox.svg?react'
import IconIndeterminate from '@/assets/icons/checkbox_indeterminate.svg?react'

export const Checkbox = (rawProps: CheckboxProps) => {
  const resolvedProps = applyMissingDefaults(rawProps, CheckboxDefaults)
  const {
    name,
    label,
    description,
    errorMessage,
    isRequired,
    inputRef,
    value,
    isIndeterminate,
    isInvalid,
    isDisabled,
    id,
    onChange,
    onBlur,
    className,
    shouldVisuallyHideLabel,
    ...otherProps
  } = resolvedProps

  const internalRef = useRef<HTMLInputElement>(null)
  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      ;(internalRef as React.MutableRefObject<HTMLInputElement | null>).current = node
      if (typeof inputRef === 'function') {
        inputRef(node)
      } else if (inputRef != null) {
        ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
      }
    },
    [inputRef],
  )

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.indeterminate = isIndeterminate ?? false
    }
  }, [isIndeterminate])
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked)
  }

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
      className={className}
      {...otherProps}
    >
      <div
        className={classNames(
          styles.checkboxWrapper,
          value && styles.checked,
          isIndeterminate && styles.indeterminate,
          isDisabled && styles.disabled,
        )}
      >
        <input
          type="checkbox"
          name={name}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedBy}
          checked={value}
          id={inputId}
          ref={setRef}
          onBlur={onBlur}
          onChange={handleChange}
          className={styles.checkboxInput}
        />
        <div className={styles.checkbox}>
          {isIndeterminate ? (
            <IconIndeterminate className={styles.check} />
          ) : (
            <IconChecked className={styles.check} />
          )}
        </div>
      </div>
    </HorizontalFieldLayout>
  )
}
