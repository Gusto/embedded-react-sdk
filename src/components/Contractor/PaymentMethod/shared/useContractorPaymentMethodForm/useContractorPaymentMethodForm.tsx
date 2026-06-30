import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import type { ContractorPaymentMethod } from '@gusto/embedded-api-v-2025-11-15/models/components/contractorpaymentmethod'
import type { ContractorBankAccount } from '@gusto/embedded-api-v-2025-11-15/models/components/contractorbankaccount'
import { useContractorPaymentMethodGet } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentMethodGet'
import { buildContractorPaymentMethodGetQuery } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccounts } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentMethodsCreateBankAccount'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentMethodUpdate'
import { useGustoEmbeddedContext } from '@gusto/embedded-api-v-2025-11-15/react-query/_context'
import {
  ACCOUNT_TYPES,
  createContractorPaymentMethodSchema,
  type ContractorAccountType,
  type ContractorPaymentMethodFormData,
  type ContractorPaymentMethodFormOutputs,
  type ContractorPaymentMethodFormType,
  type ContractorPaymentMethodOptionalFieldsToRequire,
  PAYMENT_METHOD_TYPES,
} from './contractorPaymentMethodSchema'
import {
  AccountNumberField,
  AccountTypeField,
  NameField,
  RoutingNumberField,
  TypeField,
} from './fields'
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
import { PAYMENT_METHODS } from '@/shared/constants'

/**
 * Optional submit-time callbacks for {@link useContractorPaymentMethodForm}'s `onSubmit`.
 *
 * @public
 */
export interface ContractorPaymentMethodSubmitOptions {
  /**
   * Called after a bank account is successfully created (Direct Deposit only),
   * before the payment method update completes. Use it to surface the
   * intermediate "bank account created" event.
   */
  onBankAccountCreated?: (bankAccount: ContractorBankAccount) => void
}

/**
 * Props for {@link useContractorPaymentMethodForm}.
 *
 * @public
 */
export interface UseContractorPaymentMethodFormProps {
  /** Contractor whose payment method is being edited. */
  contractorId: string
  /** Override optional fields to be required. */
  optionalFieldsToRequire?: ContractorPaymentMethodOptionalFieldsToRequire
  /** Pre-fill form values. Server data (the current payment method and bank account) is used when no override is supplied. */
  defaultValues?: Partial<ContractorPaymentMethodFormData>
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Field components exposed by {@link useContractorPaymentMethodForm} on `form.Fields`.
 *
 * @remarks
 * The bank-account fields are `undefined` when the payment method is Check.
 * Always null-check before rendering.
 *
 * @public
 */
export interface ContractorPaymentMethodFormFields {
  /** Radio group bound to `type`. Always available. */
  Type: typeof TypeField
  /** Text input bound to `name`; available only for Direct Deposit. */
  Name: typeof NameField | undefined
  /** Text input bound to `routingNumber`; available only for Direct Deposit. */
  RoutingNumber: typeof RoutingNumberField | undefined
  /** Text input bound to `accountNumber`; available only for Direct Deposit. */
  AccountNumber: typeof AccountNumberField | undefined
  /** Radio group bound to `accountType`; available only for Direct Deposit. */
  AccountType: typeof AccountTypeField | undefined
}

/**
 * Ready-state return value of {@link useContractorPaymentMethodForm}.
 *
 * @public
 */
export interface UseContractorPaymentMethodFormReady extends BaseFormHookReady<
  FieldsMetadata,
  ContractorPaymentMethodFormData,
  ContractorPaymentMethodFormFields
> {
  /** The contractor's current payment method and bank account, loaded from the API. */
  data: {
    paymentMethod: ContractorPaymentMethod
    bankAccount: ContractorBankAccount | undefined
  }
  /** `isPending` reflects the in-flight submit sequence; `mode` is always `'update'`. */
  status: { isPending: boolean; mode: 'update' }
  /** Submit the form. Returns the updated payment method on success or `undefined` on validation/mutation failure. */
  actions: {
    onSubmit: (
      options?: ContractorPaymentMethodSubmitOptions,
    ) => Promise<HookSubmitResult<ContractorPaymentMethod> | undefined>
  }
}

/**
 * Headless React Hook Form hook for managing a contractor's payment method.
 *
 * @remarks
 * Switches between Direct Deposit and Check on a single form. Choosing Direct
 * Deposit reveals the bank account fields (nickname, routing number, account
 * number, account type) and, on submit, creates the bank account, refetches the
 * payment method to pick up the bumped optimistic-locking version, then updates
 * the payment method. Choosing Check hides the bank fields and only updates the
 * payment method type. Always operates in update mode — every contractor has a
 * payment method, defaulting to Check.
 *
 * Bank-field visibility and requiredness are driven by the selected `type`: the
 * fields are `undefined` on `form.Fields` and skip their required checks when
 * Check is selected. The account number is pre-filled with the masked value and
 * only re-validated once a bank field changes.
 *
 * @param props - See {@link UseContractorPaymentMethodFormProps}.
 * @returns A loading-state result while data loads, or a {@link UseContractorPaymentMethodFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   useContractorPaymentMethodForm,
 *   SDKFormProvider,
 *   PAYMENT_METHODS,
 * } from '@gusto/embedded-react-sdk'
 *
 * function PaymentMethodScreen({ contractorId }: { contractorId: string }) {
 *   const paymentMethod = useContractorPaymentMethodForm({ contractorId })
 *
 *   if (paymentMethod.isLoading) return null
 *   const { Fields } = paymentMethod.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={paymentMethod}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void paymentMethod.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.Type label="Select payment method" />
 *         {Fields.Name && <Fields.Name label="Account nickname" />}
 *         {Fields.RoutingNumber && <Fields.RoutingNumber label="Routing number" />}
 *         {Fields.AccountNumber && <Fields.AccountNumber label="Account number" />}
 *         {Fields.AccountType && <Fields.AccountType label="Account type" />}
 *         <button type="submit" disabled={paymentMethod.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useContractorPaymentMethodForm({
  contractorId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseContractorPaymentMethodFormProps): HookLoadingResult | UseContractorPaymentMethodFormReady {
  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()

  const paymentMethodQuery = useContractorPaymentMethodGet({ contractorUuid: contractorId })
  const paymentMethod = paymentMethodQuery.data?.contractorPaymentMethod

  const bankAccountsQuery = useContractorPaymentMethodGetBankAccounts({
    contractorUuid: contractorId,
  })
  const bankAccount = bankAccountsQuery.data?.contractorBankAccountList?.[0] ?? undefined

  const [schema, metadataConfig] = useMemo(
    () =>
      createContractorPaymentMethodSchema({
        optionalFieldsToRequire,
        existingBankAccount: bankAccount
          ? {
              name: bankAccount.name,
              routingNumber: bankAccount.routingNumber,
              accountType: bankAccount.accountType,
              hiddenAccountNumber: bankAccount.hiddenAccountNumber,
            }
          : undefined,
      }),
    [optionalFieldsToRequire, bankAccount],
  )

  const resolvedDefaults: ContractorPaymentMethodFormData = useMemo(
    () => ({
      type: (partnerDefaults?.type ??
        paymentMethod?.type ??
        PAYMENT_METHODS.check) as ContractorPaymentMethodFormType,
      name: partnerDefaults?.name ?? bankAccount?.name ?? '',
      routingNumber: partnerDefaults?.routingNumber ?? bankAccount?.routingNumber ?? '',
      accountNumber: partnerDefaults?.accountNumber ?? bankAccount?.hiddenAccountNumber ?? '',
      accountType: (partnerDefaults?.accountType ??
        bankAccount?.accountType ??
        'Checking') as ContractorAccountType,
    }),
    [partnerDefaults, paymentMethod, bankAccount],
  )

  const formMethods = useForm<
    ContractorPaymentMethodFormData,
    unknown,
    ContractorPaymentMethodFormOutputs
  >({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  // Render-gating: the bank fields apply only to Direct Deposit. The schema
  // mirrors this via `getExcludedPaymentMethodFields` so hidden fields never
  // trip a phantom required error.
  const watchedType = useWatch({ control: formMethods.control, name: 'type' })
  const showBankFields = watchedType === PAYMENT_METHODS.directDeposit

  const createBankAccountMutation = useContractorPaymentMethodsCreateBankAccountMutation()
  const updatePaymentMethodMutation = useContractorPaymentMethodUpdateMutation()
  const [isRefetchingVersion, setIsRefetchingVersion] = useState(false)

  const isPending =
    createBankAccountMutation.isPending ||
    updatePaymentMethodMutation.isPending ||
    isRefetchingVersion

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('ContractorPaymentMethodForm')

  const errorHandling = composeErrorHandler([paymentMethodQuery, bankAccountsQuery], {
    submitError,
    setSubmitError,
  })

  const typeOptions = PAYMENT_METHOD_TYPES.map(value => ({ value, label: value }))
  const accountTypeOptions = ACCOUNT_TYPES.map(value => ({ value, label: value }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    ...baseMetadata,
    type: withOptions<ContractorPaymentMethodFormType>(baseMetadata.type, typeOptions, [
      ...PAYMENT_METHOD_TYPES,
    ]),
    accountType: withOptions<ContractorAccountType>(baseMetadata.accountType, accountTypeOptions, [
      ...ACCOUNT_TYPES,
    ]),
  }

  const onSubmit = async (
    options?: ContractorPaymentMethodSubmitOptions,
  ): Promise<HookSubmitResult<ContractorPaymentMethod> | undefined> => {
    if (!paymentMethod) {
      throw new SDKInternalError('Cannot submit payment method form before data is loaded')
    }
    const currentPaymentMethod = paymentMethod
    let submitResult: HookSubmitResult<ContractorPaymentMethod> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ContractorPaymentMethodFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            let version = currentPaymentMethod.version as string

            if (payload.type === PAYMENT_METHODS.directDeposit) {
              const createResponse = await createBankAccountMutation.mutateAsync({
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

              if (createResponse.contractorBankAccount) {
                options?.onBankAccountCreated?.(createResponse.contractorBankAccount)
              }

              // Creating the bank account bumps the payment method version, so
              // refetch it imperatively to update with the latest version.
              setIsRefetchingVersion(true)
              try {
                const refetched = await queryClient.fetchQuery(
                  buildContractorPaymentMethodGetQuery(gustoClient, {
                    contractorUuid: contractorId,
                  }),
                )
                version = refetched.contractorPaymentMethod?.version ?? version
              } finally {
                setIsRefetchingVersion(false)
              }
            }

            const updateResponse = await updatePaymentMethodMutation.mutateAsync({
              request: {
                contractorUuid: contractorId,
                requestBody: { type: payload.type, version },
              },
            })

            if (!updateResponse.contractorPaymentMethod) {
              throw new SDKInternalError('Payment method update failed')
            }

            submitResult = { mode: 'update' as const, data: updateResponse.contractorPaymentMethod }
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

  if (paymentMethodQuery.isLoading || bankAccountsQuery.isLoading || !paymentMethod) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: { paymentMethod, bankAccount },
    status: { isPending, mode: 'update' as const },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Type: TypeField,
        Name: showBankFields ? NameField : undefined,
        RoutingNumber: showBankFields ? RoutingNumberField : undefined,
        AccountNumber: showBankFields ? AccountNumberField : undefined,
        AccountType: showBankFields ? AccountTypeField : undefined,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Return type of {@link useContractorPaymentMethodForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UseContractorPaymentMethodFormResult =
  HookLoadingResult | UseContractorPaymentMethodFormReady

/**
 * Per-field metadata exposed on `form.fieldsMetadata` for {@link useContractorPaymentMethodForm}.
 *
 * @public
 */
export type ContractorPaymentMethodFieldsMetadata =
  UseContractorPaymentMethodFormReady['form']['fieldsMetadata']
