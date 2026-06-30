import type { PaymentPeriod } from '@gusto/embedded-api-v-2026-06-15/models/components/garnishmentchildsupport'
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

/**
 * The required-field error code produced by {@link useChildSupportGarnishmentForm} fields that only emit `REQUIRED`.
 *
 * @remarks
 * Used as the `validationMessages` key for the state, county (fips code), case
 * number, order number, remittance number, and payment-period fields. See
 * {@link ChildSupportGarnishmentFormErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof ChildSupportGarnishmentFormErrorCodes.REQUIRED

/**
 * The negative-amount error code produced by {@link useChildSupportGarnishmentForm}'s currency fields.
 *
 * @remarks
 * Used as a `validationMessages` key on `Fields.PayPeriodMaximum`. See
 * {@link ChildSupportGarnishmentFormErrorCodes}.
 *
 * @public
 */
export type NegativeAmountValidation = typeof ChildSupportGarnishmentFormErrorCodes.NEGATIVE_AMOUNT

/**
 * The percent-out-of-range error code produced by {@link useChildSupportGarnishmentForm}'s percentage field.
 *
 * @remarks
 * Used as a `validationMessages` key on `Fields.Amount` (the percent-of-paycheck input).
 * See {@link ChildSupportGarnishmentFormErrorCodes}.
 *
 * @public
 */
export type PercentValidation = typeof ChildSupportGarnishmentFormErrorCodes.PERCENT_OUT_OF_RANGE

/**
 * Validation error codes emitted by the `payPeriodMaximum` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.PayPeriodMaximum`. See
 * {@link ChildSupportGarnishmentFormErrorCodes} for the full description of each code.
 *
 * @public
 */
export type PayPeriodMaximumValidation = RequiredValidation | NegativeAmountValidation

/**
 * Validation error codes emitted by the `amount` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.Amount`. The field
 * accepts a percentage of paycheck (0–100). See
 * {@link ChildSupportGarnishmentFormErrorCodes} for the full description of each code.
 *
 * @public
 */
export type AmountValidation = RequiredValidation | PercentValidation

// ── State (agency) ─────────────────────────────────────────────────────
//
// The select carries the raw agency record as `entries`; the consumer can
// supply `getOptionLabel` to translate the agency name into a localized
// label (the SDK's option-label fallback is the agency state code).

/**
 * Raw agency entry exposed on {@link useChildSupportGarnishmentForm}'s `data.agencies` and as the `entries` shape for the `State` select.
 *
 * @remarks
 * Supply `getOptionLabel` on `Fields.State` to translate the agency name into a
 * localized label — the SDK's option-label fallback is the agency state code.
 *
 * @public
 */
export type StateFieldEntry = {
  /** The agency's state code (e.g. `AK`). */
  state: string
  /** The agency name as returned by the Gusto API. */
  name: string
  /** True when the agency requires payments to be remitted manually rather than through Gusto. */
  manualPaymentRequired?: boolean
}

/**
 * Props accepted by {@link useChildSupportGarnishmentForm}'s `Fields.State` component.
 *
 * @public
 */
export type StateFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, StateFieldEntry>
>

/**
 * Select bound to the `state` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.State`. Always rendered. The
 * selected agency drives which subsequent fields are required and visible
 * (`FipsCode`, `CaseNumber`, `OrderNumber`, `RemittanceNumber`).
 *
 * @param props - {@link StateFieldProps} — accepts the standard hook field props plus `getOptionLabel` for agency display.
 * @returns The rendered select bound to `state`.
 * @public
 */
export function StateField(props: StateFieldProps) {
  return <SelectHookField {...props} name="state" />
}

// ── FipsCode (county) ──────────────────────────────────────────────────

/**
 * Raw county entry exposed on {@link useChildSupportGarnishmentForm}'s `data.counties` and as the `entries` shape for the `FipsCode` select.
 *
 * @remarks
 * `county` is `null` for "all counties" entries — the agency's single county
 * record represents the whole state. Supply `getOptionLabel` on
 * `Fields.FipsCode` to translate the county name into a localized label.
 *
 * @public
 */
export type CountyEntry = {
  /** The FIPS code for the county. */
  fipsCode: string
  /** The county name, or `null` for an "all counties" entry covering the whole state. */
  county: string | null
}

/**
 * Props accepted by {@link useChildSupportGarnishmentForm}'s `Fields.FipsCode` component.
 *
 * @public
 */
export type FipsCodeFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, CountyEntry>
>

/**
 * Select bound to the `fipsCode` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.FipsCode` only when the selected
 * agency offers multiple counties. When the agency has a single "all counties"
 * code, the hook auto-fills the value and exposes the field as `undefined` —
 * always null-check before rendering. Options are dynamically populated from
 * the FIPS codes the selected agency declares.
 *
 * @param props - {@link FipsCodeFieldProps} — accepts the standard hook field props plus `getOptionLabel` for county display.
 * @returns The rendered select bound to `fipsCode`.
 * @public
 */
export function FipsCodeField(props: FipsCodeFieldProps) {
  return <SelectHookField {...props} name="fipsCode" />
}

// ── Required agency-attribute text inputs ──────────────────────────────

/**
 * Props accepted by {@link useChildSupportGarnishmentForm}'s `Fields.CaseNumber` component.
 *
 * @public
 */
export type CaseNumberFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `caseNumber` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.CaseNumber` only when the
 * selected agency requires a case number (`status.requiredAttrKeys.has('case_number')`).
 * Always null-check before rendering.
 *
 * @param props - {@link CaseNumberFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `caseNumber`.
 * @public
 */
export function CaseNumberField(props: CaseNumberFieldProps) {
  return <TextInputHookField {...props} name="caseNumber" />
}

/**
 * Props accepted by {@link useChildSupportGarnishmentForm}'s `Fields.OrderNumber` component.
 *
 * @public
 */
export type OrderNumberFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `orderNumber` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.OrderNumber` only when the
 * selected agency requires an order number (`status.requiredAttrKeys.has('order_number')`).
 * Always null-check before rendering.
 *
 * @param props - {@link OrderNumberFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `orderNumber`.
 * @public
 */
export function OrderNumberField(props: OrderNumberFieldProps) {
  return <TextInputHookField {...props} name="orderNumber" />
}

/**
 * Props accepted by {@link useChildSupportGarnishmentForm}'s `Fields.RemittanceNumber` component.
 *
 * @public
 */
export type RemittanceNumberFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `remittanceNumber` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.RemittanceNumber` only when the
 * selected agency requires a remittance number (`status.requiredAttrKeys.has('remittance_number')`).
 * Always null-check before rendering.
 *
 * @param props - {@link RemittanceNumberFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `remittanceNumber`.
 * @public
 */
export function RemittanceNumberField(props: RemittanceNumberFieldProps) {
  return <TextInputHookField {...props} name="remittanceNumber" />
}

// ── Pay-period maximum (currency) ──────────────────────────────────────

/**
 * Props accepted by {@link useChildSupportGarnishmentForm}'s `Fields.PayPeriodMaximum` component.
 *
 * @public
 */
export type PayPeriodMaximumFieldProps = HookFieldProps<
  NumberInputHookFieldProps<PayPeriodMaximumValidation>
>

/**
 * Number input bound to the `payPeriodMaximum` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.PayPeriodMaximum`. Always
 * rendered. Carries the per-pay-period currency cap for the garnishment.
 *
 * @param props - {@link PayPeriodMaximumFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered number input bound to `payPeriodMaximum`.
 * @public
 */
export function PayPeriodMaximumField(props: PayPeriodMaximumFieldProps) {
  return <NumberInputHookField {...props} name="payPeriodMaximum" />
}

// ── Amount (percent of paycheck, 0-100) ────────────────────────────────

/**
 * Props accepted by {@link useChildSupportGarnishmentForm}'s `Fields.Amount` component.
 *
 * @public
 */
export type AmountFieldProps = HookFieldProps<NumberInputHookFieldProps<AmountValidation>>

/**
 * Number input bound to the `amount` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Amount`. Always rendered.
 * Accepts a percentage of paycheck in the range 0–100 — the API stores
 * child-support amounts as percentages rather than fixed currency values.
 *
 * @param props - {@link AmountFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered number input bound to `amount`.
 * @public
 */
export function AmountField(props: AmountFieldProps) {
  return <NumberInputHookField {...props} name="amount" />
}

// ── Payment period (select) ────────────────────────────────────────────

/**
 * Props accepted by {@link useChildSupportGarnishmentForm}'s `Fields.PaymentPeriod` component.
 *
 * @public
 */
export type PaymentPeriodFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, PaymentPeriod>
>

/**
 * Select bound to the `paymentPeriod` field of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.PaymentPeriod`. Always rendered.
 * Options: `Every week`, `Every other week`, `Twice per month`, `Monthly`.
 *
 * @param props - {@link PaymentPeriodFieldProps} — accepts the standard hook field props plus `getOptionLabel` for payment-period display.
 * @returns The rendered select bound to `paymentPeriod`.
 * @public
 */
export function PaymentPeriodField(props: PaymentPeriodFieldProps) {
  return <SelectHookField {...props} name="paymentPeriod" />
}
