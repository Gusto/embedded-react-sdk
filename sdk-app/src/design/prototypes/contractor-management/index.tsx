import { ComponentStatesPage } from '../ComponentStatesPage'
import { components } from './states'

const BASE_PATH = '/design/contractor-management'

export function ContractorManagementStates() {
  return <ComponentStatesPage basePath={`${BASE_PATH}/component-states`} components={components} />
}
