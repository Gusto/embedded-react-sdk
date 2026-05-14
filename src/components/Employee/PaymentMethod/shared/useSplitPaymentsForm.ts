import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useEmployeePaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdate'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, type DefaultValues, type SubmitHandler } from 'react-hook-form'
import { CombinedSchema, type CombinedSchemaInputs } from './paymentMethodSchema'
import type { WorkingSplit } from './SplitViewFields'
import type { OnEventType } from '@/components/Base/useBase'
import { centsToDollars, dollarsToCents } from '@/helpers/currencyHelpers'
import { componentEvents, SPLIT_BY, type EventType } from '@/shared/constants'

export interface UseSplitPaymentsFormParams {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UseSplitPaymentsFormResult {
  paymentMethod: EmployeePaymentMethod
  bankAccounts: EmployeeBankAccount[]
  splits: WorkingSplit[]
  formMethods: ReturnType<typeof useForm<CombinedSchemaInputs>>
  isPending: boolean
  handleSplitSubmit: SubmitHandler<CombinedSchemaInputs>
  resetToDefaults: () => void
}

export function useSplitPaymentsForm({
  employeeId,
  onEvent,
}: UseSplitPaymentsFormParams): UseSplitPaymentsFormResult {
  const {
    data: { employeePaymentMethod },
  } = useEmployeePaymentMethodGetSuspense({ employeeId })
  const paymentMethod = employeePaymentMethod!

  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const bankAccounts = bankAccountsList.employeeBankAccounts!

  const paymentMethodMutation = useEmployeePaymentMethodUpdateMutation()

  const splits: WorkingSplit[] = useMemo(() => {
    if (paymentMethod.splits && paymentMethod.splits.length > 0) {
      return paymentMethod.splits as WorkingSplit[]
    }
    return bankAccounts.map((account, index) => ({
      uuid: account.uuid,
      name: account.name ?? '',
      hiddenAccountNumber: account.hiddenAccountNumber ?? '',
      splitAmount: null,
      priority: index + 1,
    }))
  }, [paymentMethod.splits, bankAccounts])

  const defaultFormValues = useMemo(() => {
    const isAmountSplit = paymentMethod.splitBy === SPLIT_BY.amount
    const { splitAmount, priority } = paymentMethod.splits?.reduce(
      (acc, { uuid, splitAmount: amount, priority: p }) => ({
        splitAmount: {
          ...acc.splitAmount,
          [uuid]: isAmountSplit ? centsToDollars(amount ?? null) : (amount ?? null),
        },
        priority: { ...acc.priority, [uuid]: Number(p) },
      }),
      { splitAmount: {} as Record<string, number | null>, priority: {} as Record<string, number> },
    ) ?? { splitAmount: {}, priority: {} }

    const remainder = paymentMethod.splits?.reduce(
      (acc, curr) =>
        curr.splitAmount === null ? curr.uuid : (paymentMethod.splits?.at(-1)?.uuid ?? acc),
      '',
    )

    return {
      type: 'Direct Deposit' as const,
      isSplit: true as const,
      hasBankPayload: false as const,
      splitBy: paymentMethod.splitBy ?? SPLIT_BY.percentage,
      splitAmount,
      priority,
      remainder,
    }
  }, [paymentMethod.splitBy, paymentMethod.splits])

  const formMethods = useForm<CombinedSchemaInputs>({
    resolver: zodResolver(CombinedSchema),
    defaultValues: defaultFormValues as DefaultValues<CombinedSchemaInputs>,
  })

  const { reset: resetForm } = formMethods

  useEffect(() => {
    resetForm(defaultFormValues as DefaultValues<CombinedSchemaInputs>)
  }, [bankAccounts.length, paymentMethod, resetForm]) // eslint-disable-line react-hooks/exhaustive-deps

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
      splits: splits.map(split => {
        const splitAmountValue = payload.splitAmount[split.uuid] ?? null
        return {
          uuid: split.uuid,
          name: split.name ?? undefined,
          hiddenAccountNumber: split.hiddenAccountNumber ?? undefined,
          splitAmount: isAmountSplit ? dollarsToCents(splitAmountValue) : splitAmountValue,
          priority: payload.priority[split.uuid],
        }
      }),
    }

    const response = await paymentMethodMutation.mutateAsync({
      request: { employeeId, requestBody: { ...body, type: 'Direct Deposit' } },
    })

    onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, response)
  }

  const resetToDefaults = () => {
    resetForm(defaultFormValues as DefaultValues<CombinedSchemaInputs>)
  }

  return {
    paymentMethod,
    bankAccounts,
    splits,
    formMethods,
    isPending: paymentMethodMutation.isPending,
    handleSplitSubmit,
    resetToDefaults,
  }
}
