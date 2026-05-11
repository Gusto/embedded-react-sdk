import { useId, useRef, type ChangeEvent } from 'react'
import classNames from 'classnames'
import type { FileInputProps } from '@gusto/embedded-react-sdk'
import styles from './FileInput.module.scss'

export function FileInput({
  id,
  label,
  description,
  errorMessage,
  isRequired,
  value,
  onChange,
  onBlur,
  accept,
  isInvalid = false,
  isDisabled = false,
  className,
  'aria-describedby': ariaDescribedByFromProps,
}: FileInputProps) {
  const reactId = useId()
  const inputId = id ?? `il-fileinput-${reactId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`
  const fileRef = useRef<HTMLInputElement>(null)

  const describedByIds =
    [ariaDescribedByFromProps, description ? descriptionId : null, errorMessage ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    onChange(file)
  }

  const handleClear = () => {
    if (fileRef.current) fileRef.current.value = ''
    onChange(null)
  }

  return (
    <div
      className={classNames(styles.root, className)}
      data-invalid={isInvalid || undefined}
      data-disabled={isDisabled || undefined}
    >
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {!isRequired && <span className={styles.optional}> (optional)</span>}
      </label>
      {description && (
        <span id={descriptionId} className={styles.description}>
          {description}
        </span>
      )}
      <div className={styles.field}>
        <input
          id={inputId}
          ref={fileRef}
          type="file"
          accept={accept?.join(',')}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-required={isRequired}
          aria-describedby={describedByIds}
          onChange={handleChange}
          onBlur={onBlur}
          className={styles.input}
        />
        <label htmlFor={inputId} className={styles.button}>
          {value ? 'Replace file' : 'Choose file'}
        </label>
        <span className={styles.fileName}>{value?.name ?? 'No file selected'}</span>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isDisabled}
            className={styles.clearButton}
            aria-label="Clear file"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
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
