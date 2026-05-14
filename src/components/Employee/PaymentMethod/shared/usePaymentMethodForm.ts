import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdate'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, type DefaultValues, type SubmitHandler } from 'react-hook-form'
import { CombinedSchema, type CombinedSchemaInputs } from './paymentMethodSchema'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents, PAYMENT_METHODS, SPLIT_BY, type EventType } from '@/shared/constants'

export interface UsePaymentMethodFormParams {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UsePaymentMethodFormResult {
  paymentMethod: EmployeePaymentMethod
  formMethods: ReturnType<typeof useForm<CombinedSchemaInputs>>
  isPending: boolean
  handlePaymentMethodTypeSubmit: SubmitHandler<CombinedSchemaInputs>
  resetToDefaults: () => void
}

export function usePaymentMethodForm({
  employeeId,
  onEvent,
}: UsePaymentMethodFormParams): UsePaymentMethodFormResult {
  const {
    data: { employeePaymentMethod },
  } = useEmployeePaymentMethodGetSuspense({ employeeId })
  const paymentMethod = employeePaymentMethod!

  const paymentMethodMutation = useEmployeePaymentMethodUpdateMutation()

  const defaultFormValues = useMemo(
    () => ({
      type: (paymentMethod.type ?? 'Direct Deposit') as CombinedSchemaInputs['type'],
      isSplit: false as const,
      hasBankPayload: false as const,
    }),
    [paymentMethod.type],
  )

  const formMethods = useForm<CombinedSchemaInputs>({
    resolver: zodResolver(CombinedSchema),
    defaultValues: defaultFormValues as DefaultValues<CombinedSchemaInputs>,
  })

  const { reset: resetForm } = formMethods

  useEffect(() => {
    resetForm(defaultFormValues as DefaultValues<CombinedSchemaInputs>)
  }, [paymentMethod, resetForm]) // eslint-disable-line react-hooks/exhaustive-deps

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

    onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, response)
    onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)
  }

  const resetToDefaults = () => {
    resetForm(defaultFormValues as DefaultValues<CombinedSchemaInputs>)
  }

  return {
    paymentMethod,
    formMethods,
    isPending: paymentMethodMutation.isPending,
    handlePaymentMethodTypeSubmit,
    resetToDefaults,
  }
}
