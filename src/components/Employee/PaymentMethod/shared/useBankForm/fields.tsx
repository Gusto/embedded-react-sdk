import type { AccountType, BankFormErrorCodes } from './useBankFormSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import { TextInputHookField, RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type RequiredValidation = typeof BankFormErrorCodes.REQUIRED
export type RoutingNumberValidation = (typeof BankFormErrorCodes)[keyof Pick<
  typeof BankFormErrorCodes,
  'REQUIRED' | 'INVALID_ROUTING_NUMBER'
>]
export type AccountNumberValidation = (typeof BankFormErrorCodes)[keyof Pick<
  typeof BankFormErrorCodes,
  'REQUIRED' | 'INVALID_ACCOUNT_NUMBER'
>]

export type NameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function NameField(props: NameFieldProps) {
  return <TextInputHookField {...props} name="name" />
}

export type RoutingNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<RoutingNumberValidation>
>

export function RoutingNumberField(props: RoutingNumberFieldProps) {
  return <TextInputHookField {...props} name="routingNumber" />
}

export type AccountNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<AccountNumberValidation>
>

export function AccountNumberField(props: AccountNumberFieldProps) {
  return <TextInputHookField {...props} name="accountNumber" />
}

export type AccountTypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, AccountType>
>

export function AccountTypeField(props: AccountTypeFieldProps) {
  return <RadioGroupHookField {...props} name="accountType" />
}
