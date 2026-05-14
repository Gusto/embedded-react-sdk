import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodGet } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodsGetBankAccounts } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdate'
import {
  SPLIT_BY_VALUES,
  type SplitByValue,
  type SplitPaymentsFormData,
  type SplitPaymentsFormOptionalFieldsToRequire,
  type SplitPaymentsFormOutputs,
  createSplitPaymentsFormSchema,
} from './useSplitPaymentsFormSchema'
import { SplitByField } from './fields'
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
  SplitBy: typeof SplitByField
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
    splitBy: SplitByValue
    /** Live sum of `splitAmount` values; useful for displaying the current total in Percentage mode. */
    percentageTotal: number
  }
  status: { isPending: boolean; mode: 'update' }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeePaymentMethod> | undefined>
    /** Reorders splits in Amount mode by updating their `priority` values; the last item becomes the remainder. */
    reorderSplits: (newOrder: number[]) => void
    /** Programmatic value update for a single split's amount. */
    updateSplitAmount: (uuid: string, value: number | null) => void
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
    let lastSplitUuid = ''
    splits.forEach(split => {
      splitAmount[split.uuid] = isAmountSplit
        ? centsToDollars(split.splitAmount)
        : split.splitAmount
      priority[split.uuid] = split.priority
      lastSplitUuid = split.uuid
    })
    const remainder = isAmountSplit
      ? (splits.find(s => s.splitAmount === null)?.uuid ?? lastSplitUuid)
      : ''
    return {
      splitBy: (paymentMethod?.splitBy ?? SPLIT_BY.percentage) as SplitByValue,
      splitAmount,
      priority,
      remainder,
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
    return Object.values(watchedSplitAmount).reduce<number>((acc, v) => acc + (v ?? 0), 0)
  }, [watchedSplitBy, watchedSplitAmount])

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

  const updateSplitAmount = useCallback(
    (uuid: string, value: number | null) => {
      setValue(`splitAmount.${uuid}`, value)
    },
    [setValue],
  )

  const reorderSplits = useCallback(
    (newOrder: number[]) => {
      const currentSplits = splitsRef.current
      const newPriorities = newOrder.reduce<Record<string, number>>((acc, splitIndex, position) => {
        const split = currentSplits[splitIndex]
        if (split) acc[split.uuid] = position + 1
        return acc
      }, {})
      const lastSplitIndex = newOrder[newOrder.length - 1]
      if (lastSplitIndex === undefined) return
      const lastSplit = currentSplits[lastSplitIndex]
      if (!lastSplit) return
      setValue('priority', newPriorities)
      const previousRemainder = remainderIdRef.current
      if (previousRemainder && previousRemainder !== lastSplit.uuid) {
        resetField(`splitAmount.${previousRemainder}`)
        setValue(`splitAmount.${previousRemainder}`, 0)
      }
      setValue(`splitAmount.${lastSplit.uuid}`, null)
    },
    [setValue, resetField],
  )

  const splitByOptions = SPLIT_BY_VALUES.map(value => ({ value, label: value }))
  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    splitBy: withOptions<SplitByValue>(baseMetadata.splitBy, splitByOptions, [...SPLIT_BY_VALUES]),
    splitAmount: baseMetadata.splitAmount,
    priority: baseMetadata.priority,
    remainder: baseMetadata.remainder,
  }

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
      splitBy: watchedSplitBy as SplitByValue,
      percentageTotal,
    },
    status: { isPending, mode: 'update' as const },
    actions: { onSubmit, reorderSplits, updateSplitAmount },
    errorHandling,
    form: {
      Fields: { SplitBy: SplitByField },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UseSplitPaymentsFormResult = HookLoadingResult | UseSplitPaymentsFormReady
export type SplitPaymentsFormFieldsMetadata = UseSplitPaymentsFormReady['form']['fieldsMetadata']
export type SplitPaymentsFormFieldsType = UseSplitPaymentsFormReady['form']['Fields']
