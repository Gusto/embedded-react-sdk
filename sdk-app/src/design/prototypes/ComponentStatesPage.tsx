import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Navigate, useParams } from 'react-router-dom'
import { DESIGN_RIGHT_RAIL_ID } from '../DesignLayout'
import { ComponentStatesSidebar } from './ComponentStatesSidebar'
import type { PrototypeComponent } from './prototypeTypes'
import styles from './ComponentStatesPage.module.scss'

export interface ComponentStatesPageProps {
  /** Absolute base path to the component-states route, used to build sidebar links. */
  basePath: string
  components: PrototypeComponent[]
}

function useRightRailEl() {
  const [el, setEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setEl(document.getElementById(DESIGN_RIGHT_RAIL_ID))
  }, [])
  return el
}

export function ComponentStatesPage({ basePath, components }: ComponentStatesPageProps) {
  const { componentSlug, configSlug } = useParams<{
    componentSlug?: string
    configSlug?: string
  }>()
  const railEl = useRightRailEl()

  const firstComponent = components[0]
  const firstConfig = firstComponent?.configurations[0]

  if (!componentSlug || !configSlug) {
    if (firstComponent && firstConfig) {
      return <Navigate to={`${basePath}/${firstComponent.slug}/${firstConfig.slug}`} replace />
    }
    return <div className={styles.empty}>No configurations defined for this prototype.</div>
  }

  const component = components.find(c => c.slug === componentSlug)
  const configuration = component?.configurations.find(c => c.slug === configSlug)

  const sidebar = <ComponentStatesSidebar basePath={basePath} components={components} />

  return (
    <>
      {component && configuration ? (
        <div key={`${component.slug}/${configuration.slug}`}>{configuration.render()}</div>
      ) : (
        <div className={styles.empty}>Configuration not found.</div>
      )}
      {railEl && createPortal(sidebar, railEl)}
    </>
  )
}
