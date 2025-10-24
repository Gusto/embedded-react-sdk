import { useState } from 'react'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePayrollsSkipMutation } from '@gusto/embedded-api/react-query/payrollsSkip'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { PayrollType } from '@gusto/embedded-api/models/operations/postcompaniespayrollskipcompanyuuid'
import { ProcessingStatuses } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import { getPayrollType } from '../helpers'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollListPresentation } from './PayrollListPresentation'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

const createPayrollProjection = (p: Payroll) => ({
  ...p,
  payrollType: getPayrollType(p),
})

interface PayrollListBlockProps extends BaseComponentInterface {
  companyId: string
}

export function PayrollList(props: PayrollListBlockProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = ({ companyId, onEvent }: PayrollListBlockProps) => {
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
  const onViewBlockers = () => {
    onEvent(componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)
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
  return (
    <PayrollListPresentation
      payrolls={payrollList.map(createPayrollProjection)}
      paySchedules={paySchedulesList}
      onRunPayroll={onRunPayroll}
      onSubmitPayroll={onSubmitPayroll}
      onSkipPayroll={onSkipPayroll}
      onViewBlockers={onViewBlockers}
      showSkipSuccessAlert={showSkipSuccessAlert}
      onDismissSkipSuccessAlert={() => {
        setShowSkipSuccessAlert(false)
      }}
      skippingPayrollId={skippingPayrollId}
      blockers={blockers}
    />
  )
}
