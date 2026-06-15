import type { AccountType, BankFormErrorCodes } from './useBankFormSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import { TextInputHookField, RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Validation error codes emitted by {@link useBankForm} fields that only emit `REQUIRED`.
 *
 * @public
 */
export type RequiredValidation = typeof BankFormErrorCodes.REQUIRED

/**
 * Validation error codes emitted by the `routingNumber` field of {@link useBankForm}.
 *
 * @public
 */
export type RoutingNumberValidation = (typeof BankFormErrorCodes)[keyof Pick<
  typeof BankFormErrorCodes,
  'REQUIRED' | 'INVALID_ROUTING_NUMBER'
>]

/**
 * Validation error codes emitted by the `accountNumber` field of {@link useBankForm}.
 *
 * @public
 */
export type AccountNumberValidation = (typeof BankFormErrorCodes)[keyof Pick<
  typeof BankFormErrorCodes,
  'REQUIRED' | 'INVALID_ACCOUNT_NUMBER'
>]

/**
 * Props accepted by {@link useBankForm}'s `Fields.Name` component.
 *
 * @public
 */
export type NameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `name` field of {@link useBankForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Name`. Captures the account
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
 * Props accepted by {@link useBankForm}'s `Fields.RoutingNumber` component.
 *
 * @public
 */
export type RoutingNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<RoutingNumberValidation>
>

/**
 * Text input bound to the `routingNumber` field of {@link useBankForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.RoutingNumber`. Validates the
 * value against a 9-digit numeric pattern.
 *
 * @param props - See {@link RoutingNumberFieldProps}.
 * @returns The rendered text input bound to `routingNumber`.
 * @public
 */
export function RoutingNumberField(props: RoutingNumberFieldProps) {
  return <TextInputHookField {...props} name="routingNumber" />
}

/**
 * Props accepted by {@link useBankForm}'s `Fields.AccountNumber` component.
 *
 * @public
 */
export type AccountNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<AccountNumberValidation>
>

/**
 * Text input bound to the `accountNumber` field of {@link useBankForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AccountNumber`. Validates the
 * value against a 1–17 digit numeric pattern.
 *
 * @param props - See {@link AccountNumberFieldProps}.
 * @returns The rendered text input bound to `accountNumber`.
 * @public
 */
export function AccountNumberField(props: AccountNumberFieldProps) {
  return <TextInputHookField {...props} name="accountNumber" />
}

/**
 * Props accepted by {@link useBankForm}'s `Fields.AccountType` component.
 *
 * @public
 */
export type AccountTypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, AccountType>
>

/**
 * Radio group bound to the `accountType` field of {@link useBankForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AccountType`. Options are
 * `Checking` and `Savings`; defaults to `Checking` when no value is supplied.
 * Supply `getOptionLabel` to translate the option labels.
 *
 * @param props - See {@link AccountTypeFieldProps}.
 * @returns The rendered radio group bound to `accountType`.
 * @public
 */
export function AccountTypeField(props: AccountTypeFieldProps) {
  return <RadioGroupHookField {...props} name="accountType" />
}
