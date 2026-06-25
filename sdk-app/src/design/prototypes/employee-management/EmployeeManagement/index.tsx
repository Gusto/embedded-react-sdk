import { ComponentStatesPage } from '../../ComponentStatesPage'
import { components } from './states'

const BASE_PATH = '/design/employee-management'

export { EmployeeManagementFlow } from './EmployeeManagementFlow'
export { EmployeeList } from './EmployeeList'
export { RehireEmployee } from './RehireEmployee'

export function EmployeeManagementStates() {
  return <ComponentStatesPage basePath={`${BASE_PATH}/component-states`} components={components} />
}
