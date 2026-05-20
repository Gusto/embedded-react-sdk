import type { ComponentType } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm, useFormState, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodGet } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodsGetBankAccounts } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdate'
import {
  PERCENTAGE_TOTAL_PATH,
  SPLIT_BY_VALUES,
  SplitPaymentsFormErrorCodes,
  type SplitByValue,
  type SplitPaymentsFormData,
  type SplitPaymentsFormOptionalFieldsToRequire,
  type SplitPaymentsFormOutputs,
  createSplitPaymentsFormSchema,
} from './useSplitPaymentsFormSchema'
import { SplitByField, type SplitByFieldProps } from './fields'
import { buildSplitFieldEntries, type SplitFieldEntry } from './splitFieldFactory'
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
import { centsToDollars, dollarsToCents } from '@/helpers/currencyHelpers'
import { PAYMENT_METHODS, SPLIT_BY } from '@/shared/constants'

export interface WorkingSplit {
  uuid: string
  name: string | null
  hiddenAccountNumber: string | null
  splitAmount: number | null
  priority: number
}

export interface UseSplitPaymentsFormProps {
  employeeId: string
  optionalFieldsToRequire?: SplitPaymentsFormOptionalFieldsToRequire
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export interface SplitPaymentsFormFields {
  SplitBy: ComponentType<SplitByFieldProps>
  splits: SplitFieldEntry[]
}

export interface UseSplitPaymentsFormReady extends BaseFormHookReady<
  FieldsMetadata,
  SplitPaymentsFormData,
  SplitPaymentsFormFields
> {
  data: {
    paymentMethod: EmployeePaymentMethod
    bankAccounts: EmployeeBankAccount[]
    splits: WorkingSplit[]
    /** UUID of the split that absorbs the remainder in Amount mode (always the last by priority). */
    remainderId: string
  }
  status: {
    isPending: boolean
    mode: 'update'
    /** Current `splitBy` value, reactively tracked. */
    splitBy: SplitByValue
    /** Live sum of `splitAmount` values; useful for displaying the current total in Percentage mode. */
    percentageTotal: number
    /**
     * Mirrors the schema-emitted `PERCENTAGE_TOTAL_MISMATCH` error at the
     * synthetic form path. Tracks `formState.errors` directly and follows
     * the standard react-hook-form validation lifecycle: with the default
     * `validationMode: 'onSubmit'`, becomes `true` after the first failed
     * Save attempt and clears live as the user corrects the total. Only
     * surfaces in Percentage mode.
     */
    hasPercentageImbalance: boolean
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeePaymentMethod> | undefined>
    /**
     * Reorder splits by uuid (Amount mode). Pass the ordered list of split
     * uuids; the last uuid becomes the remainder. The hook writes the new
     * priority map and re-anchors the remainder's `splitAmount` to `null`
     * (clearing the previous remainder to `0`).
     */
    reorderSplits: (orderedUuids: string[]) => void
  }
}

const buildWorkingSplits = (
  paymentMethod: EmployeePaymentMethod,
  bankAccounts: EmployeeBankAccount[],
): WorkingSplit[] => {
  if (paymentMethod.splits && paymentMethod.splits.length > 0) {
    return paymentMethod.splits.map(split => ({
      uuid: split.uuid,
      name: split.name ?? null,
      hiddenAccountNumber: split.hiddenAccountNumber ?? null,
      splitAmount: split.splitAmount ?? null,
      priority: split.priority ?? 0,
    }))
  }
  return bankAccounts.map((account, index) => ({
    uuid: account.uuid,
    name: account.name ?? null,
    hiddenAccountNumber: account.hiddenAccountNumber ?? null,
    splitAmount: null,
    priority: index + 1,
  }))
}

export function useSplitPaymentsForm({
  employeeId,
  optionalFieldsToRequire,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseSplitPaymentsFormProps): HookLoadingResult | UseSplitPaymentsFormReady {
  const paymentMethodQuery = useEmployeePaymentMethodGet({ employeeId })
  const bankAccountsQuery = useEmployeePaymentMethodsGetBankAccounts({ employeeId })

  const paymentMethod = paymentMethodQuery.data?.employeePaymentMethod
  const bankAccounts = bankAccountsQuery.data?.employeeBankAccounts

  const splits = useMemo<WorkingSplit[]>(
    () => (paymentMethod && bankAccounts ? buildWorkingSplits(paymentMethod, bankAccounts) : []),
    [paymentMethod, bankAccounts],
  )

  const [schema, metadataConfig] = useMemo(
    () => createSplitPaymentsFormSchema({ optionalFieldsToRequire }),
    [optionalFieldsToRequire],
  )

  const resolvedDefaults: SplitPaymentsFormData = useMemo(() => {
    const isAmountSplit = paymentMethod?.splitBy === SPLIT_BY.amount
    const splitAmount: Record<string, number | null> = {}
    const priority: Record<string, number> = {}
    splits.forEach(split => {
      splitAmount[split.uuid] = isAmountSplit
        ? centsToDollars(split.splitAmount)
        : split.splitAmount
      priority[split.uuid] = split.priority
    })
    return {
      splitBy: (paymentMethod?.splitBy ?? SPLIT_BY.percentage) as SplitByValue,
      splitAmount,
      priority,
    }
  }, [paymentMethod, splits])

  const formMethods = useForm<SplitPaymentsFormData, unknown, SplitPaymentsFormOutputs>({
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
  } = useBaseSubmit('SplitPaymentsForm')

  const errorHandling = composeErrorHandler([paymentMethodQuery, bankAccountsQuery], {
    submitError,
    setSubmitError,
  })

  const watchedSplitBy = useWatch({ control: formMethods.control, name: 'splitBy' })
  const watchedPriority = useWatch({ control: formMethods.control, name: 'priority' })
  const watchedSplitAmount = useWatch({ control: formMethods.control, name: 'splitAmount' })

  const percentageTotal = useMemo(() => {
    if (watchedSplitBy !== SPLIT_BY.percentage) return 0
    return Object.values(watchedSplitAmount).reduce<number>(
      (acc, v) => acc + (typeof v === 'number' && Number.isFinite(v) ? v : 0),
      0,
    )
  }, [watchedSplitBy, watchedSplitAmount])

  // Subscribe to the schema-emitted imbalance error. The schema places it at
  // a synthetic path (`PERCENTAGE_TOTAL_PATH`) so it does not collide with
  // per-uuid `splitAmount.<uuid>` errors. Following the standard validation
  // lifecycle means `validationMode` (onSubmit / onChange / onBlur / ...)
  // controls when the alert can appear. We subscribe to the full errors map
  // because `name` only tracks registered field paths and our synthetic key
  // is not a registered field. The derivation is also gated on Percentage
  // mode so a stale error from a prior Percentage submit can't leak into
  // Amount mode after a toggle.
  const { errors: validationErrors, isSubmitted } = useFormState({
    control: formMethods.control,
  })
  const hasPercentageImbalance =
    watchedSplitBy === SPLIT_BY.percentage &&
    (validationErrors as Record<string, { message?: string } | undefined>)[PERCENTAGE_TOTAL_PATH]
      ?.message === SplitPaymentsFormErrorCodes.PERCENTAGE_TOTAL_MISMATCH

  // Re-sync the synthetic PERCENTAGE_TOTAL_PATH error whenever any
  // `splitAmount` value changes (in Percentage mode, after the first
  // submit attempt). RHF's per-field reValidate after a failed submit
  // scopes the resolver merge to the changed field's name, so an error
  // at our form-level synthetic path is otherwise left stuck once the
  // user has typed the total back to 100. Targeting the synthetic name
  // re-runs the resolver and lets RHF set/unset that single path through
  // its normal merge — preserving per-field error lifecycles unchanged.
  const { trigger } = formMethods
  useEffect(() => {
    if (!isSubmitted) return
    if (watchedSplitBy !== SPLIT_BY.percentage) return
    // `trigger`'s type is keyed to registered field paths, but the
    // synthetic `percentageTotal` resolves through RHF's get/set/unset
    // helpers at runtime — cast at the boundary to keep the contract
    // honest above.
    void trigger(PERCENTAGE_TOTAL_PATH as Parameters<typeof trigger>[0])
  }, [isSubmitted, watchedSplitBy, watchedSplitAmount, trigger])

  const remainderId = useMemo(() => {
    if (!Object.keys(watchedPriority).length) return ''
    return Object.entries(watchedPriority).reduce((maxId, [uuid, priority]) => {
      if (!maxId) return uuid
      const currentMax = watchedPriority[maxId] ?? 0
      return priority > currentMax ? uuid : maxId
    }, '')
  }, [watchedPriority])

  // Reset splitAmount values when the user toggles splitBy. Skip the first
  // post-load run so values loaded from `paymentMethod.splits` are preserved
  // on mount — only the user's explicit toggle should clear them.
  const splitsRef = useRef(splits)
  splitsRef.current = splits
  const remainderIdRef = useRef(remainderId)
  remainderIdRef.current = remainderId
  const previousSplitByRef = useRef<SplitByValue | null>(null)
  const { setValue, resetField } = formMethods

  useEffect(() => {
    if (!splitsRef.current.length) return
    if (previousSplitByRef.current === null) {
      previousSplitByRef.current = watchedSplitBy as SplitByValue
      return
    }
    if (previousSplitByRef.current === watchedSplitBy) return
    previousSplitByRef.current = watchedSplitBy as SplitByValue

    if (watchedSplitBy === SPLIT_BY.amount) {
      const newValues = splitsRef.current.reduce<Record<string, number | null>>((acc, curr) => {
        acc[curr.uuid] = curr.uuid === remainderIdRef.current ? null : 0
        return acc
      }, {})
      setValue('splitAmount', newValues)
    } else {
      const newValues = splitsRef.current.reduce<Record<string, number | null>>(
        (acc, curr, index) => {
          acc[curr.uuid] = index === 0 ? 100 : 0
          return acc
        },
        {},
      )
      setValue('splitAmount', newValues)
    }
  }, [watchedSplitBy, setValue])

  const reorderSplits = useCallback(
    (orderedUuids: string[]) => {
      const currentSplits = splitsRef.current
      const knownUuids = new Set(currentSplits.map(s => s.uuid))
      if (
        orderedUuids.length !== knownUuids.size ||
        !orderedUuids.every(uuid => knownUuids.has(uuid))
      ) {
        return
      }

      const newPriorities = orderedUuids.reduce<Record<string, number>>((acc, uuid, index) => {
        acc[uuid] = index + 1
        return acc
      }, {})
      const newRemainderId = orderedUuids[orderedUuids.length - 1]
      if (!newRemainderId) return

      setValue('priority', newPriorities)
      const previousRemainder = remainderIdRef.current
      if (previousRemainder && previousRemainder !== newRemainderId) {
        resetField(`splitAmount.${previousRemainder}`)
        setValue(`splitAmount.${previousRemainder}`, 0)
      }
      setValue(`splitAmount.${newRemainderId}`, null)
    },
    [setValue, resetField],
  )

  const splitByOptions = SPLIT_BY_VALUES.map(value => ({ value, label: value }))
  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const dynamicSplitMetadata = useMemo<FieldsMetadata>(() => {
    const entries: FieldsMetadata = {}
    const isAmountSplit = watchedSplitBy === SPLIT_BY.amount
    for (const split of splits) {
      const path = `splitAmount.${split.uuid}`
      const isRemainder = isAmountSplit && split.uuid === remainderId
      // Every split — including the remainder — is "required" from the
      // user's perspective: the remainder always carries a value at submit
      // (the API absorbs leftover). The form-state `null` is a modeling
      // detail, not a UX choice, so we don't surface it as "(optional)" on
      // the label. `isDisabled` already conveys the non-interactivity.
      entries[path] = {
        name: path,
        isRequired: true,
        isDisabled: isRemainder,
      }
    }
    return entries
  }, [splits, watchedSplitBy, remainderId])
  const fieldsMetadata: FieldsMetadata = {
    splitBy: withOptions<SplitByValue>(baseMetadata.splitBy, splitByOptions, [...SPLIT_BY_VALUES]),
    splitAmount: baseMetadata.splitAmount,
    priority: baseMetadata.priority,
    ...dynamicSplitMetadata,
  }

  const splitFieldEntries = useMemo(
    () =>
      buildSplitFieldEntries(
        splits.map(s => ({
          uuid: s.uuid,
          name: s.name,
          hiddenAccountNumber: s.hiddenAccountNumber,
        })),
      ),
    [splits],
  )

  const onSubmit = async (): Promise<HookSubmitResult<EmployeePaymentMethod> | undefined> => {
    if (!paymentMethod) {
      throw new SDKInternalError('Cannot submit split payments form before data is loaded')
    }
    const currentPaymentMethod = paymentMethod
    const currentSplits = splits
    let submitResult: HookSubmitResult<EmployeePaymentMethod> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: SplitPaymentsFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const isAmountSplit = payload.splitBy === SPLIT_BY.amount
            const body = {
              ...currentPaymentMethod,
              version: currentPaymentMethod.version as string,
              splitBy: payload.splitBy,
              splits: currentSplits.map(split => {
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

            const response = await updateMutation.mutateAsync({
              request: {
                employeeId,
                requestBody: { ...body, type: PAYMENT_METHODS.directDeposit },
              },
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

  if (
    paymentMethodQuery.isLoading ||
    bankAccountsQuery.isLoading ||
    !paymentMethod ||
    !bankAccounts
  ) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      paymentMethod,
      bankAccounts,
      splits,
      remainderId,
    },
    status: {
      isPending,
      mode: 'update' as const,
      splitBy: watchedSplitBy as SplitByValue,
      percentageTotal,
      hasPercentageImbalance,
    },
    actions: { onSubmit, reorderSplits },
    errorHandling,
    form: {
      Fields: { SplitBy: SplitByField, splits: splitFieldEntries },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UseSplitPaymentsFormResult = HookLoadingResult | UseSplitPaymentsFormReady
export type SplitPaymentsFormFieldsMetadata = UseSplitPaymentsFormReady['form']['fieldsMetadata']
export type SplitPaymentsFormFieldsType = UseSplitPaymentsFormReady['form']['Fields']
