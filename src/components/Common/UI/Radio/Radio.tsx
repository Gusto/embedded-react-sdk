import type { ChangeEvent } from 'react'
import classNames from 'classnames'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './Radio.module.scss'
import type { RadioProps } from './RadioTypes'
import { RadioDefaults } from './RadioTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { HorizontalFieldLayout } from '@/components/Common/HorizontalFieldLayout'

/**
 * Renders a single radio button with label, description, and error message support.
 *
 * @remarks
 * Use {@link RadioGroup} when presenting multiple mutually exclusive options together — this
 * primitive is the building block for a single radio entry.
 *
 * @param rawProps - The {@link RadioProps} controlling the radio's label, checked state, and validation.
 * @returns The rendered radio input with its associated label.
 * @internal
 */
export const Radio = (rawProps: RadioProps) => {
  const resolvedProps = applyMissingDefaults(rawProps, RadioDefaults)
  const {
    name,
    label,
    description,
    errorMessage,
    isRequired,
    inputRef,
    value,
    isInvalid,
    isDisabled,
    id,
    onChange,
    onBlur,
    shouldVisuallyHideLabel,
    className,
    ...otherProps
  } = resolvedProps
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
      <div className={styles.radioWrapper}>
        <input
          type="radio"
          name={name}
          disabled={isDisabled}
          aria-describedby={ariaDescribedBy}
          checked={value}
          id={inputId}
          ref={inputRef}
          onBlur={onBlur}
          onChange={handleChange}
          className={styles.radioInput}
        />
        <div className={classNames(styles.radio, { [styles.checked as string]: value })}>
          {value && <div className={styles.radioDot} />}
        </div>
      </div>
    </HorizontalFieldLayout>
  )
}
