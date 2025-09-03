import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { PayrollListPresentation } from './PayrollListPresentation'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface PayrollListBlockProps extends BaseComponentInterface {
  companyId: string
}

export const PayrollList = ({ companyId, onEvent }: PayrollListBlockProps) => {
  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
  })
  const payrollList = payrollsData.payrollList!
  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({
    companyId,
  })
  const paySchedulesList = paySchedulesData.payScheduleList!

  const onRunPayroll = ({ payrollId }: { payrollId: string }) => {
    onEvent(componentEvents.RUN_PAYROLL_SELECTED, { payrollId })
  }
  return (
    <BaseComponent onEvent={onEvent}>
      <PayrollListPresentation
        payrolls={payrollList}
        paySchedules={paySchedulesList}
        onRunPayroll={onRunPayroll}
      />
    </BaseComponent>
  )
}
