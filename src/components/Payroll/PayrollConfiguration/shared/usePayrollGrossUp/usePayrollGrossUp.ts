import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsPrepare } from '@gusto/embedded-api/funcs/payrollsPrepare'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import { usePayrollsCalculateGrossUpMutation } from '@gusto/embedded-api/react-query/payrollsCalculateGrossUp'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payrollshow'
import { derivePayrollCategory } from '../../../payrollTypes'
import { getGrossUpTargetCompensationName, isGrossUpEligible } from '../../grossUpHelpers'
import { transformEmployeeCompensation } from '../../payrollUpdateHelpers'
import { PREPARE_QUERY_KEY } from '../../usePayrollConfigurationData'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'
import { SDKInternalError } from '@/types/sdkError'

/**
 * Parameters for {@link usePayrollGrossUp}.
 *
 * @public
 */
export interface UsePayrollGrossUpParams {
  /** The associated company identifier. */
  companyId: string
  /** The associated payroll identifier. */
  payrollId: string
  /** The employee whose net earnings are being set. */
  employeeId: string
}

/**
 * Data payload exposed by {@link usePayrollGrossUp} once loaded.
 *
 * @public
 */
export type UsePayrollGrossUpData = {
  /** Whether this payroll category supports gross-up (Bonus or Correction). */
  isEligible: boolean
  /** The fixed-compensation line the gross amount is applied to, or `null` when not eligible. */
  targetCompensationName: string | null
}

/**
 * Status flags exposed by {@link usePayrollGrossUp}.
 *
 * @public
 */
export type UsePayrollGrossUpStatus = {
  /** A gross-up preview calculation is in flight. */
  isCalculating: boolean
  /** The calculated gross amount is being applied to the employee's compensation. */
  isApplying: boolean
}

/**
 * Ready-state shape returned by {@link usePayrollGrossUp} once the payroll has loaded.
 *
 * @public
 */
export interface UsePayrollGrossUpReady extends BaseHookReady<
  UsePayrollGrossUpData,
  UsePayrollGrossUpStatus
> {
  /** Imperative gross-up actions. */
  actions: {
    /**
     * Previews the gross amount required to pay the employee the given net amount.
     * Returns the gross as a string, or `null` when the calculation fails. Persists nothing.
     */
    calculateGrossUp: (netPay: number) => Promise<string | null>
    /**
     * Applies a calculated gross amount to the employee's target compensation and persists it.
     * Returns the updated prepared payroll on success.
     */
    applyGrossUp: (
      grossAmount: string,
    ) => Promise<HookSubmitResult<PayrollPrepared | undefined> | undefined>
  }
}

/**
 * Return type of {@link usePayrollGrossUp}.
 *
 * @public
 */
export type UsePayrollGrossUpResult = HookLoadingResult | UsePayrollGrossUpReady

/**
 * Headless, partner-facing hook for the payroll gross-up (net-earnings) sub-flow.
 *
 * @remarks
 * For Bonus and Correction payrolls, gross-up lets you enter a target net amount and
 * have the API compute the gross needed to reach it, then apply that gross to the
 * employee's compensation. The preview (`calculateGrossUp`) hits a dedicated endpoint
 * and persists nothing; `applyGrossUp` writes the gross to the employee's target
 * fixed-compensation line via the normal payroll update. Because that update triggers
 * the SDK's global cache invalidation, a companion `usePayrollConfiguration` refreshes
 * on its own — no cross-hook wiring. Drive a gross-up modal from this hook alone.
 *
 * @param params - See {@link UsePayrollGrossUpParams}.
 * @returns A discriminated union: `{ isLoading: true }` while the payroll loads, then
 *   the {@link UsePayrollGrossUpReady} shape.
 * @public
 */
export function usePayrollGrossUp({
  companyId,
  payrollId,
  employeeId,
}: UsePayrollGrossUpParams): UsePayrollGrossUpResult {
  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('PayrollGrossUp')

  const gustoClient = useGustoEmbeddedContext()

  // Prepare the payroll scoped to this single employee. Prepare (not the payroll GET) is what
  // yields editable `PayrollEmployeeCompensationsType` rows and the off-cycle reason the category
  // is derived from — the same source usePayrollConfiguration edits.
  const prepareQuery = useQuery({
    queryKey: [PREPARE_QUERY_KEY, payrollId, `gross-up:${employeeId}`],
    queryFn: async ({ signal }) => {
      const result = await payrollsPrepare(
        gustoClient,
        {
          companyId,
          payrollId,
          sortBy: 'last_name',
          requestBody: { employeeUuids: [employeeId] },
        },
        { signal },
      )
      if (!result.ok) {
        throw result.error
      }
      return result.value.payrollPrepared
    },
    enabled: employeeId.length > 0,
    retry: false,
  })

  const prepareData = prepareQuery.data

  const payrollCategory = useMemo(() => derivePayrollCategory(prepareData ?? {}), [prepareData])
  const isEligible = isGrossUpEligible(payrollCategory)
  const targetCompensationName = getGrossUpTargetCompensationName(payrollCategory)

  const employeeCompensation = useMemo(
    () => prepareData?.employeeCompensations?.find(comp => comp.employeeUuid === employeeId),
    [prepareData?.employeeCompensations, employeeId],
  )

  const { mutateAsync: calculateGrossUpMutation, isPending: isCalculating } =
    usePayrollsCalculateGrossUpMutation()
  const { mutateAsync: updatePayroll, isPending: isApplying } = usePayrollsUpdateMutation()

  const calculateGrossUp = useCallback(
    async (netPay: number): Promise<string | null> => {
      let grossUp: string | null = null
      await baseSubmitHandler(null, async () => {
        const result = await calculateGrossUpMutation({
          request: {
            payrollUuid: payrollId,
            payrollGrossUpRequest: {
              employeeUuid: employeeId,
              netPay: netPay.toString(),
            },
          },
        })
        grossUp = result.payrollGrossUpResponse?.grossUp ?? null
      })
      return grossUp
    },
    [baseSubmitHandler, calculateGrossUpMutation, payrollId, employeeId],
  )

  const applyGrossUp = useCallback(
    async (
      grossAmount: string,
    ): Promise<HookSubmitResult<PayrollPrepared | undefined> | undefined> => {
      if (!targetCompensationName) {
        throw new SDKInternalError(
          'Unable to apply gross-up: this payroll category has no target compensation.',
        )
      }
      if (!employeeCompensation) {
        throw new SDKInternalError('Unable to apply gross-up: employee compensation not found.')
      }

      const existingFixed = employeeCompensation.fixedCompensations ?? []
      const hasTargetCompensation = existingFixed.some(
        fc => fc.name?.toLowerCase() === targetCompensationName.toLowerCase(),
      )

      const updatedFixedCompensations = existingFixed.map(fc => ({
        name: fc.name,
        jobUuid: fc.jobUuid,
        amount: fc.name?.toLowerCase() === targetCompensationName.toLowerCase() ? grossAmount : '0',
      }))

      if (!hasTargetCompensation) {
        const primaryJobUuid =
          employeeCompensation.hourlyCompensations?.[0]?.jobUuid ?? existingFixed[0]?.jobUuid ?? ''
        updatedFixedCompensations.push({
          name: targetCompensationName,
          jobUuid: primaryJobUuid,
          amount: grossAmount,
        })
      }

      const updatedHourlyCompensations = (employeeCompensation.hourlyCompensations ?? []).map(
        hc => ({ name: hc.name, jobUuid: hc.jobUuid, hours: '0' }),
      )
      const updatedPaidTimeOff = (employeeCompensation.paidTimeOff ?? []).map(pto => ({
        name: pto.name,
        hours: '0',
      }))

      const transformedCompensation = transformEmployeeCompensation({
        ...employeeCompensation,
        fixedCompensations: updatedFixedCompensations,
        hourlyCompensations: updatedHourlyCompensations,
        paidTimeOff: updatedPaidTimeOff,
      })

      let submitResult: HookSubmitResult<PayrollPrepared | undefined> | undefined
      await baseSubmitHandler({}, async () => {
        const result = await updatePayroll({
          request: {
            companyId,
            payrollId,
            payrollUpdate: {
              employeeCompensations: [{ ...transformedCompensation, excluded: false }],
            },
          },
        })
        submitResult = { mode: 'update', data: result.payrollPrepared }
      })
      return submitResult
    },
    [
      targetCompensationName,
      employeeCompensation,
      baseSubmitHandler,
      updatePayroll,
      companyId,
      payrollId,
    ],
  )

  const errorHandling = composeErrorHandler([prepareQuery], { submitError, setSubmitError })

  if (prepareQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { isEligible, targetCompensationName },
    status: { isCalculating, isApplying },
    actions: { calculateGrossUp, applyGrossUp },
    errorHandling,
  }
}
