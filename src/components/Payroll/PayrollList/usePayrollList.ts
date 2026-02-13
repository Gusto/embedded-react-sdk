import { useState } from 'react'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePayrollsSkipMutation } from '@gusto/embedded-api/react-query/payrollsSkip'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import { PayrollType } from '@gusto/embedded-api/models/operations/postcompaniespayrollskipcompanyuuid'
import { ProcessingStatuses } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { componentEvents, type EventType } from '@/shared/constants'
import { useBase } from '@/components/Base/useBase'
import type { OnEventType } from '@/components/Base/useBase'

export interface UsePayrollListParams {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UsePayrollListReturn {
  payrolls: Payroll[]
  paySchedules: PayScheduleList[]
  showSkipSuccessAlert: boolean
  skippingPayrollId: string | null
  blockers: ApiPayrollBlocker[]
  wireInRequests: WireInRequest[]
  onRunPayroll: (params: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => void
  onSubmitPayroll: (params: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => void
  onSkipPayroll: (params: Pick<Payroll, 'payrollUuid'>) => Promise<void>
  onDismissSkipSuccessAlert: () => void
}

export function usePayrollList({ companyId, onEvent }: UsePayrollListParams): UsePayrollListReturn {
  const { baseSubmitHandler } = useBase()
  const [showSkipSuccessAlert, setShowSkipSuccessAlert] = useState(false)
  const [skippingPayrollId, setSkippingPayrollId] = useState<string | null>(null)

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Unprocessed],
  })
  const payrollList = payrollsData.payrollList!
  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({
    companyId,
  })
  const paySchedulesList = paySchedulesData.payScheduleList!

  const { data: blockersData } = usePayrollsGetBlockersSuspense({
    companyUuid: companyId,
  })

  const payrollBlockerList = blockersData.payrollBlockerList ?? []

  const blockers: ApiPayrollBlocker[] = payrollBlockerList.map(blocker => ({
    key: blocker.key ?? 'unknown',
    message: blocker.message,
  }))

  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: companyId,
  })

  const wireInRequests = wireInRequestsData.wireInRequestList ?? []

  const { mutateAsync: skipPayroll } = usePayrollsSkipMutation()

  const onRunPayroll = ({ payrollUuid, payPeriod }: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => {
    onEvent(componentEvents.RUN_PAYROLL_SELECTED, { payrollUuid, payPeriod })
  }

  const onSubmitPayroll = ({
    payrollUuid,
    payPeriod,
  }: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => {
    onEvent(componentEvents.REVIEW_PAYROLL, { payrollUuid, payPeriod })
  }

  const onSkipPayroll = async ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => {
    const payroll = payrollList.find(payroll => payroll.payrollUuid === payrollUuid)

    if (payroll?.payPeriod) {
      setSkippingPayrollId(payrollUuid!)
      await baseSubmitHandler({}, async () => {
        await skipPayroll({
          request: {
            companyUuid: companyId,
            requestBody: {
              payrollType: PayrollType.Regular,
              startDate: payroll.payPeriod?.startDate,
              endDate: payroll.payPeriod?.endDate,
              payScheduleUuid: payroll.payPeriod?.payScheduleUuid ?? undefined,
            },
          },
        })

        setShowSkipSuccessAlert(true)
        onEvent(componentEvents.PAYROLL_SKIPPED, { payrollId: payrollUuid })
      })
      setSkippingPayrollId(null)
    }
  }

  const onDismissSkipSuccessAlert = () => {
    setShowSkipSuccessAlert(false)
  }

  return {
    payrolls: payrollList,
    paySchedules: paySchedulesList,
    showSkipSuccessAlert,
    skippingPayrollId,
    blockers,
    wireInRequests,
    onRunPayroll,
    onSubmitPayroll,
    onSkipPayroll,
    onDismissSkipSuccessAlert,
  }
}
