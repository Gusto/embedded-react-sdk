import Link from '@docusaurus/Link'
import type { ReactNode } from 'react'
import styles from './styles.module.css'

interface Surface {
  title: string
  description: string
  to: string
}

const surfaces: Surface[] = [
  {
    title: 'Companies',
    description: 'Stand up a new company and request the information needed to run payroll.',
    to: '/docs/surfaces/companies',
  },
  {
    title: 'Employees',
    description: 'Onboard employees, manage their details, and handle terminations.',
    to: '/docs/surfaces/employees',
  },
  {
    title: 'Contractors',
    description: 'Onboard contractors and pay them on or off cycle.',
    to: '/docs/surfaces/contractors',
  },
  {
    title: 'Payroll',
    description: 'Run regular, off-cycle, dismissal, and transition payrolls.',
    to: '/docs/surfaces/payroll',
  },
]

export default function SurfacesGrid(): ReactNode {
  return (
    <div className={styles.grid}>
      {surfaces.map(({ title, description, to }) => (
        <Link key={title} to={to} className={styles.card}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </Link>
      ))}
    </div>
  )
}
