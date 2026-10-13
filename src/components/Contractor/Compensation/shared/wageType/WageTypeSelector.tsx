import { useMemo, type ComponentType } from 'react'
import { ContractorWageType } from '@gusto/embedded-api/models/components/contractor'
import type { SharedWageTypeFieldProps } from './wageTypeFields'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'

/**
 * Copy rendered by {@link WageTypeSelector}. Supplied by the consuming surface so one surface's
 * copy overrides never leak into another.
 *
 * @internal
 */
export interface WageTypeSelectorCopy {
  label: string
  fixedLabel: string
  hourlyLabel: string
  fixedDescription: string
  hourlyDescription: string
}

/**
 * Props for {@link WageTypeSelector}.
 *
 * @internal
 */
export interface WageTypeSelectorProps {
  /** The `Fields.WageType` component exposed by a contractor form hook. */
  Field: ComponentType<SharedWageTypeFieldProps>
  /** Labels and per-option descriptions for the radio group. */
  copy: WageTypeSelectorCopy
}

/**
 * Presentational Fixed/Hourly wage type radio group with a description under each option.
 *
 * @param props - See {@link WageTypeSelectorProps}.
 * @returns The wage type radio group.
 * @internal
 */
export function WageTypeSelector({ Field, copy }: WageTypeSelectorProps) {
  const Components = useComponentContext()
  const { label, fixedLabel, hourlyLabel, fixedDescription, hourlyDescription } = copy

  const DescribedRadioGroup = useMemo(
    () =>
      function DescribedRadioGroup(radioProps: RadioGroupProps) {
        return (
          <Components.RadioGroup
            {...radioProps}
            options={radioProps.options.map(option => ({
              ...option,
              description:
                option.value === ContractorWageType.Hourly ? hourlyDescription : fixedDescription,
            }))}
          />
        )
      },
    [Components, fixedDescription, hourlyDescription],
  )

  return (
    <Field
      label={label}
      getOptionLabel={value => (value === ContractorWageType.Hourly ? hourlyLabel : fixedLabel)}
      FieldComponent={DescribedRadioGroup}
    />
  )
}
