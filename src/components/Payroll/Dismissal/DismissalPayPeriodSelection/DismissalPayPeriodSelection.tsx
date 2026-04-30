import { useEffect, useMemo, useState } from 'react'
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
import { SDKInternalError } from '@/types/sdkError'
import { useComponentDictionary, useI18n } from '@/i18n'
import { formatPayPeriodRange } from '@/helpers/dateFormatting'
import type { SelectOption } from '@/components/Common/UI/Select/SelectTypes'

export interface DismissalPayPeriodSelectionProps extends BaseComponentInterface<'Payroll.Dismissal'> {
  companyId: string
  employeeId?: string
  payrollId?: string
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
    const allPeriods = data.unprocessedTerminationPayPeriodList ?? []
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
