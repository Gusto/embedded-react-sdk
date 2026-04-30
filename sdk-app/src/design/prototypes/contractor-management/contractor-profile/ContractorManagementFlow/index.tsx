import { Outlet, useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../../../useEntities'

export function ContractorManagementFlow() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  return <Outlet context={{ entities }} />
}
