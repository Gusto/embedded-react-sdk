import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { ProcessingStatuses } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import { PayrollListPresentation } from './PayrollListPresentation'
import type { PayrollType } from './types'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

const selectPayrollType = ({
  external,
  offCycle,
}: Pick<Payroll, 'external' | 'offCycle'>): PayrollType =>
  external ? 'External' : offCycle ? 'Off-Cycle' : 'Regular'

const createPayrollProjection = (p: Payroll) => ({
  ...p,
  payrollType: selectPayrollType(p),
})

interface PayrollListBlockProps extends BaseComponentInterface {
  companyId: string
}

export const PayrollList = ({ companyId, onEvent }: PayrollListBlockProps) => {
  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Unprocessed],
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
        payrolls={payrollList.map(createPayrollProjection)}
        paySchedules={paySchedulesList}
        onRunPayroll={onRunPayroll}
      />
    </BaseComponent>
  )
}
