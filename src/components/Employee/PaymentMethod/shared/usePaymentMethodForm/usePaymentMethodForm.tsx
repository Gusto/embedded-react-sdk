import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeePaymentMethod } from '@gusto/embedded-api-v-2026-02-01/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodGet } from '@gusto/embedded-api-v-2026-02-01/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/employeePaymentMethodUpdate'
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

/**
 * Props for {@link usePaymentMethodForm}.
 *
 * @public
 */
export interface UsePaymentMethodFormProps {
  /** Employee whose payment method is being edited. */
  employeeId: string
  /** Override optional fields to be required. Reserved for future schema expansion — `type` is always required and always has a default. */
  optionalFieldsToRequire?: PaymentMethodFormOptionalFieldsToRequire
  /** Pre-fill form values. Server data (the current payment method) is used when no override is supplied. */
  defaultValues?: Partial<PaymentMethodFormData>
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Field components exposed by {@link usePaymentMethodForm} on `form.Fields`.
 *
 * @public
 */
export interface PaymentMethodFormFields {
  /** Bound to `type`. */
  Type: typeof TypeField
}

/**
 * Ready-state return value of {@link usePaymentMethodForm}.
 *
 * @public
 */
export interface UsePaymentMethodFormReady extends BaseFormHookReady<
  FieldsMetadata,
  PaymentMethodFormData,
  PaymentMethodFormFields
> {
  /** The employee's current payment method, loaded from the API. */
  data: {
    paymentMethod: EmployeePaymentMethod
  }
  /** `isPending` reflects the in-flight update mutation; `mode` is always `'update'`. */
  status: { isPending: boolean; mode: 'update' }
  /** Submit the form. Returns the updated payment method on success or `undefined` on validation/mutation failure. */
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeePaymentMethod> | undefined>
  }
}

/**
 * Headless React Hook Form hook for updating an employee's payment method.
 *
 * @remarks
 * Switches between Direct Deposit and Check. Always operates in update mode —
 * every employee has a payment method, defaulting to Check. Switching to Check
 * sends a minimal request body; switching to or staying on Direct Deposit
 * preserves the existing splits and version so split allocations are not lost
 * when only the type changes.
 *
 * @param props - See {@link UsePaymentMethodFormProps}.
 * @returns A loading-state result while the current payment method is loading, or a {@link UsePaymentMethodFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   usePaymentMethodForm,
 *   SDKFormProvider,
 *   PAYMENT_METHODS,
 *   type PaymentMethodType,
 * } from '@gusto/embedded-react-sdk'
 *
 * function PaymentMethodScreen({ employeeId }: { employeeId: string }) {
 *   const paymentMethodForm = usePaymentMethodForm({ employeeId })
 *
 *   if (paymentMethodForm.isLoading) return null
 *   const { Fields } = paymentMethodForm.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={paymentMethodForm}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void paymentMethodForm.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.Type
 *           label="Select payment method"
 *           getOptionLabel={(value: PaymentMethodType) =>
 *             value === PAYMENT_METHODS.directDeposit ? 'Direct Deposit' : 'Check'
 *           }
 *         />
 *         <button type="submit" disabled={paymentMethodForm.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
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

/**
 * Return type of {@link usePaymentMethodForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UsePaymentMethodFormResult = HookLoadingResult | UsePaymentMethodFormReady

/**
 * Per-field metadata exposed on `form.fieldsMetadata` for {@link usePaymentMethodForm}.
 *
 * @public
 */
export type PaymentMethodFormFieldsMetadata = UsePaymentMethodFormReady['form']['fieldsMetadata']
