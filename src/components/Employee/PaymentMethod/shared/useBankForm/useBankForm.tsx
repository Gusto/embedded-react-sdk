import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeBankAccount } from '@gusto/embedded-api-v-2025-11-15/models/components/employeebankaccount'
import { useEmployeePaymentMethodCreateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/employeePaymentMethodCreate'
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

export interface BankFormSubmitOptions {
  /** Override the `employeeId` configured at hook construction. Useful when the employee is created in the same submit chain. */
  employeeId?: string
}

export interface UseBankFormProps {
  /** Employee for whom to create the bank account. May be supplied later via `BankFormSubmitOptions.employeeId`. */
  employeeId?: string
  optionalFieldsToRequire?: BankFormOptionalFieldsToRequire
  defaultValues?: Partial<BankFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export interface BankFormFields {
  Name: typeof NameField
  RoutingNumber: typeof RoutingNumberField
  AccountNumber: typeof AccountNumberField
  AccountType: typeof AccountTypeField
}

export interface UseBankFormReady extends BaseFormHookReady<
  FieldsMetadata,
  BankFormData,
  BankFormFields
> {
  data: Record<string, never>
  status: { isPending: boolean; mode: 'create' }
  actions: {
    onSubmit: (
      options?: BankFormSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeBankAccount> | undefined>
  }
}

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

export type UseBankFormResult = HookLoadingResult | UseBankFormReady
export type BankFormFieldsMetadata = UseBankFormReady['form']['fieldsMetadata']
