import React, { useMemo } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { decimalToPercent, percentToDecimal } from '@/helpers/percentageConversion'
import { createMarkup } from '@/helpers/formattedStrings'

export interface PercentageFieldProps extends Pick<
  NumberInputProps,
  'isDisabled' | 'className' | 'label' | 'isRequired' | 'description' | 'errorMessage'
> {
  name: string
  decimalValue?: string | number | boolean | null
  decimalMin?: string
  decimalMax?: string
}

const processDescription = (description: React.ReactNode): React.ReactNode => {
  if (!description || typeof description !== 'string') {
    return description
  }
  return React.createElement('div', {
    dangerouslySetInnerHTML: createMarkup(description),
  })
}

export function PercentageField({
  name,
  decimalValue,
  decimalMin,
  decimalMax,
  isRequired,
  errorMessage,
  description,
  ...props
}: PercentageFieldProps) {
  const { control } = useFormContext()
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

  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: decimalValue,
    rules: {
      required: isRequired,
      validate: validationRules,
    },
  })

  const displayValue = decimalToPercent(field.value)

  const handleChange = (percentValue: number) => {
    field.onChange(percentToDecimal(percentValue))
  }

  const isInvalid = !!fieldState.error
  const processedDescription = useMemo(() => processDescription(description), [description])

  return (
    <Components.NumberInput
      {...props}
      name={field.name}
      value={displayValue}
      onChange={handleChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      min={decimalMin ? decimalToPercent(decimalMin) : undefined}
      max={decimalMax ? decimalToPercent(decimalMax) : undefined}
      format="percent"
      maximumFractionDigits={4}
      isRequired={isRequired}
      isInvalid={isInvalid}
      errorMessage={isInvalid ? (errorMessage ?? fieldState.error?.message) : undefined}
      description={processedDescription}
    />
  )
}
