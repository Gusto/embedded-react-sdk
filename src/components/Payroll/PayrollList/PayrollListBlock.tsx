import { PayrollList } from './PayrollList'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

//TODO: Use Speakeasy type
interface Company {
  companyId: string
}

// TODO: Replace this hook with call to Speakeasy instead
const useListCompanyPayrollsApi = ({ companyId }: Company) => {
  return {
    data: [{ payrollId: 'abcd' }],
  }
}

interface PayrollListBlockProps extends BaseComponentInterface {
  companyId: string
}

export const PayrollListBlock = ({ companyId, onEvent }: PayrollListBlockProps) => {
  const { data: payrolls } = useListCompanyPayrollsApi({ companyId })
  const onRunPayroll = ({ payrollId }: { payrollId: string }) => {
    onEvent(componentEvents.RUN_PAYROLL_SELECTED, { payrollId })
  }
  return (
    <BaseComponent onEvent={onEvent}>
      <PayrollList payrolls={payrolls} onRunPayroll={onRunPayroll} />
    </BaseComponent>
  )
}
