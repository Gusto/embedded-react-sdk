import { PayrollListPresentation } from './PayrollListPresentation'
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

export const PayrollList = ({ companyId, onEvent, ...baseProps }: PayrollListBlockProps) => {
  const { data: payrolls } = useListCompanyPayrollsApi({ companyId })
  const onRunPayroll = ({ payrollId }: { payrollId: string }) => {
    onEvent(componentEvents.RUN_PAYROLL_SELECTED, { payrollId })
  }
  return (
    <BaseComponent {...baseProps} onEvent={onEvent}>
      <PayrollListPresentation payrolls={payrolls} onRunPayroll={onRunPayroll} />
    </BaseComponent>
  )
}
