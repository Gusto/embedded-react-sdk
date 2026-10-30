import type { IndustryErrorCodes } from './industrySchema'
import type { ComboBoxHookFieldProps } from '@/partner-hook-utils/form/fields/ComboBoxHookField'
import { ComboBoxHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'
import type { NaicsCode } from '@/models/NAICSCodes'

/**
 * The required-field error code produced by {@link useIndustryForm} fields that only emit `REQUIRED`.
 *
 * @remarks
 * Used as the `validationMessages` key for the industry field.
 * See `IndustryErrorCodes`.
 *
 * @public
 */
export type RequiredValidation = typeof IndustryErrorCodes.REQUIRED

/**
 * Props accepted by {@link useIndustryForm}'s `Fields.Industry` component.
 *
 * @public
 */
export type IndustryFieldProps = HookFieldProps<
  ComboBoxHookFieldProps<RequiredValidation, NaicsCode>
>

/** @internal */
export function IndustryField(props: IndustryFieldProps) {
  return <ComboBoxHookField {...props} name="naicsCode" />
}
