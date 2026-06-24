import { useEffect, useMemo, useState } from 'react'
import { usePaySchedulesGetUnprocessedTerminationPeriodsSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/paySchedulesGetUnprocessedTerminationPeriods'
import { usePayrollsCreateOffCycleMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsCreateOffCycle'
import type { UnprocessedTerminationPayPeriod } from '@gusto/embedded-api-v-2026-02-01/models/components/unprocessedterminationpayperiod'
import { OffCycleReason } from '@gusto/embedded-api-v-2026-02-01/models/operations/postv1companiescompanyidpayrolls'
import { RFCDate } from '@gusto/embedded-api-v-2026-02-01/types/rfcdate'
import { useTranslation } from 'react-i18next'
import { DismissalPayPeriodSelectionPresentation } from './DismissalPayPeriodSelectionPresentation'
import { BaseComponent } from '@/components/Base/Base'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { SDKInternalError } from '@/types/sdkError'
import { useComponentDictionary, useI18n } from '@/i18n'
import { formatPayPeriodRange } from '@/helpers/dateFormatting'
import type { SelectOption } from '@/components/Common/UI/Select/SelectTypes'

/**
 * Props for {@link DismissalPayPeriodSelection}.
 *
 * @public
 */
export interface DismissalPayPeriodSelectionProps extends BaseComponentInterface<'Payroll.Dismissal'> {
  /** Identifier of the company the dismissal payroll belongs to. */
  companyId: string
  /** Identifier of the terminated employee. When provided, the available pay periods are filtered to this employee. */
  employeeId?: string
  /** Identifier of an existing dismissal payroll. When provided alongside `employeeId`, pay period selection is skipped and the component immediately emits the selection event. */
  payrollId?: string
}

/**
 * Pay period selection step for the dismissal payroll workflow.
 *
 * Lists the terminated employee's unprocessed termination pay periods and, on submit, creates an off-cycle payroll with the "Dismissed employee" reason for the selected period. When only one pay period is available it is pre-selected. When both `payrollId` and `employeeId` are supplied the step is skipped and the selection event fires immediately with the existing payroll.
 *
 * @remarks
 * Events:
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `dismissal/payPeriod/selected` | Fired after a pay period is selected and the off-cycle payroll has been created, or immediately when `payrollId` is supplied. | `{ payrollUuid: string }` |
 *
 * @param props - See {@link DismissalPayPeriodSelectionProps}.
 * @returns The rendered pay period selection step, or nothing while auto-advancing past selection.
 * @public
 */
export function DismissalPayPeriodSelection(props: DismissalPayPeriodSelectionProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

type RequiredPayPeriod = UnprocessedTerminationPayPeriod &
  Required<Pick<UnprocessedTerminationPayPeriod, 'startDate' | 'endDate' | 'employeeUuid'>>

const payPeriodKey = (period: RequiredPayPeriod) => `${period.startDate}__${period.endDate}`

function Root({ companyId, employeeId, payrollId, dictionary }: DismissalPayPeriodSelectionProps) {
  useComponentDictionary('Payroll.Dismissal', dictionary)
  useI18n('Payroll.Dismissal')
  const { t } = useTranslation('Payroll.Dismissal')
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = usePaySchedulesGetUnprocessedTerminationPeriodsSuspense({ companyId })
  const { mutateAsync: createOffCyclePayroll, isPending } = usePayrollsCreateOffCycleMutation()

  const shouldAutoAdvance = Boolean(payrollId) && Boolean(employeeId)

  useEffect(() => {
    if (payrollId && employeeId) {
      onEvent(componentEvents.DISMISSAL_PAY_PERIOD_SELECTED, { payrollUuid: payrollId })
    }
  }, [payrollId, employeeId, onEvent])

  const employeePayPeriods: RequiredPayPeriod[] = useMemo(() => {
    const allPeriods = data.unprocessedTerminationPayPeriods ?? []
    return allPeriods
      .filter(period => !employeeId || period.employeeUuid === employeeId)
      .filter(
        (period): period is RequiredPayPeriod =>
          Boolean(period.startDate) && Boolean(period.endDate) && Boolean(period.employeeUuid),
      )
  }, [data, employeeId])

  const payPeriodOptions: SelectOption[] = useMemo(() => {
    return employeePayPeriods.map(period => {
      const dateRange = formatPayPeriodRange(period.startDate, period.endDate)
      const label = period.employeeName ? `${dateRange} (${period.employeeName})` : dateRange
      return {
        value: payPeriodKey(period),
        label,
      }
    })
  }, [employeePayPeriods])

  const initialSelection = payPeriodOptions.length === 1 ? payPeriodOptions[0]!.value : undefined
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(initialSelection)

  const handleSubmit = async () => {
    await baseSubmitHandler({ selectedPeriodKey }, async () => {
      if (selectedPeriodKey === undefined) {
        throw new SDKInternalError(t('errors.noPayPeriodSelected'))
      }

      const period = employeePayPeriods.find(p => payPeriodKey(p) === selectedPeriodKey)
      if (!period) {
        throw new SDKInternalError(t('errors.invalidPayPeriod'))
      }

      const resolvedEmployeeId = employeeId ?? period.employeeUuid

      const response = await createOffCyclePayroll({
        request: {
          companyId,
          requestBody: {
            offCycle: true,
            offCycleReason: OffCycleReason.DismissedEmployee,
            startDate: new RFCDate(period.startDate),
            endDate: new RFCDate(period.endDate),
            employeeUuids: [resolvedEmployeeId],
          },
        },
      })

      const payrollUuid =
        response.payrollUnprocessed?.payrollUuid ?? response.payrollUnprocessed?.uuid

      if (!payrollUuid) {
        throw new SDKInternalError(t('errors.missingPayrollId'))
      }

      onEvent(componentEvents.DISMISSAL_PAY_PERIOD_SELECTED, { payrollUuid })
    })
  }

  if (shouldAutoAdvance) {
    return null
  }

  return (
    <DismissalPayPeriodSelectionPresentation
      payPeriodOptions={payPeriodOptions}
      selectedPeriodKey={selectedPeriodKey}
      onSelectPeriod={setSelectedPeriodKey}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  )
}
