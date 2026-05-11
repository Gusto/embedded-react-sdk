import { useId, type ChangeEvent } from 'react'
import classNames from 'classnames'
import type { RadioProps } from '@gusto/embedded-react-sdk'
import styles from './Radio.module.scss'

export function Radio({
  id,
  name,
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled = false,
  isInvalid = false,
  inputRef,
  onChange,
  onBlur,
  value = false,
  shouldVisuallyHideLabel,
  className,
}: RadioProps) {
  const reactId = useId()
  const inputId = id ?? `il-radio-${reactId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`

  const describedByIds =
    [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked)
  }

  return (
    <label
      htmlFor={inputId}
      className={classNames(styles.root, className)}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      <input
        id={inputId}
        ref={inputRef}
        name={name}
        type="radio"
        checked={value}
        disabled={isDisabled}
        aria-describedby={describedByIds}
        onChange={handleChange}
        onBlur={onBlur}
        className={styles.input}
      />
      <span className={styles.dot} aria-hidden="true" />
      <span
        className={classNames(styles.body, {
          [styles.bodyHidden as string]: shouldVisuallyHideLabel,
        })}
      >
        <span className={styles.label}>
          {label}
          {!isRequired && <span className={styles.optional}> (optional)</span>}
        </span>
        {description && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
        {errorMessage && (
          <span id={errorId} className={styles.error} role="alert">
            {errorMessage}
          </span>
        )}
      </span>
    </label>
  )
}
