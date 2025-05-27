import type { ChangeEvent } from 'react'
import { Input } from '../Input'
import { useFieldIds } from '../hooks/useFieldIds'
import type { TextInputProps } from './TextInputTypes'
import { FieldLayout } from '@/components/Common/FieldLayout'

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
  adornmentEnd,
  adornmentStart,
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
      className={className}
      shouldVisuallyHideLabel={shouldVisuallyHideLabel}
      withErrorIcon={false}
      {...props}
    >
      <Input
        id={inputId}
        inputRef={inputRef}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        aria-describedby={ariaDescribedBy}
        aria-invalid={isInvalid}
        isDisabled={isDisabled}
        adornmentStart={adornmentStart}
        adornmentEnd={adornmentEnd}
      />
    </FieldLayout>
  )
}
