import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodDeleteBankAccountMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodDeleteBankAccount'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useEmployeePaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdate'
import { useEffect, useRef } from 'react'
import { useBase, type OnEventType } from '@/components/Base/useBase'
import { componentEvents, SPLIT_BY, type EventType } from '@/shared/constants'

export interface UsePaymentMethodListParams {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UsePaymentMethodListResult {
  paymentMethod: EmployeePaymentMethod
  bankAccounts: EmployeeBankAccount[]
  deletePendingBankAccountUuid: string | undefined
  handleDelete: (uuid: string) => Promise<void>
}

export function usePaymentMethodList({
  employeeId,
  onEvent,
}: UsePaymentMethodListParams): UsePaymentMethodListResult {
  const { baseSubmitHandler } = useBase()
  const {
    data: { employeePaymentMethod },
  } = useEmployeePaymentMethodGetSuspense({ employeeId })
  const paymentMethod = employeePaymentMethod!

  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const bankAccounts = bankAccountsList.employeeBankAccounts!

  const deleteBankAccountMutation = useEmployeePaymentMethodDeleteBankAccountMutation()
  const { mutateAsync: mutatePaymentMethod } = useEmployeePaymentMethodUpdateMutation()

  const normalizingRef = useRef(false)
  // Normalise single-account direct deposit to 100% on mount, skipping if already normalized
  // or if a normalization mutation is already in-flight (prevents version-conflict 409s).
  useEffect(() => {
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

  const handleDelete = async (uuid: string) => {
    await baseSubmitHandler(uuid, async id => {
      const data = await deleteBankAccountMutation.mutateAsync({
        request: { employeeId, bankAccountUuid: id },
      })
      onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, data)
    })
  }

  return {
    paymentMethod,
    bankAccounts,
    deletePendingBankAccountUuid: deleteBankAccountMutation.isPending
      ? deleteBankAccountMutation.variables.request.bankAccountUuid
      : undefined,
    handleDelete,
  }
}
