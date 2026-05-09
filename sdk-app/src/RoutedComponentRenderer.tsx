import { useOutletContext } from 'react-router-dom'
import { ComponentRenderer } from './ComponentRenderer'
import type { EntityIds } from './useEntities'

export function RoutedComponentRenderer() {
  const { entities, chromeHidden } = useOutletContext<{
    entities: EntityIds
    chromeHidden: boolean
  }>()
  return <ComponentRenderer entities={entities} chromeHidden={chromeHidden} />
}
