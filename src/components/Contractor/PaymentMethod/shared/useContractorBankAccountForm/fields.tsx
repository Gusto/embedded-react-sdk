import type {
  ContractorAccountType,
  ContractorBankAccountErrorCodes,
} from './useContractorBankAccountFormSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import { TextInputHookField, RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Validation error code emitted by {@link useContractorBankAccountForm} fields
 * that only emit `REQUIRED`.
 *
 * @public
 */
export type RequiredValidation = typeof ContractorBankAccountErrorCodes.REQUIRED

/**
 * Validation error codes emitted by the `routingNumber` field of
 * {@link useContractorBankAccountForm}.
 *
 * @public
 */
export type RoutingNumberValidation = (typeof ContractorBankAccountErrorCodes)[keyof Pick<
  typeof ContractorBankAccountErrorCodes,
  'REQUIRED' | 'INVALID_ROUTING_NUMBER'
>]

/**
 * Validation error codes emitted by the `accountNumber` field of
 * {@link useContractorBankAccountForm}.
 *
 * @public
 */
export type AccountNumberValidation = (typeof ContractorBankAccountErrorCodes)[keyof Pick<
  typeof ContractorBankAccountErrorCodes,
  'REQUIRED' | 'INVALID_ACCOUNT_NUMBER'
>]

/**
 * Props accepted by {@link useContractorBankAccountForm}'s `Fields.Name` component.
 *
 * @public
 */
export type NameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `name` field of {@link useContractorBankAccountForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Name`. Captures the bank account
 * nickname.
 *
 * @param props - See {@link NameFieldProps}.
 * @returns The rendered text input bound to `name`.
 * @public
 */
export function NameField(props: NameFieldProps) {
  return <TextInputHookField {...props} name="name" />
}

/**
 * Props accepted by {@link useContractorBankAccountForm}'s `Fields.RoutingNumber` component.
 *
 * @public
 */
export type RoutingNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<RoutingNumberValidation>
>

/**
 * Text input bound to the `routingNumber` field of {@link useContractorBankAccountForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.RoutingNumber`. Validated against
 * a 9-digit numeric pattern.
 *
 * @param props - See {@link RoutingNumberFieldProps}.
 * @returns The rendered text input bound to `routingNumber`.
 * @public
 */
export function RoutingNumberField(props: RoutingNumberFieldProps) {
  return <TextInputHookField {...props} name="routingNumber" />
}

/**
 * Props accepted by {@link useContractorBankAccountForm}'s `Fields.AccountNumber` component.
 *
 * @public
 */
export type AccountNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<AccountNumberValidation>
>

/**
 * Text input bound to the `accountNumber` field of {@link useContractorBankAccountForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AccountNumber`. Pre-filled with
 * the masked account number (e.g. "XXXX1207"), which is accepted unchanged to
 * keep the existing account; a newly entered value is validated against the
 * 1–17 digit numeric pattern.
 *
 * @param props - See {@link AccountNumberFieldProps}.
 * @returns The rendered text input bound to `accountNumber`.
 * @public
 */
export function AccountNumberField(props: AccountNumberFieldProps) {
  return <TextInputHookField {...props} name="accountNumber" />
}

/**
 * Props accepted by {@link useContractorBankAccountForm}'s `Fields.AccountType` component.
 *
 * @public
 */
export type AccountTypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, ContractorAccountType>
>

/**
 * Radio group bound to the `accountType` field of {@link useContractorBankAccountForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AccountType`. Options are
 * `Checking` and `Savings`; defaults to `Checking`. Supply `getOptionLabel` to
 * translate the option labels.
 *
 * @param props - See {@link AccountTypeFieldProps}.
 * @returns The rendered radio group bound to `accountType`.
 * @public
 */
export function AccountTypeField(props: AccountTypeFieldProps) {
  return <RadioGroupHookField {...props} name="accountType" />
}
