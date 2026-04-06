import { useOutletContext } from 'react-router-dom'
import { ComponentRenderer } from './ComponentRenderer'
import type { EntityIds } from './useEntities'

export function RoutedComponentRenderer() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  return <ComponentRenderer entities={entities} />
}
