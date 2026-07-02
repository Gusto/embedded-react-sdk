import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ContractorPaymentMethod } from '@gusto/embedded-api-v-2026-02-01/models/components/contractorpaymentmethod'
import { useContractorPaymentMethodGet } from '@gusto/embedded-api-v-2026-02-01/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/contractorPaymentMethodUpdate'
import {
  createContractorPaymentMethodSchema,
  type ContractorPaymentMethodFormData,
  type ContractorPaymentMethodFormOutputs,
  type ContractorPaymentMethodFormType,
  PAYMENT_METHOD_TYPES,
} from './contractorPaymentMethodSchema'
import type { TypeFieldProps } from './fields'
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
import { PAYMENT_METHODS } from '@/shared/constants'

/**
 * Props for {@link useContractorPaymentMethodForm}.
 *
 * @public
 */
export interface UseContractorPaymentMethodFormProps {
  /** Contractor whose payment method is being edited. */
  contractorId: string
  /** Pre-fill form values. Server data (the current payment method) is used when no override is supplied. */
  defaultValues?: Partial<ContractorPaymentMethodFormData>
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Field components exposed by {@link useContractorPaymentMethodForm} on `form.Fields`.
 *
 * @public
 */
export interface ContractorPaymentMethodFormFields {
  /**
   * Radio group bound to `type`. Selects whether the contractor is paid by
   * Direct Deposit or Check. Supply `getOptionLabel` to translate the option
   * labels.
   */
  Type: ComponentType<TypeFieldProps>
}

/**
 * Ready-state return value of {@link useContractorPaymentMethodForm}.
 *
 * @public
 */
export interface UseContractorPaymentMethodFormReady extends BaseFormHookReady<
  FieldsMetadata,
  ContractorPaymentMethodFormData,
  ContractorPaymentMethodFormFields
> {
  /** The contractor's current payment method, loaded from the API. */
  data: {
    paymentMethod: ContractorPaymentMethod
  }
  /**
   * `isPending` reflects the in-flight update mutation; `mode` is always
   * `'update'`. `isDirectDeposit` reflects the currently selected type so a
   * composing component can render bank fields and decide whether to submit the
   * bank-account form.
   */
  status: { isPending: boolean; mode: 'update'; isDirectDeposit: boolean }
  /** Submit the form. Returns the updated payment method on success or `undefined` on validation/mutation failure. */
  actions: {
    onSubmit: () => Promise<HookSubmitResult<ContractorPaymentMethod> | undefined>
  }
}

/**
 * Headless React Hook Form hook for managing a contractor's payment method type.
 *
 * @remarks
 * Owns only the payment method `type` selection (Direct Deposit or Check) and,
 * on submit, updates the contractor's payment method via `PUT`. Always operates
 * in update mode — every contractor has a payment method, defaulting to Check.
 *
 * The bank account itself is managed by the separate `useContractorBankAccountForm`
 * hook. On the Direct Deposit path the bank-account `POST` updates the payment
 * method as a server side-effect, so a composing component submits the bank form
 * instead of this hook; this hook's `onSubmit` is used for the Check path.
 * `status.isDirectDeposit` lets the component drive that branching.
 *
 * @param props - See {@link UseContractorPaymentMethodFormProps}.
 * @returns A loading-state result while data loads, or a {@link UseContractorPaymentMethodFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorPaymentMethodForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function PaymentTypeScreen({ contractorId }: { contractorId: string }) {
 *   const paymentMethod = useContractorPaymentMethodForm({ contractorId })
 *
 *   if (paymentMethod.isLoading) return null
 *   const { Fields } = paymentMethod.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={paymentMethod}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void paymentMethod.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.Type label="Select payment method" />
 *         <button type="submit" disabled={paymentMethod.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useContractorPaymentMethodForm({
  contractorId,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseContractorPaymentMethodFormProps): HookLoadingResult | UseContractorPaymentMethodFormReady {
  const paymentMethodQuery = useContractorPaymentMethodGet({ contractorUuid: contractorId })
  const paymentMethod = paymentMethodQuery.data?.contractorPaymentMethod

  const [schema, metadataConfig] = useMemo(() => createContractorPaymentMethodSchema(), [])

  const resolvedDefaults: ContractorPaymentMethodFormData = useMemo(
    () => ({
      type: (partnerDefaults?.type ??
        paymentMethod?.type ??
        PAYMENT_METHODS.check) as ContractorPaymentMethodFormType,
    }),
    [partnerDefaults, paymentMethod],
  )

  const formMethods = useForm<
    ContractorPaymentMethodFormData,
    unknown,
    ContractorPaymentMethodFormOutputs
  >({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const watchedType = useWatch({ control: formMethods.control, name: 'type' })
  const isDirectDeposit = watchedType === PAYMENT_METHODS.directDeposit

  const updatePaymentMethodMutation = useContractorPaymentMethodUpdateMutation()
  const isPending = updatePaymentMethodMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('ContractorPaymentMethodForm')

  const errorHandling = composeErrorHandler([paymentMethodQuery], {
    submitError,
    setSubmitError,
  })

  const typeOptions = PAYMENT_METHOD_TYPES.map(value => ({ value, label: value }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    ...baseMetadata,
    type: withOptions<ContractorPaymentMethodFormType>(baseMetadata.type, typeOptions, [
      ...PAYMENT_METHOD_TYPES,
    ]),
  }

  const onSubmit = async (): Promise<HookSubmitResult<ContractorPaymentMethod> | undefined> => {
    if (!paymentMethod) {
      throw new SDKInternalError('Cannot submit payment method form before data is loaded')
    }
    const version = paymentMethod.version as string
    let submitResult: HookSubmitResult<ContractorPaymentMethod> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ContractorPaymentMethodFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const updateResponse = await updatePaymentMethodMutation.mutateAsync({
              request: {
                contractorUuid: contractorId,
                requestBody: { type: payload.type, version },
              },
            })

            if (!updateResponse.contractorPaymentMethod) {
              throw new SDKInternalError('Payment method update failed')
            }

            submitResult = { mode: 'update' as const, data: updateResponse.contractorPaymentMethod }
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
    status: { isPending, mode: 'update' as const, isDirectDeposit },
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
 * Return type of {@link useContractorPaymentMethodForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UseContractorPaymentMethodFormResult =
  HookLoadingResult | UseContractorPaymentMethodFormReady

/**
 * Per-field metadata exposed on `form.fieldsMetadata` for {@link useContractorPaymentMethodForm}.
 *
 * @public
 */
export type ContractorPaymentMethodFieldsMetadata =
  UseContractorPaymentMethodFormReady['form']['fieldsMetadata']
