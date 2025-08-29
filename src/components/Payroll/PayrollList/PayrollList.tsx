import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { PayrollListPresentation } from './PayrollListPresentation'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface PayrollListBlockProps extends BaseComponentInterface {
  companyId: string
}

export const PayrollList = ({ companyId, onEvent }: PayrollListBlockProps) => {
  const { data, error } = usePayrollsListSuspense({
    companyId,
  })
  console.log(error)
  const payrollList = data.payrollList!

  const onRunPayroll = ({ payrollId }: { payrollId: string }) => {
    onEvent(componentEvents.RUN_PAYROLL_SELECTED, { payrollId })
  }
  return (
    <BaseComponent onEvent={onEvent}>
      <PayrollListPresentation payrolls={payrollList} onRunPayroll={onRunPayroll} />
    </BaseComponent>
  )
}
