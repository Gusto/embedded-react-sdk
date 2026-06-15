import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../useEntities'
import { ComponentStatesPage } from '../ComponentStatesPage'
import { PayrollEditEmployee } from './PayrollEditEmployee'
import { components } from './states'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BASE_PATH = '/design/payroll-edit-employee'

export function PayrollEditEmployeePrototype() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const Components = useComponentContext()

  const missing: string[] = []
  if (!entities.companyId) missing.push('company ID')
  if (!entities.employeeId) missing.push('employee ID')

  if (missing.length > 0) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Components.Heading as="h2">Payroll Edit Employee</Components.Heading>
        <Components.Alert label={`Missing ${missing.join(', ')}`} status="warning">
          Set these in Settings (top right) to load real data for this prototype.
        </Components.Alert>
      </Flex>
    )
  }

  return (
    <PayrollEditEmployee
      companyId={entities.companyId}
      employeeId={entities.employeeId}
      preferredPayrollId={entities.payrollId || undefined}
    />
  )
}

export function PayrollEditEmployeeStates() {
  return <ComponentStatesPage basePath={`${BASE_PATH}/component-states`} components={components} />
}
