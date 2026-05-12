import { useId, type ChangeEvent } from 'react'
import classNames from 'classnames'
import type { CheckboxProps } from '@gusto/embedded-react-sdk'
import styles from './Checkbox.module.scss'

export function Checkbox({
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
}: CheckboxProps) {
  const reactId = useId()
  const inputId = id ?? `il-checkbox-${reactId}`
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
        type="checkbox"
        checked={value}
        disabled={isDisabled}
        aria-invalid={isInvalid}
        aria-required={isRequired}
        aria-describedby={describedByIds}
        onChange={handleChange}
        onBlur={onBlur}
        className={styles.input}
      />
      <span className={styles.box} aria-hidden="true">
        <svg viewBox="0 0 11 9" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.7176 1.69648L4.17652 8.4358L0.282471 4.42375L1.71763 3.0308L4.17652 5.5642L9.28247 0.303528L10.7176 1.69648Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span
        className={classNames(styles.body, {
          [styles.bodyHidden as string]: shouldVisuallyHideLabel,
        })}
      >
        <span className={styles.labelWrapper}>
          <span className={styles.label}>
            {label}
            {!isRequired && <span className={styles.optional}> (optional)</span>}
          </span>
          {description && (
            <span id={descriptionId} className={styles.description}>
              {description}
            </span>
          )}
        </span>
        {errorMessage && (
          <span id={errorId} className={styles.error} role="alert">
            {errorMessage}
          </span>
        )}
      </span>
    </label>
  )
}
