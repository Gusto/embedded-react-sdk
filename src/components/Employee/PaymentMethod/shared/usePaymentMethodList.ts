import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodDeleteBankAccountMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodDeleteBankAccount'
import { useEmployeePaymentMethodsGetBankAccounts } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useEmployeePaymentMethodGet } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdate'
import { useEffect, useRef } from 'react'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { HookErrorHandling } from '@/partner-hook-utils/types'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents, SPLIT_BY, type EventType } from '@/shared/constants'

export interface UsePaymentMethodListParams {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UsePaymentMethodListLoading {
  isLoading: true
  errorHandling: HookErrorHandling
}

export interface UsePaymentMethodListReady {
  isLoading: false
  data: {
    paymentMethod: EmployeePaymentMethod
    bankAccounts: EmployeeBankAccount[]
  }
  errorHandling: HookErrorHandling
  deletePendingBankAccountUuid: string | undefined
  handleDelete: (uuid: string) => Promise<void>
}

export type UsePaymentMethodListResult = UsePaymentMethodListLoading | UsePaymentMethodListReady

export function usePaymentMethodList({
  employeeId,
  onEvent,
}: UsePaymentMethodListParams): UsePaymentMethodListResult {
  const paymentMethodQuery = useEmployeePaymentMethodGet({ employeeId })
  const bankAccountsQuery = useEmployeePaymentMethodsGetBankAccounts({ employeeId })

  const paymentMethod = paymentMethodQuery.data?.employeePaymentMethod
  const bankAccounts = bankAccountsQuery.data?.employeeBankAccounts

  const deleteBankAccountMutation = useEmployeePaymentMethodDeleteBankAccountMutation()
  const { mutateAsync: mutatePaymentMethod } = useEmployeePaymentMethodUpdateMutation()

  const normalizingRef = useRef(false)
  // Normalise single-account direct deposit to 100% on mount, skipping if already normalized
  // or if a normalization mutation is already in-flight (prevents version-conflict 409s).
  useEffect(() => {
    if (!paymentMethod) return
    const firstSplit = paymentMethod.splits?.[0]
    const alreadyNormalized =
      firstSplit?.splitAmount === 100 && paymentMethod.splitBy === SPLIT_BY.percentage
    if (
      paymentMethod.splits?.length === 1 &&
      paymentMethod.type === 'Direct Deposit' &&
      !alreadyNormalized &&
      !normalizingRef.current
    ) {
      normalizingRef.current = true
      void (async () => {
        try {
          await mutatePaymentMethod({
            request: {
              employeeId,
              requestBody: {
                splitBy: SPLIT_BY.percentage,
                splits: paymentMethod.splits!.map(split => ({
                  ...split,
                  splitAmount: 100,
                  priority: 1,
                })),
                version: paymentMethod.version as string,
                type: 'Direct Deposit',
              },
            },
          })
        } finally {
          normalizingRef.current = false
        }
      })()
    }
  }, [employeeId, paymentMethod, mutatePaymentMethod])

  const errorHandling = composeErrorHandler([paymentMethodQuery, bankAccountsQuery])

  const handleDelete = async (uuid: string) => {
    const data = await deleteBankAccountMutation.mutateAsync({
      request: { employeeId, bankAccountUuid: uuid },
    })
    onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, data)
  }

  const deletePendingBankAccountUuid = deleteBankAccountMutation.isPending
    ? deleteBankAccountMutation.variables.request.bankAccountUuid
    : undefined

  if (
    paymentMethodQuery.isLoading ||
    bankAccountsQuery.isLoading ||
    !paymentMethod ||
    !bankAccounts
  ) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { paymentMethod, bankAccounts },
    errorHandling,
    deletePendingBankAccountUuid,
    handleDelete,
  }
}
