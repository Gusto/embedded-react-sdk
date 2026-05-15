import type { PaymentPeriod } from '@gusto/embedded-api/models/components/garnishmentchildsupport'
import type { ChildSupportGarnishmentFormErrorCodes } from './childSupportGarnishmentFormSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import {
  TextInputHookField,
  NumberInputHookField,
  SelectHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type RequiredValidation = typeof ChildSupportGarnishmentFormErrorCodes.REQUIRED
export type NegativeAmountValidation = typeof ChildSupportGarnishmentFormErrorCodes.NEGATIVE_AMOUNT
export type PercentValidation = typeof ChildSupportGarnishmentFormErrorCodes.PERCENT_OUT_OF_RANGE

export type PayPeriodMaximumValidation = RequiredValidation | NegativeAmountValidation
export type AmountValidation = RequiredValidation | PercentValidation

// ── State (agency) ─────────────────────────────────────────────────────
//
// The select carries the raw agency record as `entries`; the consumer can
// supply `getOptionLabel` to translate the agency name into a localized
// label (the SDK's option-label fallback is the agency state code).

export type StateFieldEntry = {
  state: string
  name: string
  manualPaymentRequired?: boolean
}

export type StateFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, StateFieldEntry>
>

export function StateField(props: StateFieldProps) {
  return <SelectHookField {...props} name="state" />
}

// ── FipsCode (county) ──────────────────────────────────────────────────

export type CountyEntry = {
  fipsCode: string
  county: string | null
}

export type FipsCodeFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, CountyEntry>
>

export function FipsCodeField(props: FipsCodeFieldProps) {
  return <SelectHookField {...props} name="fipsCode" />
}

// ── Required agency-attribute text inputs ──────────────────────────────

export type CaseNumberFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function CaseNumberField(props: CaseNumberFieldProps) {
  return <TextInputHookField {...props} name="caseNumber" />
}

export type OrderNumberFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function OrderNumberField(props: OrderNumberFieldProps) {
  return <TextInputHookField {...props} name="orderNumber" />
}

export type RemittanceNumberFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function RemittanceNumberField(props: RemittanceNumberFieldProps) {
  return <TextInputHookField {...props} name="remittanceNumber" />
}

// ── Pay-period maximum (currency) ──────────────────────────────────────

export type PayPeriodMaximumFieldProps = HookFieldProps<
  NumberInputHookFieldProps<PayPeriodMaximumValidation>
>

export function PayPeriodMaximumField(props: PayPeriodMaximumFieldProps) {
  return <NumberInputHookField {...props} name="payPeriodMaximum" />
}

// ── Amount (percent of paycheck, 0-100) ────────────────────────────────

export type AmountFieldProps = HookFieldProps<NumberInputHookFieldProps<AmountValidation>>

export function AmountField(props: AmountFieldProps) {
  return <NumberInputHookField {...props} name="amount" />
}

// ── Payment period (select) ────────────────────────────────────────────

export type PaymentPeriodFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, PaymentPeriod>
>

export function PaymentPeriodField(props: PaymentPeriodFieldProps) {
  return <SelectHookField {...props} name="paymentPeriod" />
}
