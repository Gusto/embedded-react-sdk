import { useMemo, useState } from 'react'
import { usePaySchedulesGetUnprocessedTerminationPeriodsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetUnprocessedTerminationPeriods'
import { usePayrollsCreateOffCycleMutation } from '@gusto/embedded-api/react-query/payrollsCreateOffCycle'
import type { UnprocessedTerminationPayPeriod } from '@gusto/embedded-api/models/components/unprocessedterminationpayperiod'
import { OffCycleReason } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { useTranslation } from 'react-i18next'
import { DismissalPayPeriodSelectionPresentation } from './DismissalPayPeriodSelectionPresentation'
import { BaseComponent } from '@/components/Base/Base'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { formatPayPeriodRange } from '@/helpers/dateFormatting'
import type { SelectOption } from '@/components/Common/UI/Select/SelectTypes'

export interface DismissalPayPeriodSelectionProps extends BaseComponentInterface<'Payroll.DismissalPayPeriodSelection'> {
  companyId: string
  employeeId: string
}

export function DismissalPayPeriodSelection(props: DismissalPayPeriodSelectionProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

type RequiredPayPeriod = UnprocessedTerminationPayPeriod &
  Required<Pick<UnprocessedTerminationPayPeriod, 'startDate' | 'endDate' | 'employeeUuid'>>

function Root({ companyId, employeeId, dictionary }: DismissalPayPeriodSelectionProps) {
  useComponentDictionary('Payroll.DismissalPayPeriodSelection', dictionary)
  useI18n('Payroll.DismissalPayPeriodSelection')
  const { t } = useTranslation('Payroll.DismissalPayPeriodSelection')
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = usePaySchedulesGetUnprocessedTerminationPeriodsSuspense({ companyId })
  const { mutateAsync: createOffCyclePayroll, isPending } = usePayrollsCreateOffCycleMutation()

  const employeePayPeriods: RequiredPayPeriod[] = useMemo(() => {
    const allPeriods = data.unprocessedTerminationPayPeriodList ?? []
    return allPeriods
      .filter(period => period.employeeUuid === employeeId)
      .filter(
        (period): period is RequiredPayPeriod =>
          Boolean(period.startDate) && Boolean(period.endDate) && Boolean(period.employeeUuid),
      )
  }, [data, employeeId])

  const payPeriodOptions: SelectOption[] = useMemo(() => {
    return employeePayPeriods.map((period, index) => {
      const dateRange = formatPayPeriodRange(period.startDate, period.endDate)
      const label = period.employeeName ? `${dateRange} (${period.employeeName})` : dateRange
      return {
        value: String(index),
        label,
      }
    })
  }, [employeePayPeriods])

  const initialSelection = payPeriodOptions.length === 1 ? '0' : undefined
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<string | undefined>(
    initialSelection,
  )

  const handleSubmit = async () => {
    if (selectedPeriodIndex === undefined) return

    const period = employeePayPeriods[Number(selectedPeriodIndex)]
    if (!period) return

    await baseSubmitHandler({ selectedPeriodIndex }, async () => {
      const response = await createOffCyclePayroll({
        request: {
          companyId,
          requestBody: {
            offCycle: true,
            offCycleReason: OffCycleReason.DismissedEmployee,
            startDate: new RFCDate(period.startDate),
            endDate: new RFCDate(period.endDate),
            employeeUuids: [employeeId],
            checkDate: period.checkDate ? new RFCDate(period.checkDate) : undefined,
          },
        },
      })

      const payrollUuid =
        response.payrollUnprocessed?.payrollUuid ?? response.payrollUnprocessed?.uuid

      if (!payrollUuid) {
        throw new Error(t('errors.missingPayrollId'))
      }

      onEvent(componentEvents.DISMISSAL_PAY_PERIOD_SELECTED, { payrollUuid })
    })
  }

  return (
    <DismissalPayPeriodSelectionPresentation
      payPeriodOptions={payPeriodOptions}
      selectedPeriodIndex={selectedPeriodIndex}
      onSelectPeriod={setSelectedPeriodIndex}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  )
}
