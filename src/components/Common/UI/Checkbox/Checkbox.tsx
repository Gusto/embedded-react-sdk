import type { ChangeEvent } from 'react'
import classNames from 'classnames'
import { useFieldIds } from '../hooks/useFieldIds'
import { HorizontalFieldLayout } from '../HorizontalFieldLayout'
import styles from './Checkbox.module.scss'
import IconChecked from '@/assets/icons/checkbox.svg?react'
import type { CheckboxProps } from '@/types/UI/Checkbox'

export const Checkbox = ({
  name,
  label,
  description,
  errorMessage,
  isRequired,
  inputRef,
  checked,
  value,
  isInvalid = false,
  isDisabled = false,
  id,
  onChange: onChangeFromCheckboxProps,
  onBlur,
  inputProps,
  className,
  ...props
}: CheckboxProps) => {
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  const { onChange: onChangeFromInputProps, ...restInputProps } = inputProps ?? {}

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeFromCheckboxProps?.(event)
    onChangeFromInputProps?.(event)
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
          checked={checked}
          id={inputId}
          ref={inputRef}
          onBlur={onBlur}
          onChange={handleChange}
          value={value}
          className={styles.checkboxInput}
          {...restInputProps}
        />
        <div className={classNames(styles.checkbox, { [styles.checked as string]: checked })}>
          <IconChecked className={styles.check} />
        </div>
      </div>
    </HorizontalFieldLayout>
  )
}
