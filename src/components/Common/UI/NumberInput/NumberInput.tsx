import type { FocusEventHandler, InputHTMLAttributes, Ref } from 'react'
import { Input, Group, NumberField as AriaNumberField } from 'react-aria-components'
import { FieldLayout, type SharedFieldLayoutProps } from '../FieldLayout'
import { useFieldIds } from '../hooks/useFieldIds'
import { useLocale } from '@/contexts/LocaleProvider'

export interface NumberInputProps
  extends SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'min' | 'max' | 'name' | 'id' | 'placeholder' | 'className'
    > {
  format?: 'currency' | 'decimal' | 'percent'
  currencyDisplay?: keyof Intl.NumberFormatOptionsCurrencyDisplayRegistry | undefined
  inputRef?: Ref<HTMLInputElement>
  value?: number
  isInvalid?: boolean
  isDisabled?: boolean
  onChange?: (value: number) => void
  onBlur?: FocusEventHandler<HTMLElement>
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}

export function NumberInput({
  name,
  format,
  currencyDisplay,
  inputRef,
  id,
  value,
  description,
  errorMessage,
  isRequired,
  placeholder,
  isInvalid,
  isDisabled,
  onChange,
  onBlur,
  inputProps,
  label,
  min,
  max,
  shouldVisuallyHideLabel,
  className,
  ...props
}: NumberInputProps) {
  const { currency } = useLocale()
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  const minValue = typeof min === 'string' ? Number(min) : min
  const maxValue = typeof max === 'string' ? Number(max) : max

  return (
    <FieldLayout
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
      <AriaNumberField
        value={value}
        name={name}
        formatOptions={{
          style: format === 'currency' ? 'currency' : 'decimal',
          currency,
          currencyDisplay,
        }}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        isRequired={isRequired}
        validationBehavior="aria"
        onChange={onChange}
        // This is a hack to silence an unnecessary react-aria warning. The FieldLayout component
        // already associates the label and input with htmlFor + ID. If we include a label id here,
        // the label will get read twice by assistive tech. This evaluates to an empty string which
        // does not get associated with any elements and does not get read.
        aria-labelledby=" "
        minValue={minValue}
        maxValue={maxValue}
        {...props}
      >
        <Group>
          <Input
            id={inputId}
            ref={inputRef}
            onBlur={onBlur}
            placeholder={placeholder}
            aria-describedby={ariaDescribedBy}
            {...inputProps}
          />
          {format === 'percent' ? <span>%</span> : null}
        </Group>
      </AriaNumberField>
    </FieldLayout>
  )
}
