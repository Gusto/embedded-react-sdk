import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeePaymentMethod } from '@gusto/embedded-api-v-2025-11-15/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodGet } from '@gusto/embedded-api-v-2025-11-15/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/employeePaymentMethodUpdate'
import {
  PAYMENT_METHOD_TYPES,
  type PaymentMethodFormData,
  type PaymentMethodFormOptionalFieldsToRequire,
  type PaymentMethodFormOutputs,
  type PaymentMethodType,
  createPaymentMethodFormSchema,
} from './usePaymentMethodFormSchema'
import { TypeField } from './fields'
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
import { PAYMENT_METHODS, SPLIT_BY } from '@/shared/constants'

export interface UsePaymentMethodFormProps {
  employeeId: string
  optionalFieldsToRequire?: PaymentMethodFormOptionalFieldsToRequire
  defaultValues?: Partial<PaymentMethodFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export interface PaymentMethodFormFields {
  Type: typeof TypeField
}

export interface UsePaymentMethodFormReady extends BaseFormHookReady<
  FieldsMetadata,
  PaymentMethodFormData,
  PaymentMethodFormFields
> {
  data: {
    paymentMethod: EmployeePaymentMethod
  }
  status: { isPending: boolean; mode: 'update' }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeePaymentMethod> | undefined>
  }
}

export function usePaymentMethodForm({
  employeeId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UsePaymentMethodFormProps): HookLoadingResult | UsePaymentMethodFormReady {
  const paymentMethodQuery = useEmployeePaymentMethodGet({ employeeId })
  const paymentMethod = paymentMethodQuery.data?.employeePaymentMethod

  const [schema, metadataConfig] = useMemo(
    () => createPaymentMethodFormSchema({ optionalFieldsToRequire }),
    [optionalFieldsToRequire],
  )

  const resolvedDefaults: PaymentMethodFormData = useMemo(
    () => ({
      type: (partnerDefaults?.type ??
        paymentMethod?.type ??
        PAYMENT_METHODS.directDeposit) as PaymentMethodType,
    }),
    [partnerDefaults, paymentMethod],
  )

  const formMethods = useForm<PaymentMethodFormData, unknown, PaymentMethodFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const updateMutation = useEmployeePaymentMethodUpdateMutation()
  const isPending = updateMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('PaymentMethodForm')

  const errorHandling = composeErrorHandler([paymentMethodQuery], {
    submitError,
    setSubmitError,
  })

  const typeOptions = PAYMENT_METHOD_TYPES.map(value => ({ value, label: value }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    type: withOptions<PaymentMethodType>(baseMetadata.type, typeOptions, [...PAYMENT_METHOD_TYPES]),
  }

  const onSubmit = async (): Promise<HookSubmitResult<EmployeePaymentMethod> | undefined> => {
    if (!paymentMethod) {
      throw new SDKInternalError('Cannot submit payment method form before data is loaded')
    }
    const currentPaymentMethod = paymentMethod
    let submitResult: HookSubmitResult<EmployeePaymentMethod> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: PaymentMethodFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const version = currentPaymentMethod.version as string
            const body =
              payload.type === PAYMENT_METHODS.check
                ? { version }
                : {
                    ...currentPaymentMethod,
                    version,
                    splitBy: currentPaymentMethod.splitBy ?? SPLIT_BY.percentage,
                    splits: currentPaymentMethod.splits ?? [],
                  }

            const response = await updateMutation.mutateAsync({
              request: { employeeId, requestBody: { ...body, type: payload.type } },
            })

            if (!response.employeePaymentMethod) {
              throw new SDKInternalError('Payment method update failed')
            }

            submitResult = { mode: 'update' as const, data: response.employeePaymentMethod }
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

  if (paymentMethodQuery.isLoading || !paymentMethod) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: { paymentMethod },
    status: { isPending, mode: 'update' as const },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Type: TypeField,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UsePaymentMethodFormResult = HookLoadingResult | UsePaymentMethodFormReady
export type PaymentMethodFormFieldsMetadata = UsePaymentMethodFormReady['form']['fieldsMetadata']
export type PaymentMethodFormFieldsType = UsePaymentMethodFormReady['form']['Fields']
