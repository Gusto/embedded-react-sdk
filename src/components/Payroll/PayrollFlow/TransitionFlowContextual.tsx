import { useMemo } from 'react'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import { TransitionFlow } from '../Transition/TransitionFlow'
import type { PayrollFlowContextInterface } from './PayrollFlowComponents'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

const FUTURE_LOOKAHEAD_DAYS = 28

function getFutureEndDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + FUTURE_LOOKAHEAD_DAYS)
  return date.toISOString().split('T')[0]!
}

export function TransitionFlowContextual() {
  const { companyId, transitionStartDate, transitionEndDate, transitionPayScheduleUuid, onEvent } =
    useFlow<PayrollFlowContextInterface>()

  const resolvedCompanyId = ensureRequired(companyId)
  const startDate = ensureRequired(transitionStartDate)
  const endDate = ensureRequired(transitionEndDate)
  const payScheduleUuid = ensureRequired(transitionPayScheduleUuid)

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId: resolvedCompanyId,
    processingStatuses: [ProcessingStatuses.Unprocessed],
    endDate: getFutureEndDate(),
    payrollTypes: [
      QueryParamPayrollTypes.Regular,
      QueryParamPayrollTypes.OffCycle,
      QueryParamPayrollTypes.External,
    ],
  })

  const existingPayrollUuid = useMemo(() => {
    const match = payrollsData.payrollList?.find(p => {
      const period = p.payPeriod
      return (
        p.offCycleReason === 'Transition from old pay schedule' &&
        period?.startDate === startDate &&
        period.endDate === endDate &&
        period.payScheduleUuid === payScheduleUuid
      )
    })
    return match?.payrollUuid
  }, [payrollsData, startDate, endDate, payScheduleUuid])

  return (
    <TransitionFlow
      companyId={resolvedCompanyId}
      startDate={startDate}
      endDate={endDate}
      payScheduleUuid={payScheduleUuid}
      payrollUuid={existingPayrollUuid}
      onEvent={onEvent}
    />
  )
}
