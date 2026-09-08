import type { ContractorPayErrorCodes, ContractorPayFormData } from './contractorPaySchema'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import { RadioGroupHookField, NumberInputHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Validation code for a required contractor pay field.
 *
 * @public
 */
export type RequiredValidation = typeof ContractorPayErrorCodes.REQUIRED

/**
 * Validation code for an hourly rate above the server's maximum cap.
 *
 * @public
 */
export type MaxHourlyRateValidation = typeof ContractorPayErrorCodes.MAX_HOURLY_RATE

/**
 * Props accepted by {@link useContractorPayForm}'s `Fields.WageType` component.
 *
 * @public
 */
export type WageTypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, ContractorPayFormData['wageType']>
>

/** @internal */
export function WageTypeField(props: WageTypeFieldProps) {
  return <RadioGroupHookField {...props} name="wageType" />
}

/**
 * Props accepted by {@link useContractorPayForm}'s `Fields.HourlyRate` component.
 *
 * @public
 */
export type HourlyRateFieldProps = HookFieldProps<
  NumberInputHookFieldProps<RequiredValidation | MaxHourlyRateValidation>
>

/** @internal */
export function HourlyRateField(props: HourlyRateFieldProps) {
  return <NumberInputHookField {...props} name="hourlyRate" />
}
