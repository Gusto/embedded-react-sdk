import type { ChangeEvent } from 'react'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './Checkbox.module.scss'
import type { CheckboxProps } from './CheckboxTypes'
import { HorizontalFieldLayout } from '@/components/Common/HorizontalFieldLayout'
import IconChecked from '@/assets/icons/checkbox.svg?react'

export const Checkbox = ({
  name,
  label,
  description,
  errorMessage,
  isRequired,
  inputRef,
  value,
  isInvalid = false,
  isDisabled = false,
  id,
  onChange,
  onBlur,
  className,
  shouldVisuallyHideLabel,
  ...props
}: CheckboxProps) => {
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
      {...props}
    >
      <div className={styles.checkboxWrapper}>
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
          onChange={handleChange}
          className={styles.checkboxInput}
        />
        <div className={styles.checkbox}>
          <IconChecked className={styles.check} />
        </div>
      </div>
    </HorizontalFieldLayout>
  )
}
