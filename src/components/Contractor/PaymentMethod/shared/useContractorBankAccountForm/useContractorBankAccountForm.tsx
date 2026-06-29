import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ContractorBankAccount } from '@gusto/embedded-api-v-2025-11-15/models/components/contractorbankaccount'
import { useContractorPaymentMethodGetBankAccounts } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentMethodsCreateBankAccount'
import {
  ACCOUNT_TYPES,
  createContractorBankAccountSchema,
  type ContractorAccountType,
  type ContractorBankAccountFormData,
  type ContractorBankAccountFormOutputs,
  type ContractorBankAccountOptionalFieldsToRequire,
} from './useContractorBankAccountFormSchema'
import { AccountNumberField, AccountTypeField, NameField, RoutingNumberField } from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'

/**
 * Props for {@link useContractorBankAccountForm}.
 *
 * @public
 */
export interface UseContractorBankAccountFormProps {
  /** Contractor for whom to create the bank account. */
  contractorId: string
  /** Override optional fields to be required. */
  optionalFieldsToRequire?: ContractorBankAccountOptionalFieldsToRequire
  /** Pre-fill form values. The contractor's existing bank account is used when no override is supplied. */
  defaultValues?: Partial<ContractorBankAccountFormData>
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Field components exposed by {@link useContractorBankAccountForm} on `form.Fields`.
 *
 * @public
 */
export interface ContractorBankAccountFormFields {
  /** Bound to `name` — see {@link NameField}. */
  Name: typeof NameField
  /** Bound to `routingNumber` — see {@link RoutingNumberField}. */
  RoutingNumber: typeof RoutingNumberField
  /** Bound to `accountNumber` — see {@link AccountNumberField}. */
  AccountNumber: typeof AccountNumberField
  /** Bound to `accountType` — see {@link AccountTypeField}. */
  AccountType: typeof AccountTypeField
}

/**
 * Ready-state return value of {@link useContractorBankAccountForm}.
 *
 * @public
 */
export interface UseContractorBankAccountFormReady extends BaseFormHookReady<
  FieldsMetadata,
  ContractorBankAccountFormData,
  ContractorBankAccountFormFields
> {
  /** The contractor's current bank account, loaded from the API, if any. */
  data: {
    bankAccount: ContractorBankAccount | undefined
  }
  /** `isPending` reflects the in-flight create mutation; `mode` is always `'create'`. */
  status: { isPending: boolean; mode: 'create' }
  /** Submit the form. Returns the created bank account on success or `undefined` on validation/mutation failure. */
  actions: {
    onSubmit: () => Promise<HookSubmitResult<ContractorBankAccount> | undefined>
  }
}

/**
 * Headless React Hook Form hook for creating a contractor's bank account.
 *
 * @remarks
 * Captures the account nickname, routing number, account number, and account
 * type. Creating a bank account also updates the contractor's payment method to
 * Direct Deposit on the Gusto API as a side-effect, so the Direct Deposit path
 * needs only this submit — no separate payment method update.
 *
 * When the contractor already has a bank account on file, the account number
 * field is pre-filled with the masked token the API returns (e.g. "XXXX1207").
 * The API requires `account_number` on every write and treats that exact masked
 * value as "keep the existing account," so submitting it unchanged preserves the
 * account while still applying any name/routing/type edits; typing a real number
 * replaces it.
 *
 * @param props - See {@link UseContractorBankAccountFormProps}.
 * @returns A loading-state result while data loads, or a {@link UseContractorBankAccountFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorBankAccountForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function AddBankAccount({ contractorId }: { contractorId: string }) {
 *   const bankForm = useContractorBankAccountForm({ contractorId })
 *
 *   if (bankForm.isLoading) return null
 *   const { Fields } = bankForm.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={bankForm}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void bankForm.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.Name label="Account nickname" />
 *         <Fields.RoutingNumber label="Routing number" />
 *         <Fields.AccountNumber label="Account number" />
 *         <Fields.AccountType label="Account type" />
 *         <button type="submit" disabled={bankForm.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useContractorBankAccountForm({
  contractorId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseContractorBankAccountFormProps): HookLoadingResult | UseContractorBankAccountFormReady {
  const bankAccountsQuery = useContractorPaymentMethodGetBankAccounts({
    contractorUuid: contractorId,
  })
  const bankAccount = bankAccountsQuery.data?.contractorBankAccountList?.[0] ?? undefined

  const existingAccountNumberMask = bankAccount?.hiddenAccountNumber ?? undefined

  const [schema, metadataConfig] = useMemo(
    () =>
      createContractorBankAccountSchema({
        optionalFieldsToRequire,
        existingAccountNumberMask,
      }),
    [optionalFieldsToRequire, existingAccountNumberMask],
  )

  // The account number is seeded with the masked token the API returns (e.g.
  // "XXXX1207"). The bank account API requires account_number on every write
  // and treats that exact masked value as "keep the existing account," so
  // submitting it unchanged preserves the account; typing a new number replaces it.
  const resolvedDefaults: ContractorBankAccountFormData = useMemo(
    () => ({
      name: partnerDefaults?.name ?? bankAccount?.name ?? '',
      routingNumber: partnerDefaults?.routingNumber ?? bankAccount?.routingNumber ?? '',
      accountNumber: partnerDefaults?.accountNumber ?? existingAccountNumberMask ?? '',
      accountType: (partnerDefaults?.accountType ??
        bankAccount?.accountType ??
        'Checking') as ContractorAccountType,
    }),
    [partnerDefaults, bankAccount, existingAccountNumberMask],
  )

  const formMethods = useForm<
    ContractorBankAccountFormData,
    unknown,
    ContractorBankAccountFormOutputs
  >({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const createMutation = useContractorPaymentMethodsCreateBankAccountMutation()
  const isPending = createMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('ContractorBankAccountForm')

  const errorHandling = composeErrorHandler([bankAccountsQuery], {
    submitError,
    setSubmitError,
  })

  const accountTypeOptions = ACCOUNT_TYPES.map(value => ({ value, label: value }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    name: baseMetadata.name,
    routingNumber: baseMetadata.routingNumber,
    accountNumber: baseMetadata.accountNumber,
    accountType: withOptions<ContractorAccountType>(baseMetadata.accountType, accountTypeOptions, [
      ...ACCOUNT_TYPES,
    ]),
  }

  const onSubmit = async (): Promise<HookSubmitResult<ContractorBankAccount> | undefined> => {
    let submitResult: HookSubmitResult<ContractorBankAccount> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ContractorBankAccountFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const response = await createMutation.mutateAsync({
              request: {
                contractorUuid: contractorId,
                contractorBankAccountCreateRequestBody: {
                  name: payload.name,
                  routingNumber: payload.routingNumber,
                  accountNumber: payload.accountNumber,
                  accountType: payload.accountType,
                },
              },
            })

            if (!response.contractorBankAccount) {
              throw new SDKInternalError('Bank account creation failed')
            }

            submitResult = { mode: 'create' as const, data: response.contractorBankAccount }
          })
          resolve()
        },
        () => {
          resolve()
        },
      )()
    })

    return submitResult
  }

  const hookFormInternals = useHookFormInternals(formMethods)

  if (bankAccountsQuery.isLoading) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: { bankAccount },
    status: { isPending, mode: 'create' as const },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Name: NameField,
        RoutingNumber: RoutingNumberField,
        AccountNumber: AccountNumberField,
        AccountType: AccountTypeField,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Return type of {@link useContractorBankAccountForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UseContractorBankAccountFormResult =
  HookLoadingResult | UseContractorBankAccountFormReady

/**
 * Per-field metadata exposed on `form.fieldsMetadata` for {@link useContractorBankAccountForm}.
 *
 * @public
 */
export type ContractorBankAccountFieldsMetadata =
  UseContractorBankAccountFormReady['form']['fieldsMetadata']
