import { useId, type ChangeEvent } from 'react'
import classNames from 'classnames'
import type { TextAreaProps } from '@gusto/embedded-react-sdk'
import { InfoTooltip } from '../InfoTooltip'
import styles from './TextArea.module.scss'

export function TextArea({
  name,
  label,
  description,
  errorMessage,
  isRequired,
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
  rows = 4,
  cols,
  'aria-describedby': ariaDescribedByFromProps,
}: TextAreaProps) {
  const reactId = useId()
  const inputId = id ?? `il-textarea-${reactId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`

  const describedByIds =
    [ariaDescribedByFromProps, description ? descriptionId : null, errorMessage ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
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
        <label htmlFor={inputId} className={styles.labelInputContainer}>
          <textarea
            id={inputId}
            ref={inputRef}
            name={name}
            value={value ?? ''}
            placeholder={placeholder ?? ' '}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={isDisabled}
            rows={rows}
            cols={cols}
            aria-invalid={isInvalid}
            aria-required={isRequired}
            aria-describedby={describedByIds}
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
      </div>

      {errorMessage && (
        <div id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
