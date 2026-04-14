import { Outlet, NavLink, useLocation } from 'react-router-dom'
import styles from './SampleFlow.module.scss'

const STEPS = [
  { path: '/sample-flow/step-one', label: 'Step 1: Employee Info' },
  { path: '/sample-flow/step-two', label: 'Step 2: Review' },
] as const

export function SampleFlowLayout() {
  const location = useLocation()
  const isIndex = location.pathname === '/sample-flow'

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        {STEPS.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              isActive || (isIndex && path === STEPS[0].path) ? styles.stepActive : styles.step
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}
