import { action } from '@ladle/react'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'

export default {
  title: 'Domain/Payroll/PayrollConfiguration',
}

export const PayrollConfigurationStory = () => {
  return (
    <PayrollConfigurationPresentation
      employees={[{ employeeId: 'cdef' }]}
      onBack={action('on_back')}
      onCalculatePayroll={action('on_calculate')}
      onEdit={action('on_edit')}
    />
  )
}
