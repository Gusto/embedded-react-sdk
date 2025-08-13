import { action } from '@ladle/react'
import { PayrollConfiguration } from './PayrollConfiguration'

export default {
  title: 'Domain/Payroll/PayrollConfiguration',
}

export const PayrollConfigurationStory = () => {
  return (
    <PayrollConfiguration
      employees={[{ employeeId: 'cdef' }]}
      onBack={action('on_back')}
      onCalculatePayroll={action('on_calculate')}
      onEdit={action('on_edit')}
    />
  )
}
