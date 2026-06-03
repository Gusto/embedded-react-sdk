import { NavLink } from 'react-router-dom'
import type { PrototypeComponent } from './prototypeTypes'
import styles from './ComponentStatesSidebar.module.scss'

export interface ComponentStatesSidebarProps {
  /** Absolute base path, e.g. "/design/employee-compensation-history/component-states" */
  basePath: string
  components: PrototypeComponent[]
}

export function ComponentStatesSidebar({ basePath, components }: ComponentStatesSidebarProps) {
  return (
    <aside className={styles.root} aria-label="Component states">
      {components.map(component => (
        <section key={component.slug} className={styles.componentSection}>
          <h2 className={styles.componentHeading}>{component.name}</h2>
          <ul className={styles.list}>
            {component.configurations.map(config => (
              <li key={config.slug} className={styles.item}>
                <NavLink to={`${basePath}/${component.slug}/${config.slug}`}>{config.name}</NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  )
}
