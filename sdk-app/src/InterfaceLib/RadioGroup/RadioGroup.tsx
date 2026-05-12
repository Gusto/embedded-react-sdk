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
  const groupName = `il-radiogroup-${reactId}`
  const descriptionId = `${groupName}-description`
  const errorId = `${groupName}-error`

  const currentValue = value ?? defaultValue ?? null

  const describedByIds =
    [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value)
  }

  return (
    <fieldset
      className={classNames(styles.root, className)}
      aria-describedby={describedByIds}
      aria-invalid={isInvalid}
      disabled={isDisabled}
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
        <div id={descriptionId} className={styles.groupDescription}>
          {description}
        </div>
      )}
      <div className={styles.options}>
        {options.map((option, index) => {
          const optionId = `${groupName}-${option.value}`
          const isSelected = currentValue === option.value
          const optionDisabled = isDisabled || option.isDisabled
          const selectThis = () => {
            if (!optionDisabled) onChange?.(option.value)
          }
          return (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <label
              key={option.value}
              htmlFor={optionId}
              className={styles.card}
              data-selected={isSelected || undefined}
              data-disabled={optionDisabled || undefined}
              tabIndex={optionDisabled ? -1 : 0}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  selectThis()
                }
              }}
            >
              <input
                id={optionId}
                ref={index === 0 ? inputRef : undefined}
                type="radio"
                value={option.value}
                checked={isSelected}
                disabled={optionDisabled}
                tabIndex={optionDisabled ? -1 : 0}
                onChange={handleChange}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    selectThis()
                  }
                }}
                className={styles.input}
              />
              <span className={styles.cardBody}>
                <span className={styles.cardLabel}>{option.label}</span>
                {option.description && (
                  <span className={styles.cardDescription}>{option.description}</span>
                )}
              </span>
              <span className={styles.box} aria-hidden="true" />
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
