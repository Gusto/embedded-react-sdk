import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeBankAccount } from '@gusto/embedded-api-v-2026-06-15/models/components/employeebankaccount'
import { useEmployeePaymentMethodCreateMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeePaymentMethodCreate'
import {
  ACCOUNT_TYPES,
  type AccountType,
  createBankFormSchema,
  type BankFormData,
  type BankFormOptionalFieldsToRequire,
  type BankFormOutputs,
} from './useBankFormSchema'
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
 * Optional submit-time overrides for {@link useBankForm}'s `onSubmit`.
 *
 * @public
 */
export interface BankFormSubmitOptions {
  /** Override the `employeeId` configured at hook construction. Useful when the employee is created in the same submit chain. */
  employeeId?: string
}

/**
 * Props for {@link useBankForm}.
 *
 * @public
 */
export interface UseBankFormProps {
  /** Employee for whom to create the bank account. May be supplied later via `BankFormSubmitOptions.employeeId`. */
  employeeId?: string
  /** Override optional fields to be required. Reserved for future schema expansion — every field is required by default. */
  optionalFieldsToRequire?: BankFormOptionalFieldsToRequire
  /** Pre-fill form values. `accountType` defaults to `'Checking'` when not supplied. */
  defaultValues?: Partial<BankFormData>
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Field components exposed by {@link useBankForm} on `form.Fields`.
 *
 * @public
 */
export interface BankFormFields {
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
 * Ready-state return value of {@link useBankForm}.
 *
 * @public
 */
export interface UseBankFormReady extends BaseFormHookReady<
  FieldsMetadata,
  BankFormData,
  BankFormFields
> {
  /** No server-fetched data — the create form derives everything from user input. */
  data: Record<string, never>
  /** `isPending` reflects the in-flight create mutation; `mode` is always `'create'`. */
  status: { isPending: boolean; mode: 'create' }
  /** Submit the form. Optional {@link BankFormSubmitOptions} can override the `employeeId` supplied to the hook. */
  actions: {
    onSubmit: (
      options?: BankFormSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeBankAccount> | undefined>
  }
}

/**
 * Headless React Hook Form hook for creating an employee bank account.
 *
 * @remarks
 * Captures the account nickname, routing number, account number, and account
 * type. Creating a bank account also updates the employee's payment method on
 * the Gusto API. Returns the standard `HookLoadingResult | UseBankFormReady`
 * discriminated union; in practice the hook transitions to the ready state
 * immediately because it does not fetch any server data.
 *
 * @param props - See {@link UseBankFormProps}.
 * @returns A loading-state result while the hook is initializing, or a {@link UseBankFormReady} ready to render.
 * @public
 *
 * @example
 * ```tsx
 * import { useBankForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function AddBankAccount({ employeeId }: { employeeId: string }) {
 *   const bankForm = useBankForm({ employeeId })
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
export function useBankForm({
  employeeId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseBankFormProps): HookLoadingResult | UseBankFormReady {
  const [schema, metadataConfig] = useMemo(
    () => createBankFormSchema({ optionalFieldsToRequire }),
    [optionalFieldsToRequire],
  )

  const resolvedDefaults: BankFormData = useMemo(
    () => ({
      name: partnerDefaults?.name ?? '',
      routingNumber: partnerDefaults?.routingNumber ?? '',
      accountNumber: partnerDefaults?.accountNumber ?? '',
      accountType: (partnerDefaults?.accountType ?? 'Checking') as AccountType,
    }),
    [partnerDefaults],
  )

  const formMethods = useForm<BankFormData, unknown, BankFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const createMutation = useEmployeePaymentMethodCreateMutation()
  const isPending = createMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('BankForm')

  const errorHandling = composeErrorHandler([], { submitError, setSubmitError })

  const accountTypeOptions = ACCOUNT_TYPES.map(value => ({ value, label: value }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    name: baseMetadata.name,
    routingNumber: baseMetadata.routingNumber,
    accountNumber: baseMetadata.accountNumber,
    accountType: withOptions<AccountType>(baseMetadata.accountType, accountTypeOptions, [
      ...ACCOUNT_TYPES,
    ]),
  }

  const onSubmit = async (
    options?: BankFormSubmitOptions,
  ): Promise<HookSubmitResult<EmployeeBankAccount> | undefined> => {
    let submitResult: HookSubmitResult<EmployeeBankAccount> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: BankFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const resolvedEmployeeId = options?.employeeId ?? employeeId
            if (!resolvedEmployeeId) {
              throw new SDKInternalError(
                'employeeId is required to submit a bank account. Pass it to useBankForm or via BankFormSubmitOptions.',
              )
            }

            const response = await createMutation.mutateAsync({
              request: {
                employeeId: resolvedEmployeeId,
                employeeBankAccountRequest: {
                  name: payload.name,
                  routingNumber: payload.routingNumber,
                  accountNumber: payload.accountNumber,
                  accountType: payload.accountType,
                },
              },
            })

            if (!response.employeeBankAccount) {
              throw new SDKInternalError('Bank account creation failed')
            }

            submitResult = { mode: 'create' as const, data: response.employeeBankAccount }
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

  return {
    isLoading: false as const,
    data: {} as Record<string, never>,
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
 * Return type of {@link useBankForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UseBankFormResult = HookLoadingResult | UseBankFormReady

/**
 * Per-field metadata exposed on `form.fieldsMetadata` for {@link useBankForm}.
 *
 * @public
 */
export type BankFormFieldsMetadata = UseBankFormReady['form']['fieldsMetadata']
