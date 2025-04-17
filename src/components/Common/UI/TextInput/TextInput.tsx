import type { ChangeEvent } from 'react'
import { Input } from 'react-aria-components'
import classNames from 'classnames'
import { FieldLayout } from '../FieldLayout'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './TextInput.module.scss'
import type { TextInputProps } from './TextInputTypes'

export function TextInput({
  name,
  label,
  description,
  errorMessage,
  isRequired,
  type = 'text',
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
  ...props
}: TextInputProps) {
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value)
  }

  return (
    <FieldLayout
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={isRequired}
      htmlFor={inputId}
      errorMessageId={errorMessageId}
      descriptionId={descriptionId}
      className={classNames(styles.root, className)}
      shouldVisuallyHideLabel={shouldVisuallyHideLabel}
      {...props}
    >
      <Input
        id={inputId}
        ref={inputRef}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        aria-describedby={ariaDescribedBy}
        aria-invalid={isInvalid}
        disabled={isDisabled}
      />
    </FieldLayout>
  )
}
