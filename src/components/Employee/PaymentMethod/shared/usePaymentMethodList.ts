import type { EmployeeBankAccount } from '@gusto/embedded-api-v-2026-06-15/models/components/employeebankaccount'
import type { EmployeePaymentMethod } from '@gusto/embedded-api-v-2026-06-15/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodDeleteBankAccountMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeePaymentMethodDeleteBankAccount'
import { useEmployeePaymentMethodsGetBankAccounts } from '@gusto/embedded-api-v-2026-06-15/react-query/employeePaymentMethodsGetBankAccounts'
import { useEmployeePaymentMethodGet } from '@gusto/embedded-api-v-2026-06-15/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeePaymentMethodUpdate'
import { useEffect, useRef } from 'react'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'
import { SPLIT_BY } from '@/shared/constants'

/** @internal */
export interface UsePaymentMethodListParams {
  /** Employee whose payment method and bank accounts to load. */
  employeeId: string
}

/** @internal */
export interface UsePaymentMethodListReady extends BaseHookReady<
  { paymentMethod: EmployeePaymentMethod; bankAccounts: EmployeeBankAccount[] },
  { isFetching: boolean; isPending: boolean; deletePendingBankAccountUuid?: string }
> {
  /** Delete a bank account by UUID. Returns the delete response on success or `undefined` on failure. */
  actions: {
    onDelete: (bankAccountUuid: string) => Promise<HookSubmitResult<unknown> | undefined>
  }
}

/** @internal */
export type UsePaymentMethodListResult = HookLoadingResult | UsePaymentMethodListReady

/** @internal */
export function usePaymentMethodList({
  employeeId,
}: UsePaymentMethodListParams): UsePaymentMethodListResult {
  const paymentMethodQuery = useEmployeePaymentMethodGet({ employeeId })
  const bankAccountsQuery = useEmployeePaymentMethodsGetBankAccounts({ employeeId })

  const paymentMethod = paymentMethodQuery.data?.employeePaymentMethod
  const bankAccounts = bankAccountsQuery.data?.employeeBankAccounts

  const deleteBankAccountMutation = useEmployeePaymentMethodDeleteBankAccountMutation()
  const { mutateAsync: mutatePaymentMethod } = useEmployeePaymentMethodUpdateMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('PaymentMethodList')

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

  const errorHandling = composeErrorHandler([paymentMethodQuery, bankAccountsQuery], {
    submitError,
    setSubmitError,
  })

  const onDelete = async (
    bankAccountUuid: string,
  ): Promise<HookSubmitResult<unknown> | undefined> => {
    let submitResult: HookSubmitResult<unknown> | undefined
    await baseSubmitHandler(bankAccountUuid, async uuid => {
      const data = await deleteBankAccountMutation.mutateAsync({
        request: { employeeId, bankAccountUuid: uuid },
      })
      submitResult = { mode: 'update', data }
    })
    return submitResult
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
    status: {
      isFetching: paymentMethodQuery.isFetching || bankAccountsQuery.isFetching,
      isPending: deleteBankAccountMutation.isPending,
      deletePendingBankAccountUuid,
    },
    actions: { onDelete },
    errorHandling,
  }
}
