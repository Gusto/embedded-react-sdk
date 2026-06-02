import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../../useEntities'
import { ComponentStatesPage } from '../../ComponentStatesPage'
import { CompensationHistory } from './CompensationHistory'
import { components } from './states'

const BASE_PATH = '/design/employee-compensation-history'

export function CompensationHistoryPrototype() {
  const outletContext = useOutletContext<{ entities: EntityIds } | null>()
  const employeeId = outletContext?.entities.employeeId ?? ''

  if (!employeeId) {
    return (
      <p>
        No employee ID is configured. Set <code>VITE_EMPLOYEE_ID</code> or pick an employee from the
        entity panel to view this prototype.
      </p>
    )
  }

  return <CompensationHistory employeeId={employeeId} />
}

export function CompensationHistoryStates() {
  return <ComponentStatesPage basePath={`${BASE_PATH}/component-states`} components={components} />
}
