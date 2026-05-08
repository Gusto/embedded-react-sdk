import { useId, type ChangeEvent } from 'react'
import classNames from 'classnames'
import type { TextInputProps } from '@gusto/embedded-react-sdk'
import { InfoTooltip } from '../InfoTooltip'
import styles from './TextInput.module.scss'

export function TextInput({
  name,
  label,
  description,
  errorMessage,
  isRequired,
  type = 'text',
  inputRef,
  isInvalid = false,
  isDisabled = false,
  id,
  value,
  placeholder,
  onChange,
  onBlur,
  className,
  shouldVisuallyHideLabel,
  adornmentEnd,
  adornmentStart,
  min,
  max,
  maxLength,
  'aria-describedby': ariaDescribedByFromProps,
  'aria-labelledby': ariaLabelledBy,
}: TextInputProps) {
  const reactId = useId()
  const inputId = id ?? `il-textinput-${reactId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`

  const describedByIds =
    [ariaDescribedByFromProps, description ? descriptionId : null, errorMessage ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value)
  }

  return (
    <div
      className={classNames(styles.root, className)}
      data-invalid={isInvalid || undefined}
      data-disabled={isDisabled || undefined}
    >
      {description && (
        <span id={descriptionId} className={styles.visuallyHidden}>
          {description}
        </span>
      )}

      <div className={styles.field}>
        {adornmentStart && <span className={styles.adornmentStart}>{adornmentStart}</span>}

        <label htmlFor={inputId} className={styles.labelInputContainer}>
          <input
            id={inputId}
            ref={inputRef}
            name={name}
            type={type}
            value={value ?? ''}
            placeholder={placeholder ?? ' '}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={isDisabled}
            aria-invalid={isInvalid}
            aria-required={isRequired}
            aria-describedby={describedByIds}
            aria-labelledby={ariaLabelledBy}
            min={min}
            max={max}
            maxLength={maxLength}
            className={styles.input}
          />
          <span
            className={classNames(styles.label, {
              [styles.labelHidden as string]: shouldVisuallyHideLabel,
            })}
          >
            {label}
            {!isRequired && <span className={styles.optional}> (optional)</span>}
          </span>
        </label>

        {description && (
          <span className={styles.tooltipSlot}>
            <InfoTooltip>{description}</InfoTooltip>
          </span>
        )}
        {adornmentEnd && <span className={styles.adornmentEnd}>{adornmentEnd}</span>}
      </div>

      {errorMessage && (
        <div id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
