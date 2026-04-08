import { useFieldIds } from '../hooks/useFieldIds'
import styles from './Checkbox.module.scss'
import type { CheckboxProps } from './CheckboxTypes'
import { CheckboxDefaults } from './CheckboxTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { HorizontalFieldLayout } from '@/components/Common/HorizontalFieldLayout'
import IconChecked from '@/assets/icons/checkbox.svg?react'

const noop = () => {}

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
    isInvalid,
    isDisabled,
    id,
    onChange,
    onBlur,
    className,
    shouldVisuallyHideLabel,
    ...otherProps
  } = resolvedProps
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  const handleClick = () => {
    if (isDisabled) return
    onChange?.(!(value ?? false))
  }

  const wrapperClassName = [
    styles.checkboxWrapper,
    value && styles.checked,
    isDisabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(' ')

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
      <div className={wrapperClassName} data-checked={value ?? false}>
        <input
          type="checkbox"
          name={name}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedBy}
          checked={value}
          id={inputId}
          ref={inputRef}
          onBlur={onBlur}
          onChange={noop}
          onClick={handleClick}
          className={styles.checkboxInput}
        />
        <div className={styles.checkbox}>
          <IconChecked className={styles.check} />
        </div>
      </div>
    </HorizontalFieldLayout>
  )
}
