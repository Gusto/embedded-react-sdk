import { useNavigate } from 'react-router-dom'
import { CATEGORIES, categorizedRegistry } from './registry'
import styles from './Home.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Home() {
  const Components = useComponentContext()
  const navigate = useNavigate()

  return (
    <div className={styles.root}>
      <h1>Embeddedd React SDK Design Sandbox</h1>
      <p>
        A lightweight environment for designing and prototyping new UI components using the SDK
        component library.
      </p>

      <h2>Prototypes</h2>
      <div className={styles.grid}>
        {CATEGORIES.flatMap(category =>
          categorizedRegistry[category].map(({ name, path, description }) => (
            <Components.Box
              key={path}
              header={<Components.BoxHeader title={name} />}
              footer={
                <Components.Button variant="secondary" onClick={() => navigate(path)}>
                  Open
                </Components.Button>
              }
            >
              <Components.Text size="sm" variant="supporting">
                {description}
              </Components.Text>
            </Components.Box>
          )),
        )}
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
          Add an entry to <code>categorizedRegistry</code> in{' '}
          <code>prototype-app/src/registry.ts</code>
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
