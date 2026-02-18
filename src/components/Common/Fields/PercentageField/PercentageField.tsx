import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import { useField } from '@/components/Common/Fields/hooks/useField'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { decimalToPercent, percentToDecimal } from '@/helpers/percentageConversion'

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

export function PercentageField({
  decimalValue,
  decimalMin,
  decimalMax,
  ...props
}: PercentageFieldProps) {
  const Components = useComponentContext()
  const { t } = useTranslation('common')

  const validationRules = useMemo(() => {
    const rules: Record<string, (value: string) => string | true> = {}

    if (decimalMin !== undefined) {
      const minNum = parseFloat(decimalMin)
      rules.min = (value: string) => {
        const num = Number(value)
        if (isNaN(num)) return true
        return (
          num >= minNum || t('validations.percentageMin', { min: decimalToPercent(decimalMin) })
        )
      }
    }

    if (decimalMax !== undefined) {
      const maxNum = parseFloat(decimalMax)
      rules.max = (value: string) => {
        const num = Number(value)
        if (isNaN(num)) return true
        return (
          num <= maxNum || t('validations.percentageMax', { max: decimalToPercent(decimalMax) })
        )
      }
    }

    return rules
  }, [decimalMin, decimalMax, t])

  const { value, onChange, ...fieldProps } = useField({
    ...props,
    defaultValue: toDefaultString(decimalValue),
    rules: { validate: validationRules },
  })

  const handleChange = (percentValue: number) => {
    onChange(percentToDecimal(percentValue))
  }

  return (
    <Components.NumberInput
      {...props}
      {...fieldProps}
      value={decimalToPercent(value)}
      onChange={handleChange}
      min={decimalMin ? decimalToPercent(decimalMin) : undefined}
      max={decimalMax ? decimalToPercent(decimalMax) : undefined}
      format="percent"
      maximumFractionDigits={4}
    />
  )
}
