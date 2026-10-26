import { useState } from 'react'
import type { ComponentType } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePayrollsGet } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import { WithholdingPayPeriod } from '@gusto/embedded-api/models/components/payrollupdate'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type {
  PayrollPrepared,
  PayrollShow,
} from '@gusto/embedded-api/models/components/unprocessedpayroll'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import {
  createTransitionConfigurationSchema,
  type TransitionConfigurationFormData,
  type TransitionConfigurationFormOutputs,
} from './transitionConfigurationSchema'
import { SkipRegularDeductionsField, type SkipRegularDeductionsFieldProps } from './fields'
import { PREPARE_QUERY_KEY } from '@/components/Payroll/PayrollConfiguration/usePayrollConfigurationData'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldMetadata,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'

/**
 * Configuration options for {@link useTransitionConfigurationForm}.
 *
 * @internal
 */
export interface UseTransitionConfigurationFormProps {
  /** The associated company identifier. */
  companyId: string
  /** The identifier of the existing transition payroll to configure. */
  payrollId: string
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Defaults to `true`. Set to `false` when composing with other forms. */
  shouldFocusError?: boolean
}

/**
 * Tax withholding settings for the transition payroll, as stored on the payroll.
 *
 * @internal
 */
export interface TransitionConfigurationTaxWithholding {
  /** Pay period frequency used to compute regular withholding. */
  withholdingPayPeriod: WithholdingPayPeriod
  /** `true` to withhold supplemental wages at the supplemental rate; `false` to use the regular rate. */
  fixedWithholdingRate: boolean
}

/**
 * Pre-bound field components exposed on `useTransitionConfigurationForm().form.Fields`.
 *
 * @internal
 */
export interface TransitionConfigurationFormFields {
  /**
   * Bound to `skipRegularDeductions`. Radio group whose entries are `false` (include regular
   * deductions and contributions) and `true` (skip them). Supply `getOptionLabel` to label each entry.
   */
  SkipRegularDeductions: ComponentType<SkipRegularDeductionsFieldProps>
}

/**
 * Ready-state shape returned by {@link useTransitionConfigurationForm} once the payroll has loaded.
 *
 * @internal
 */
export interface UseTransitionConfigurationFormReady extends BaseFormHookReady<
  TransitionConfigurationFieldsMetadata,
  TransitionConfigurationFormData,
  TransitionConfigurationFormFields
> {
  /** Loaded entities and live values backing the form. */
  data: {
    /** The transition payroll being configured. */
    payroll: PayrollShow
    /** The pay schedule the payroll belongs to; `null` when the payroll has none or it hasn't loaded. */
    paySchedule: PayScheduleShow | null
    /**
     * The payroll's payment date (`YYYY-MM-DD`). Read only: it isn't part of the form. Reflects the
     * most recent save, since saving can move it.
     */
    checkDate: string | null
    /** The current tax withholding settings, updated live as they change. */
    taxWithholding: TransitionConfigurationTaxWithholding
  }
  /** Submission status. `mode` is always `'update'` since the transition payroll already exists. */
  status: { isPending: boolean; mode: 'update' }
  /** Form actions. */
  actions: {
    /**
     * Validates the form, prepares the payroll, and saves the settings. Resolves to the updated
     * prepared payroll, or `undefined` when validation or a request failed.
     */
    onSubmit: () => Promise<HookSubmitResult<PayrollPrepared> | undefined>
    /** Replaces the tax withholding settings with `taxWithholding`. */
    setTaxWithholding: (taxWithholding: TransitionConfigurationTaxWithholding) => void
  }
}

/**
 * Discriminated union returned by {@link useTransitionConfigurationForm}.
 *
 * @internal
 */
export type UseTransitionConfigurationFormResult =
  HookLoadingResult | UseTransitionConfigurationFormReady

const FALLBACK_WITHHOLDING_PAY_PERIOD = WithholdingPayPeriod.EveryOtherWeek

const SKIP_REGULAR_DEDUCTIONS_VALUES = [false, true] as const
const SKIP_REGULAR_DEDUCTIONS_OPTIONS = SKIP_REGULAR_DEDUCTIONS_VALUES.map(value => ({
  value: String(value),
  label: String(value),
}))

const [transitionConfigurationSchema, transitionConfigurationMetadataConfig] =
  createTransitionConfigurationSchema()

type VersionedEmployeeCompensation = PayrollEmployeeCompensationsType & {
  employeeUuid: string
  version: string
}

function isVersionedEmployeeCompensation(
  compensation: PayrollEmployeeCompensationsType,
): compensation is VersionedEmployeeCompensation {
  return typeof compensation.employeeUuid === 'string' && typeof compensation.version === 'string'
}

/** @internal */
function buildTransitionConfigurationFieldsMetadata(
  base: Record<keyof TransitionConfigurationFormData, FieldMetadata>,
) {
  return {
    skipRegularDeductions: withOptions<boolean>(
      base.skipRegularDeductions,
      SKIP_REGULAR_DEDUCTIONS_OPTIONS,
      SKIP_REGULAR_DEDUCTIONS_VALUES,
    ),
    withholdingPayPeriod: base.withholdingPayPeriod,
    fixedWithholdingRate: base.fixedWithholdingRate,
  } satisfies FieldsMetadata
}

/**
 * Type of `form.fieldsMetadata` returned by {@link useTransitionConfigurationForm}.
 *
 * @internal
 */
export type TransitionConfigurationFieldsMetadata = ReturnType<
  typeof buildTransitionConfigurationFieldsMetadata
>

/**
 * Form hook for configuring the deduction and tax withholding settings of an existing transition payroll.
 *
 * @remarks
 * Loads the payroll and its pay schedule, then seeds the form from the payroll's saved settings: a
 * `null` `skipRegularDeductions` means deductions are included, a `null` `fixedWithholdingRate`
 * means the regular rate, and a `null` `withholdingPayPeriod` falls back to the pay schedule's
 * frequency. The pay period, pay schedule, and payment date are read only.
 *
 * On submit the hook prepares the payroll (without an employee list, which transition payrolls
 * reject), then updates it with the settings plus one prepared employee compensation's
 * `employeeUuid` and `version`, which the update endpoint requires. It never creates a payroll.
 * After a successful save it invalidates the cached prepared payroll used by
 * `PayrollConfiguration` so the next screen reads fresh versions and settings.
 *
 * @param props - See {@link UseTransitionConfigurationFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseTransitionConfigurationFormReady} once ready.
 * @internal
 */
export function useTransitionConfigurationForm({
  companyId,
  payrollId,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseTransitionConfigurationFormProps): UseTransitionConfigurationFormResult {
  const queryClient = useQueryClient()

  const payrollQuery = usePayrollsGet({ companyId, payrollId })
  const payroll = payrollQuery.data?.payrollShow
  const payScheduleUuid = payroll?.payPeriod?.payScheduleUuid ?? undefined

  const payScheduleQuery = usePaySchedulesGet(
    { companyId, payScheduleId: payScheduleUuid ?? '' },
    { enabled: !!payScheduleUuid },
  )
  const paySchedule = payScheduleQuery.data?.payScheduleShow ?? null

  const { mutateAsync: preparePayroll, isPending: isPreparePending } = usePayrollsPrepareMutation()
  const { mutateAsync: updatePayroll, isPending: isUpdatePending } = usePayrollsUpdateMutation()

  const [savedPayroll, setSavedPayroll] = useState<PayrollPrepared | null>(null)

  const resolvedDefaults: TransitionConfigurationFormData = {
    skipRegularDeductions: payroll?.skipRegularDeductions ?? false,
    withholdingPayPeriod:
      payroll?.withholdingPayPeriod ?? paySchedule?.frequency ?? FALLBACK_WITHHOLDING_PAY_PERIOD,
    fixedWithholdingRate: payroll?.fixedWithholdingRate ?? false,
  }

  const formMethods = useForm<
    TransitionConfigurationFormData,
    unknown,
    TransitionConfigurationFormOutputs
  >({
    resolver: zodResolver(transitionConfigurationSchema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const withholdingPayPeriod = useWatch({
    control: formMethods.control,
    name: 'withholdingPayPeriod',
  })
  const fixedWithholdingRate = useWatch({
    control: formMethods.control,
    name: 'fixedWithholdingRate',
  })

  const setTaxWithholding = (taxWithholding: TransitionConfigurationTaxWithholding) => {
    formMethods.setValue('withholdingPayPeriod', taxWithholding.withholdingPayPeriod, {
      shouldDirty: true,
    })
    formMethods.setValue('fixedWithholdingRate', taxWithholding.fixedWithholdingRate, {
      shouldDirty: true,
    })
  }

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('TransitionConfigurationForm')

  const errorHandling = composeErrorHandler([payrollQuery, payScheduleQuery], {
    submitError,
    setSubmitError,
  })

  const baseMetadata = useDeriveFieldsMetadata(
    transitionConfigurationMetadataConfig,
    formMethods.control,
  )
  const fieldsMetadata = buildTransitionConfigurationFieldsMetadata(baseMetadata)

  const onSubmit = async (): Promise<HookSubmitResult<PayrollPrepared> | undefined> => {
    let submitResult: HookSubmitResult<PayrollPrepared> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: TransitionConfigurationFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const prepareResponse = await preparePayroll({
              request: { companyId, payrollId, requestBody: {} },
            })

            const compensation = prepareResponse.payrollPrepared?.employeeCompensations?.find(
              isVersionedEmployeeCompensation,
            )
            if (!compensation) {
              throw new SDKInternalError(
                'This transition payroll has no employees to update, so its settings could not be saved.',
              )
            }

            const updateResponse = await updatePayroll({
              request: {
                companyId,
                payrollId,
                payrollUpdate: {
                  employeeCompensations: [
                    { employeeUuid: compensation.employeeUuid, version: compensation.version },
                  ],
                  skipRegularDeductions: payload.skipRegularDeductions,
                  withholdingPayPeriod: payload.withholdingPayPeriod,
                  fixedWithholdingRate: payload.fixedWithholdingRate,
                },
              },
            })

            const updatedPayroll = updateResponse.payrollPrepared
            if (!updatedPayroll) {
              throw new SDKInternalError('Payroll update did not return a prepared payroll')
            }

            setSavedPayroll(updatedPayroll)

            await queryClient.invalidateQueries({ queryKey: [PREPARE_QUERY_KEY, payrollId] })

            submitResult = { mode: 'update', data: updatedPayroll }
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

  const isDataLoading =
    payrollQuery.isLoading || (payScheduleUuid ? payScheduleQuery.isLoading : false)

  if (isDataLoading || !payroll) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      payroll,
      paySchedule,
      checkDate: savedPayroll?.checkDate ?? payroll.checkDate ?? null,
      taxWithholding: { withholdingPayPeriod, fixedWithholdingRate },
    },
    status: { isPending: isPreparePending || isUpdatePending, mode: 'update' as const },
    actions: { onSubmit, setTaxWithholding },
    errorHandling,
    form: {
      Fields: { SkipRegularDeductions: SkipRegularDeductionsField },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(
        formMethods,
        transitionConfigurationSchema,
      ),
    },
  }
}
