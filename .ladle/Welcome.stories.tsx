import type { Story } from '@ladle/react'
import styles from './Welcome.module.scss'
import { Card } from '@/components/Common/Card/Card'
import { Flex } from '@/components/Common/Flex/Flex'
import { Grid } from '@/components/Common/Grid/Grid'
import { Button } from '@/components/Common/Button/Button'

export default {
  title: 'Welcome', // This will appear at the top of the sidebar
}

export const Introduction: Story = () => {
  return (
    <div className={styles.container}>
      <Flex flexDirection="column" gap={32}>
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <span className={styles.emojiLogo}>🦎</span>
          </div>
          <h1 className={styles.title}>Embedded React SDK</h1>
          <p className={styles.subtitle}>
            A ladle development environment for exploring and testing Gusto Embedded React SDK
            components ✨
          </p>
        </header>

        <Card className={styles.card}>
          <Flex flexDirection="column" gap={16}>
            <h2 className={styles.sectionTitle}>🚀 About Ladle</h2>
            <p className={styles.paragraph}>
              Ladle is a fast and lightweight development environment for React components. It helps
              you develop, test, and document components without the overhead of a full application.
            </p>
            <p className={styles.paragraph}>
              The Gusto Embedded React SDK uses Ladle to provide an isolated environment for
              component development, making it easier to focus on individual components outside
              their workflow context.
            </p>
          </Flex>
        </Card>

        <Card className={styles.card}>
          <Flex flexDirection="column" gap={16}>
            <h2 className={styles.sectionTitle}>🧩 Available Component Stories</h2>
            <p className={styles.paragraph}>
              Components are organized by type in the sidebar. Here are the main categories:
            </p>

            <Grid
              gridTemplateColumns={{
                base: '1fr',
                small: '1fr 1fr',
                medium: 'repeat(2, 1fr)',
              }}
              gap={16}
            >
              <a href="/?story=ui--components--button--icon-button" className={styles.categoryLink}>
                <div className={styles.categoryCard}>
                  <div className={styles.categoryTitle}>🧰 UI Components</div>
                  <div className={styles.categoryDescription}>
                    Core UI elements like Button, Card, and CalendarDisplay
                  </div>
                </div>
              </a>

              <a href="/?story=ui--form--fields--checkbox--default" className={styles.categoryLink}>
                <div className={styles.categoryCard}>
                  <div className={styles.categoryTitle}>📝 Form Fields</div>
                  <div className={styles.categoryDescription}>
                    Form components like Text, Select, and Checkbox fields
                  </div>
                </div>
              </a>

              <a href="/?story=ui--form--inputs--checkbox--default" className={styles.categoryLink}>
                <div className={styles.categoryCard}>
                  <div className={styles.categoryTitle}>⌨️ Form Inputs</div>
                  <div className={styles.categoryDescription}>
                    Base input elements like TextInput, Select, Checkbox, and more
                  </div>
                </div>
              </a>

              <a
                href="/?story=domain--company--documents--document-viewer-default"
                className={styles.categoryLink}
              >
                <div className={styles.categoryCard}>
                  <div className={styles.categoryTitle}>🏢 Domain Components</div>
                  <div className={styles.categoryDescription}>
                    Domain-specific components like Industry and Documents
                  </div>
                </div>
              </a>
            </Grid>
          </Flex>
        </Card>

        <Card className={styles.card}>
          <Flex flexDirection="column" gap={16}>
            <h2 className={styles.sectionTitle}>🔧 Using Ladle for Development</h2>
            <p className={styles.paragraph}>
              Ladle provides several features to help with component development:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Isolated Testing:</strong> Develop and test components in isolation from the
                rest of the application
              </li>
              <li className={styles.listItem}>
                <strong>Interactive Controls:</strong> Use controls to test components with
                different props and configurations
              </li>
              <li className={styles.listItem}>
                <strong>Viewport Sizing:</strong> Test components at different screen sizes with the
                viewport controls
              </li>
            </ul>
          </Flex>
        </Card>

        <Card className={styles.card}>
          <Flex flexDirection="column" gap={16}>
            <h2 className={styles.sectionTitle}>💡 Creating Your Own Stories</h2>
            <p className={styles.paragraph}>To create a new component story:</p>
            <ol className={styles.list}>
              <li className={styles.listItem}>
                Create a new file named <code>[ComponentName].stories.tsx</code> next to your
                component
              </li>
              <li className={styles.listItem}>
                Export stories as named exports following the Ladle pattern
              </li>
              <li className={styles.listItem}>
                Run <code>npx ladle serve</code> to see your new story in the sidebar
              </li>
            </ol>
            <p className={styles.paragraph}>Example:</p>
            <pre className={styles.codeBlock}>
              {`import React from 'react'
import type { Story } from '@ladle/react'
import { MyComponent } from './MyComponent'

export default {
  title: 'Components/MyComponent'
}

export const Default: Story = () => <MyComponent />
export const WithData: Story = () => <MyComponent data={['Item 1', 'Item 2']} />`}
            </pre>

            <Flex flexDirection="row" justifyContent="flex-end" gap={16}>
              <Button
                variant="primary"
                onPress={() => window.open('https://www.ladle.dev/docs/', '_blank')}
              >
                Ladle Documentation
              </Button>
            </Flex>
          </Flex>
        </Card>

        <footer className={styles.footer}>
          <p>
            &copy; {new Date().getFullYear()} Gusto Embedded React SDK · Built with{' '}
            <a
              className={styles.link}
              href="https://www.ladle.dev/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ladle
            </a>
          </p>
        </footer>
      </Flex>
    </div>
  )
}
