import type { NumberInputFieldProps } from '@/components/Common/Fields/NumberInputField/NumberInputField'
import { NumberInputField } from '@/components/Common/Fields/NumberInputField/NumberInputField'
import { decimalToPercent } from '@/helpers/percentageConversion'

export interface PercentageFieldProps extends Omit<
  NumberInputFieldProps,
  'defaultValue' | 'format' | 'adornmentEnd' | 'min' | 'max' | 'maximumFractionDigits'
> {
  decimalValue?: string | number | boolean | null
  decimalMin?: string
  decimalMax?: string
}

export function PercentageField({
  decimalValue,
  decimalMin,
  decimalMax,
  ...props
}: PercentageFieldProps) {
  return (
    <NumberInputField
      {...props}
      defaultValue={decimalToPercent(decimalValue)}
      min={decimalMin ? decimalToPercent(decimalMin) : undefined}
      max={decimalMax ? decimalToPercent(decimalMax) : undefined}
      format="percent"
      maximumFractionDigits={4}
    />
  )
}
