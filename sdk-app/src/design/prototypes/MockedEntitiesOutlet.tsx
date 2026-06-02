import { Outlet } from 'react-router-dom'
import type { EntityIds } from '../../useEntities'

/**
 * Replaces the DesignLayout's outlet context with deterministic mock
 * entity IDs for component-state routes. Prototype components that read
 * `entities.companyId` etc. from outlet context will see these mock
 * values, and MSW handlers (which match URL patterns regardless of the
 * specific UUID) intercept the resulting API calls. This lets a state
 * demo work without the user having configured a real flow token.
 */
const MOCK_ENTITIES: EntityIds = {
  companyId: 'mock-company-uuid',
  employeeId: 'mock-employee-uuid',
  contractorId: 'mock-contractor-uuid',
  payrollId: 'mock-payroll-uuid',
  requestId: 'mock-request-uuid',
  formId: 'mock-form-uuid',
}

export function MockedEntitiesOutlet() {
  return <Outlet context={{ entities: MOCK_ENTITIES }} />
}
