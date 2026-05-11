import { useId, type ChangeEvent } from 'react'
import classNames from 'classnames'
import type { RadioGroupProps } from '@gusto/embedded-react-sdk'
import styles from './RadioGroup.module.scss'

export function RadioGroup({
  label,
  description,
  errorMessage,
  isRequired,
  isInvalid = false,
  isDisabled = false,
  options,
  value,
  defaultValue,
  onChange,
  inputRef,
  shouldVisuallyHideLabel,
  className,
}: RadioGroupProps) {
  const reactId = useId()
  const groupId = `il-radiogroup-${reactId}`
  const groupName = `${groupId}-name`
  const descriptionId = `${groupId}-description`
  const errorId = `${groupId}-error`

  const describedByIds =
    [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  const selectedValue = value ?? defaultValue ?? null

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
          const optionDisabled = isDisabled || option.isDisabled
          const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.checked) onChange?.(option.value)
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
                type="radio"
                name={groupName}
                value={option.value}
                checked={selectedValue === option.value}
                disabled={optionDisabled}
                aria-describedby={optionDescriptionId}
                onChange={handleChange}
                className={styles.input}
              />
              <span className={styles.dot} aria-hidden="true" />
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
