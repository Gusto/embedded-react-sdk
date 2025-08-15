import { useMemo } from 'react'
import { Group, NumberField as AriaNumberField } from 'react-aria-components'
import { Input } from '../Input'
import { useFieldIds } from '../hooks/useFieldIds'
import type { NumberInputProps } from './NumberInputTypes'
import { FieldLayout } from '@/components/Common/FieldLayout'
import { useLocale } from '@/contexts/LocaleProvider'

export function NumberInput({
  name,
  format,
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
  label,
  min,
  max,
  shouldVisuallyHideLabel,
  adornmentStart,
  adornmentEnd,
  className,
  maximumFractionDigits,
  minimumFractionDigits,
  ...props
}: NumberInputProps) {
  const { locale, currency } = useLocale()
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  const minValue = typeof min === 'string' ? Number(min) : min
  const maxValue = typeof max === 'string' ? Number(max) : max

  const currencySymbol = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    })
      .formatToParts(0)
      .find(part => part.type === 'currency')?.value
  }, [currency, locale])

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
      withErrorIcon={false}
      {...props}
    >
      <AriaNumberField
        value={value}
        name={name}
        formatOptions={{
          style: 'decimal',
          minimumFractionDigits: format === 'currency' ? 2 : minimumFractionDigits,
          maximumFractionDigits: format === 'currency' ? 2 : maximumFractionDigits,
          currency,
          currencyDisplay: 'symbol',
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
            adornmentStart={adornmentStart || (format === 'currency' ? currencySymbol : null)}
            adornmentEnd={adornmentEnd || (format === 'percent' ? '%' : null)}
            id={inputId}
            inputRef={inputRef}
            onBlur={onBlur}
            placeholder={placeholder}
            aria-describedby={ariaDescribedBy}
            isDisabled={isDisabled}
          />
        </Group>
      </AriaNumberField>
    </FieldLayout>
  )
}
