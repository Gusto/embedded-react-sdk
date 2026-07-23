import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import { useField } from '@/components/Common/Fields/hooks/useField'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { decimalToPercent, percentToDecimal } from '@/helpers/percentageConversion'

/** @internal */
export interface PercentageFieldProps extends Pick<
  NumberInputProps,
  'isDisabled' | 'className' | 'label' | 'isRequired' | 'description' | 'errorMessage'
> {
  name: string
  decimalValue?: string | number | boolean | null
  decimalMin?: string
  decimalMax?: string
}

function toDefaultString(value?: string | number | boolean | null): string | undefined {
  if (value === null || value === undefined || typeof value === 'boolean') return undefined
  return String(value)
}

/** @internal */
export function PercentageField({
  decimalValue,
  decimalMin,
  decimalMax,
  ...props
}: PercentageFieldProps) {
  const Components = useComponentContext()
  const { t } = useTranslation('common')
  const { setError, clearErrors } = useFormContext()

  const { value, onChange, ...fieldProps } = useField({
    ...props,
    defaultValue: toDefaultString(decimalValue),
  })

  // Deliberately not passed to NumberInput's `min`/`max` props: react-aria's NumberField
  // treats those as hard bounds and silently clamps out-of-range values to them on blur,
  // with no error shown. Validating here instead keeps the value the user actually typed
  // on screen, paired with a real error message.
  const validateRange = (rawDecimalValue: string) => {
    const num = Number(rawDecimalValue)
    if (rawDecimalValue === '' || Number.isNaN(num)) {
      clearErrors(props.name)
      return
    }
    if (decimalMin !== undefined && num < parseFloat(decimalMin)) {
      setError(props.name, {
        type: 'min',
        message: t('validations.percentageMin', { min: decimalToPercent(decimalMin) }),
      })
      return
    }
    if (decimalMax !== undefined && num > parseFloat(decimalMax)) {
      setError(props.name, {
        type: 'max',
        message: t('validations.percentageMax', { max: decimalToPercent(decimalMax) }),
      })
      return
    }
    clearErrors(props.name)
  }

  const handleChange = (percentValue: number) => {
    const decimalStr = percentToDecimal(percentValue)
    validateRange(decimalStr)
    onChange(decimalStr)
  }

  return (
    <Components.NumberInput
      {...props}
      {...fieldProps}
      value={decimalToPercent(value)}
      onChange={handleChange}
      format="percent"
      maximumFractionDigits={4}
    />
  )
}
