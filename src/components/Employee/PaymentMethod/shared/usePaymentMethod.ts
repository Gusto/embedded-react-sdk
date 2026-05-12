import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodCreateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodCreate'
import { useEmployeePaymentMethodDeleteBankAccountMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodDeleteBankAccount'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useEmployeePaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateBankAccountMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdateBankAccount'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdate'
import { useEffect, useMemo } from 'react'
import { useForm, type DefaultValues, type SubmitHandler } from 'react-hook-form'
import {
  CombinedSchema,
  type CombinedSchemaInputs,
  type CombinedSchemaOutputs,
} from './paymentMethodSchema'
import type { OnEventType } from '@/components/Base/useBase'
import { centsToDollars, dollarsToCents } from '@/helpers/currencyHelpers'
import { componentEvents, PAYMENT_METHODS, SPLIT_BY, type EventType } from '@/shared/constants'

export interface UsePaymentMethodParams {
  employeeId: string
  isAdmin: boolean
  onEvent: OnEventType<EventType, unknown>
}

export interface UsePaymentMethodResult {
  bankAccounts: EmployeeBankAccount[]
  paymentMethod: EmployeePaymentMethod
  formMethods: ReturnType<typeof useForm<CombinedSchemaInputs>>
  isPending: boolean
  deletePendingBankAccountUuid: string | undefined
  isAdmin: boolean
  handleBankAccountSubmit: SubmitHandler<CombinedSchemaInputs>
  handlePaymentMethodTypeSubmit: SubmitHandler<CombinedSchemaInputs>
  handleSplitSubmit: SubmitHandler<CombinedSchemaInputs>
  handleDelete: (uuid: string) => Promise<void>
  resetToDefaults: () => void
}

export function usePaymentMethod({
  employeeId,
  isAdmin,
  onEvent,
}: UsePaymentMethodParams): UsePaymentMethodResult {
  const {
    data: { employeePaymentMethod },
  } = useEmployeePaymentMethodGetSuspense({ employeeId })
  const paymentMethod = employeePaymentMethod!

  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const bankAccounts = bankAccountsList.employeeBankAccounts!

  const paymentMethodMutation = useEmployeePaymentMethodUpdateMutation()
  const deleteBankAccountMutation = useEmployeePaymentMethodDeleteBankAccountMutation()
  const addBankAccountMutation = useEmployeePaymentMethodCreateMutation()
  const updateBankAccountMutation = useEmployeePaymentMethodUpdateBankAccountMutation()

  const baseDefaultValues: Partial<CombinedSchemaOutputs> = useMemo(
    () =>
      ({
        type: 'Direct Deposit',
        isSplit: false,
        hasBankPayload: false,
        name: '',
        routingNumber: '',
        accountNumber: '',
        accountType: 'Checking',
        splitBy: undefined,
        splitAmount: {},
        priority: {},
      }) as Partial<CombinedSchemaOutputs>,
    [],
  )

  const defaultFormValues: CombinedSchemaOutputs = useMemo(() => {
    const isAmountSplit = paymentMethod.splitBy === SPLIT_BY.amount
    return {
      ...baseDefaultValues,
      type: paymentMethod.type ?? 'Direct Deposit',
      splitBy: paymentMethod.splitBy ?? undefined,
      ...paymentMethod.splits?.reduce(
        (acc, { uuid, splitAmount, priority }) => ({
          splitAmount: {
            ...acc.splitAmount,
            [uuid]: isAmountSplit ? centsToDollars(splitAmount ?? null) : (splitAmount ?? null),
          },
          priority: { ...acc.priority, [uuid]: Number(priority) },
        }),
        { splitAmount: {}, priority: {} },
      ),
      remainder:
        paymentMethod.type === 'Direct Deposit' && paymentMethod.splits
          ? paymentMethod.splits.reduce(
              (acc, curr) =>
                curr.splitAmount === null ? curr.uuid : (paymentMethod.splits?.at(-1)?.uuid ?? acc),
              '',
            )
          : undefined,
    } as CombinedSchemaOutputs
  }, [baseDefaultValues, paymentMethod.type, paymentMethod.splitBy, paymentMethod.splits])

  const formMethods = useForm<CombinedSchemaInputs>({
    resolver: zodResolver(CombinedSchema),
    defaultValues: defaultFormValues as DefaultValues<CombinedSchemaInputs>,
  })

  const { reset: resetForm } = formMethods
  const { mutateAsync: mutatePaymentMethod } = paymentMethodMutation

  // Normalise single-account direct deposit to 100% on mount
  useEffect(() => {
    void (async () => {
      if (paymentMethod.splits?.length === 1 && paymentMethod.type === 'Direct Deposit') {
        await mutatePaymentMethod({
          request: {
            employeeId,
            requestBody: {
              splitBy: SPLIT_BY.percentage,
              splits: paymentMethod.splits.map(split => ({
                ...split,
                splitAmount: 100,
                priority: 1,
              })),
              version: paymentMethod.version as string,
              type: 'Direct Deposit',
            },
          },
        })
      }
    })()
  }, [employeeId, paymentMethod, mutatePaymentMethod])

  // Sync form defaults when server data or account list changes
  useEffect(() => {
    resetForm(defaultFormValues)
  }, [bankAccounts.length, paymentMethod, defaultFormValues, resetForm])

  const handleBankAccountSubmit: SubmitHandler<CombinedSchemaInputs> = async payload => {
    if (
      payload.type !== 'Direct Deposit' ||
      !('hasBankPayload' in payload) ||
      !payload.hasBankPayload
    )
      return

    const response = await addBankAccountMutation.mutateAsync({
      request: {
        employeeId,
        employeeBankAccountRequest: {
          name: payload.name,
          routingNumber: payload.routingNumber,
          accountNumber: payload.accountNumber,
          accountType: payload.accountType,
        },
      },
    })

    formMethods.setValue('hasBankPayload', false)
    formMethods.setValue('isSplit', false)
    onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, response)
  }

  const handlePaymentMethodTypeSubmit: SubmitHandler<CombinedSchemaInputs> = async payload => {
    const { type } = payload
    const body =
      type === PAYMENT_METHODS.check
        ? { version: paymentMethod.version as string }
        : {
            ...paymentMethod,
            version: paymentMethod.version as string,
            splitBy: paymentMethod.splitBy ?? SPLIT_BY.percentage,
            splits: paymentMethod.splits ?? [],
          }

    const response = await paymentMethodMutation.mutateAsync({
      request: { employeeId, requestBody: { ...body, type } },
    })

    formMethods.setValue('isSplit', false)
    onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, response)
    onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)
  }

  const handleSplitSubmit: SubmitHandler<CombinedSchemaInputs> = async payload => {
    if (
      payload.type !== 'Direct Deposit' ||
      !('isSplit' in payload) ||
      !payload.isSplit ||
      !('splitBy' in payload)
    )
      return

    const isAmountSplit = payload.splitBy === SPLIT_BY.amount
    const body = {
      ...paymentMethod,
      version: paymentMethod.version as string,
      splitBy: payload.splitBy,
      splits:
        paymentMethod.splits?.map(split => {
          const splitAmountValue = payload.splitAmount[split.uuid] ?? null
          return {
            ...split,
            splitAmount: isAmountSplit ? dollarsToCents(splitAmountValue) : splitAmountValue,
            priority: payload.priority[split.uuid],
          }
        }) ?? [],
    }

    const response = await paymentMethodMutation.mutateAsync({
      request: { employeeId, requestBody: { ...body, type: 'Direct Deposit' } },
    })

    formMethods.setValue('isSplit', false)
    onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, response)
  }

  const handleDelete = async (uuid: string) => {
    const data = await deleteBankAccountMutation.mutateAsync({
      request: { employeeId, bankAccountUuid: uuid },
    })
    onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, data)
  }

  const resetToDefaults = () => {
    resetForm(defaultFormValues)
  }

  return {
    bankAccounts,
    paymentMethod,
    formMethods,
    isPending:
      deleteBankAccountMutation.isPending ||
      paymentMethodMutation.isPending ||
      addBankAccountMutation.isPending ||
      updateBankAccountMutation.isPending,
    deletePendingBankAccountUuid: deleteBankAccountMutation.isPending
      ? deleteBankAccountMutation.variables.request.bankAccountUuid
      : undefined,
    isAdmin,
    handleBankAccountSubmit,
    handlePaymentMethodTypeSubmit,
    handleSplitSubmit,
    handleDelete,
    resetToDefaults,
  }
}
