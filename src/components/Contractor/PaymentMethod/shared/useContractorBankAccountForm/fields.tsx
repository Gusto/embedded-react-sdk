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

/** @internal */
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

/** @internal */
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

/** @internal */
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

/** @internal */
export function AccountTypeField(props: AccountTypeFieldProps) {
  return <RadioGroupHookField {...props} name="accountType" />
}
