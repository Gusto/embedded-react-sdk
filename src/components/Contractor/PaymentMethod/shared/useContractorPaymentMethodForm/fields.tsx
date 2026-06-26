import type {
  ContractorAccountType,
  ContractorPaymentMethodErrorCodes,
  ContractorPaymentMethodFormType,
} from './contractorPaymentMethodSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import { TextInputHookField, RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Validation error code emitted by {@link useContractorPaymentMethodForm} fields
 * that only emit `REQUIRED`.
 *
 * @public
 */
export type RequiredValidation = typeof ContractorPaymentMethodErrorCodes.REQUIRED

/**
 * Validation error codes emitted by the `routingNumber` field of
 * {@link useContractorPaymentMethodForm}.
 *
 * @public
 */
export type RoutingNumberValidation = (typeof ContractorPaymentMethodErrorCodes)[keyof Pick<
  typeof ContractorPaymentMethodErrorCodes,
  'REQUIRED' | 'INVALID_ROUTING_NUMBER'
>]

/**
 * Validation error codes emitted by the `accountNumber` field of
 * {@link useContractorPaymentMethodForm}.
 *
 * @public
 */
export type AccountNumberValidation = (typeof ContractorPaymentMethodErrorCodes)[keyof Pick<
  typeof ContractorPaymentMethodErrorCodes,
  'REQUIRED' | 'INVALID_ACCOUNT_NUMBER'
>]

/**
 * Props accepted by {@link useContractorPaymentMethodForm}'s `Fields.Type` component.
 *
 * @public
 */
export type TypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, ContractorPaymentMethodFormType>
>

/**
 * Radio group bound to the `type` field of {@link useContractorPaymentMethodForm}.
 *
 * @remarks
 * Selects whether the contractor is paid by Direct Deposit or Check. Provide
 * `getOptionLabel` to localize the option labels.
 *
 * @param props - See {@link TypeFieldProps}.
 * @returns The rendered radio group bound to `type`.
 * @public
 */
export function TypeField(props: TypeFieldProps) {
  return <RadioGroupHookField {...props} name="type" />
}

/**
 * Props accepted by {@link useContractorPaymentMethodForm}'s `Fields.Name` component.
 *
 * @public
 */
export type NameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `name` field of {@link useContractorPaymentMethodForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Name`; `undefined` when the
 * payment method is Check. Captures the bank account nickname.
 *
 * @param props - See {@link NameFieldProps}.
 * @returns The rendered text input bound to `name`.
 * @public
 */
export function NameField(props: NameFieldProps) {
  return <TextInputHookField {...props} name="name" />
}

/**
 * Props accepted by {@link useContractorPaymentMethodForm}'s `Fields.RoutingNumber` component.
 *
 * @public
 */
export type RoutingNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<RoutingNumberValidation>
>

/**
 * Text input bound to the `routingNumber` field of {@link useContractorPaymentMethodForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.RoutingNumber`; `undefined` when
 * the payment method is Check. Validated against a 9-digit numeric pattern.
 *
 * @param props - See {@link RoutingNumberFieldProps}.
 * @returns The rendered text input bound to `routingNumber`.
 * @public
 */
export function RoutingNumberField(props: RoutingNumberFieldProps) {
  return <TextInputHookField {...props} name="routingNumber" />
}

/**
 * Props accepted by {@link useContractorPaymentMethodForm}'s `Fields.AccountNumber` component.
 *
 * @public
 */
export type AccountNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<AccountNumberValidation>
>

/**
 * Text input bound to the `accountNumber` field of {@link useContractorPaymentMethodForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AccountNumber`; `undefined` when
 * the payment method is Check. Pre-filled with the masked account number; only
 * re-validated against the 1–17 digit numeric pattern once a bank field changes.
 *
 * @param props - See {@link AccountNumberFieldProps}.
 * @returns The rendered text input bound to `accountNumber`.
 * @public
 */
export function AccountNumberField(props: AccountNumberFieldProps) {
  return <TextInputHookField {...props} name="accountNumber" />
}

/**
 * Props accepted by {@link useContractorPaymentMethodForm}'s `Fields.AccountType` component.
 *
 * @public
 */
export type AccountTypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, ContractorAccountType>
>

/**
 * Radio group bound to the `accountType` field of {@link useContractorPaymentMethodForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AccountType`; `undefined` when
 * the payment method is Check. Options are `Checking` and `Savings`; defaults to
 * `Checking`. Supply `getOptionLabel` to translate the option labels.
 *
 * @param props - See {@link AccountTypeFieldProps}.
 * @returns The rendered radio group bound to `accountType`.
 * @public
 */
export function AccountTypeField(props: AccountTypeFieldProps) {
  return <RadioGroupHookField {...props} name="accountType" />
}
