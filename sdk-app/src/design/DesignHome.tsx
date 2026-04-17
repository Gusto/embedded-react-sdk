import { useNavigate } from 'react-router-dom'
import { CATEGORIES, categorizedRegistry } from './registry'
import './DesignHome.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, Grid } from '@/components/Common'
import ArrowRightIcon from '@/assets/icons/icon-arrow-right.svg?react'

export function DesignHome() {
  const Components = useComponentContext()
  const navigate = useNavigate()

  return (
    <div>
      <Grid gap={32}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h1">Design Sandbox</Components.Heading>
          <Components.Text variant="supporting">
            A lightweight environment for designing and prototyping new UI components using the SDK
            component library.
          </Components.Text>
        </Flex>

        <Grid gap={16} gridTemplateColumns="repeat(auto-fit, minmax(256px, 1fr))">
          {CATEGORIES.flatMap(category =>
            categorizedRegistry[category].map(({ name, path, description }) => (
              <Components.Box
                key={path}
                header={
                  <Flex flexDirection="column" gap={4}>
                    <Components.Heading as="h3" styledAs="h4">
                      {name}
                    </Components.Heading>
                    <Components.Text size="sm" variant="supporting">
                      {description}
                    </Components.Text>
                  </Flex>
                }
                footer={
                  <Components.Button variant="secondary" onClick={() => navigate(path)}>
                    Go <ArrowRightIcon />
                  </Components.Button>
                }
              >
                <Components.Text size="sm" variant="supporting">
                  {description}
                </Components.Text>
              </Components.Box>
            )),
          )}
        </Grid>
        <Flex flexDirection="column" gap={12}>
          <Components.Heading as="h2" styledAs="h3">
            How to add a new prototype
          </Components.Heading>
          <Flex flexDirection="column" gap={4}>
            <Components.Text>
              1. Create a directory in <code>sdk-app/src/design/prototypes/your-feature/</code>
            </Components.Text>
            <Components.Text>
              2. Add an <code>index.tsx</code> — for single-page prototypes this is all you need
            </Components.Text>
            <Components.Text>
              3. For multi-page prototypes, add an <code>{'<Outlet />'}</code> in your index and
              create sub-page components
            </Components.Text>
            <Components.Text>
              4. Register routes in <code>sdk-app/src/main.tsx</code> under the <code>/design</code>{' '}
              path
            </Components.Text>
            <Components.Text>
              5. Add an entry to <code>categorizedRegistry</code> in{' '}
              <code>sdk-app/src/design/registry.ts</code>
            </Components.Text>
          </Flex>
        </Flex>

        <Flex flexDirection="column" gap={12}>
          <Components.Heading as="h2" styledAs="h3">
            Available components
          </Components.Heading>
          <Components.Text>
            You have access to all SDK UI components. SDK components that are exposed as adapter
            hooks can be accessed via <code>useComponentContext()</code> from{' '}
            <code>@/contexts/ComponentAdapter/useComponentContext</code>. This gives you Button,
            TextInput, Select, Alert, Badge, Card, Table, Modal, and 30+ more.
          </Components.Text>
        </Flex>
      </Grid>
    </div>
  )
}
