import { useId, type ChangeEvent } from 'react'
import classNames from 'classnames'
import type { CheckboxGroupProps } from '@gusto/embedded-react-sdk'
import styles from './CheckboxGroup.module.scss'

export function CheckboxGroup({
  label,
  description,
  errorMessage,
  isRequired,
  isInvalid = false,
  isDisabled = false,
  options,
  value = [],
  onChange,
  inputRef,
  shouldVisuallyHideLabel,
  className,
}: CheckboxGroupProps) {
  const reactId = useId()
  const groupId = `il-checkboxgroup-${reactId}`
  const descriptionId = `${groupId}-description`
  const errorId = `${groupId}-error`

  const describedByIds =
    [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  const handleToggle = (optionValue: string, checked: boolean) => {
    const next = checked ? [...value, optionValue] : value.filter(v => v !== optionValue)
    onChange?.(next)
  }

  return (
    <fieldset
      className={classNames(styles.root, className)}
      data-invalid={isInvalid || undefined}
      data-disabled={isDisabled || undefined}
      disabled={isDisabled}
      aria-describedby={describedByIds}
    >
      <legend
        className={classNames(styles.legend, {
          [styles.legendHidden as string]: shouldVisuallyHideLabel,
        })}
      >
        {label}
        {!isRequired && <span className={styles.optional}> (optional)</span>}
      </legend>
      {description && (
        <span id={descriptionId} className={styles.description}>
          {description}
        </span>
      )}
      <div className={styles.options}>
        {options.map((option, index) => {
          const optionId = `${groupId}-${option.value}`
          const optionDescriptionId = option.description ? `${optionId}-description` : undefined
          const checked = value.includes(option.value)
          const optionDisabled = isDisabled || option.isDisabled
          const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            handleToggle(option.value, event.target.checked)
          }
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={styles.option}
              data-disabled={optionDisabled || undefined}
            >
              <input
                id={optionId}
                ref={index === 0 ? inputRef : undefined}
                type="checkbox"
                checked={checked}
                disabled={optionDisabled}
                aria-invalid={isInvalid}
                aria-describedby={optionDescriptionId}
                onChange={handleChange}
                className={styles.input}
              />
              <span className={styles.box} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" className={styles.check}>
                  <path
                    d="M2 7l3.5 3.5L12 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </span>
              <span className={styles.optionBody}>
                <span className={styles.optionLabel}>{option.label}</span>
                {option.description && (
                  <span id={optionDescriptionId} className={styles.optionDescription}>
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          )
        })}
      </div>
      {errorMessage && (
        <div id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </div>
      )}
    </fieldset>
  )
}
