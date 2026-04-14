import { Link } from 'react-router-dom'
import styles from './Home.module.scss'

const PROTOTYPES = [
  {
    path: '/component-showcase',
    title: 'Component Showcase',
    description:
      'A single page demonstrating SDK components like Button, TextInput, Select, Alert, and more.',
  },
  {
    path: '/sample-flow',
    title: 'Sample Flow',
    description:
      'A multi-page prototype showing how to build a step-by-step flow with sub-navigation.',
  },
  // Add new prototypes here
]

export function Home() {
  return (
    <div className={styles.root}>
      <h1>Prototype App</h1>
      <p>
        A lightweight environment for designing and prototyping new UI components using the SDK
        component library.
      </p>

      <h2>Prototypes</h2>
      <div className={styles.grid}>
        {PROTOTYPES.map(({ path, title, description }) => (
          <Link key={path} to={path} className={styles.card}>
            <h3>{title}</h3>
            <p>{description}</p>
          </Link>
        ))}
      </div>

      <h2>How to add a new prototype</h2>
      <ol>
        <li>
          Create a directory in <code>prototype-app/src/prototypes/your-feature/</code>
        </li>
        <li>
          Add an <code>index.tsx</code> — for single-page prototypes this is all you need
        </li>
        <li>
          For multi-page prototypes, add an <code>{'<Outlet />'}</code> in your index and create
          sub-page components
        </li>
        <li>
          Register routes in <code>prototype-app/src/main.tsx</code>
        </li>
        <li>
          Add an entry to <code>PROTOTYPES</code> in <code>prototype-app/src/Home.tsx</code>
        </li>
      </ol>

      <h2>Available components</h2>
      <p>
        You have access to all SDK UI components. SDK components that are exposed as adapter hooks
        can be accessed via <code>useComponentContext()</code> from{' '}
        <code>@/contexts/ComponentAdapter/useComponentContext</code>. This gives you Button,
        TextInput, Select, Alert, Badge, Card, Table, Modal, and 30+ more.
      </p>
    </div>
  )
}
