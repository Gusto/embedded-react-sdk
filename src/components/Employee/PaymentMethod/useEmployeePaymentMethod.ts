import { zodResolver } from '@hookform/resolvers/zod'
import { useEmployeePaymentMethodCreateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodCreate'
import { useEmployeePaymentMethodDeleteBankAccountMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodDeleteBankAccount'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useEmployeePaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateBankAccountMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdateBankAccount'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdate'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm, type DefaultValues, type SubmitHandler } from 'react-hook-form'
import {
  CombinedSchema,
  type CombinedSchemaInputs,
  type CombinedSchemaOutputs,
  type MODE,
} from './usePaymentMethod'
import { useBase } from '@/components/Base'
import { componentEvents, PAYMENT_METHODS, SPLIT_BY } from '@/shared/constants'
import { centsToDollars, dollarsToCents } from '@/helpers/currencyHelpers'

interface UseEmployeePaymentMethodProps {
  employeeId: string
  isAdmin?: boolean
}

export function useEmployeePaymentMethod({
  employeeId,
  isAdmin = false,
}: UseEmployeePaymentMethodProps) {
  const { baseSubmitHandler, onEvent } = useBase()
  const queryClient = useQueryClient()

  const {
    data: { employeePaymentMethod },
  } = useEmployeePaymentMethodGetSuspense({ employeeId })
  const paymentMethod = employeePaymentMethod!

  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const bankAccounts = bankAccountsList.employeeBankAccountList!

  const paymentMethodMutation = useEmployeePaymentMethodUpdateMutation()
  const deleteBankAccountMutation = useEmployeePaymentMethodDeleteBankAccountMutation()
  const addBankAccountMutation = useEmployeePaymentMethodCreateMutation()
  const updateBankAccountMutation = useEmployeePaymentMethodUpdateBankAccountMutation()

  const [mode, setMode] = useState<MODE>(bankAccounts.length < 1 ? 'INITIAL' : 'LIST')
  if (mode !== 'INITIAL' && bankAccounts.length < 1) {
    setMode('INITIAL')
  }

  const baseDefaultValues: Partial<CombinedSchemaOutputs> = useMemo(() => {
    return {
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
    } as Partial<CombinedSchemaOutputs>
  }, [])

  const defaultValues: CombinedSchemaOutputs = useMemo(() => {
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
    defaultValues: defaultValues as DefaultValues<CombinedSchemaInputs>,
  })

  const watchedType = formMethods.watch('type')

  const { reset: resetForm } = formMethods
  const { mutateAsync: mutatePaymentMethod } = paymentMethodMutation

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
  }, [employeeId, paymentMethod, queryClient, mutatePaymentMethod])

  useEffect(() => {
    resetForm(defaultValues)
  }, [bankAccounts.length, paymentMethod, defaultValues, resetForm])

  const onSubmit: SubmitHandler<CombinedSchemaInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { type } = payload
      if (
        type === 'Direct Deposit' &&
        payload.hasBankPayload &&
        (mode === 'ADD' || mode === 'INITIAL')
      ) {
        const bankAccountResponse = await addBankAccountMutation.mutateAsync({
          request: {
            employeeId,
            requestBody: {
              name: payload.name,
              routingNumber: payload.routingNumber,
              accountNumber: payload.accountNumber,
              accountType: payload.accountType,
            },
          },
        })

        onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, bankAccountResponse)
      } else {
        const body =
          type === PAYMENT_METHODS.check
            ? { version: paymentMethod.version as string }
            : {
                ...paymentMethod,
                version: paymentMethod.version as string,
                splitBy: payload.isSplit
                  ? payload.splitBy
                  : (paymentMethod.splitBy ?? SPLIT_BY.percentage),
                splits:
                  payload.isSplit && paymentMethod.splits
                    ? paymentMethod.splits.map(split => {
                        const splitAmountValue = payload.splitAmount[split.uuid] ?? null
                        const isAmountSplit = payload.splitBy === SPLIT_BY.amount
                        return {
                          ...split,
                          splitAmount: isAmountSplit
                            ? dollarsToCents(splitAmountValue)
                            : splitAmountValue,
                          priority: payload.priority[split.uuid],
                        }
                      })
                    : (paymentMethod.splits ?? []),
              }
        const paymentMethodResponse = await paymentMethodMutation.mutateAsync({
          request: { employeeId, requestBody: { ...body, type } },
        })
        onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, paymentMethodResponse)
      }
      formMethods.setValue('isSplit', false)
      formMethods.setValue('hasBankPayload', false)
      if (mode === 'LIST' || type === PAYMENT_METHODS.check) {
        onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)
      } else {
        setMode('LIST')
      }
    })
  }

  const handleDelete = async (uuid: string) => {
    const data = await deleteBankAccountMutation.mutateAsync({
      request: { employeeId, bankAccountUuid: uuid },
    })
    onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, data)
  }

  const handleAdd = () => {
    setMode('ADD')
    resetForm(defaultValues)
  }

  const handleCancel = () => {
    setMode('LIST')
    resetForm(defaultValues)
  }

  const handleSplit = () => {
    setMode('SPLIT')
  }

  const isPending =
    deleteBankAccountMutation.isPending ||
    paymentMethodMutation.isPending ||
    addBankAccountMutation.isPending ||
    updateBankAccountMutation.isPending

  return {
    data: {
      bankAccounts,
      paymentMethod,
      watchedType,
    },
    actions: {
      onSubmit: formMethods.handleSubmit(onSubmit),
      handleDelete,
      handleAdd,
      handleCancel,
      handleSplit,
    },
    meta: {
      isPending,
      mode,
      isAdmin,
    },
    form: formMethods,
  }
}
