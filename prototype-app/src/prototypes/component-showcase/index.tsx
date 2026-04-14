import { useState } from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function ComponentShowcase() {
  const Components = useComponentContext()
  const [textValue, setTextValue] = useState('')
  const [selectValue, setSelectValue] = useState('')

  return (
    <div style={{ maxWidth: '48rem' }}>
      <Components.Heading as="h1">Component Showcase</Components.Heading>
      <Components.Text>
        A single-page prototype demonstrating the SDK component library. Use this as a reference for
        available components and their props.
      </Components.Text>

      {/* Buttons */}
      <section style={{ marginTop: '2rem' }}>
        <Components.Heading as="h2">Buttons</Components.Heading>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Components.Button variant="primary">Primary</Components.Button>
          <Components.Button variant="secondary">Secondary</Components.Button>
          <Components.Button variant="tertiary">Tertiary</Components.Button>
          <Components.Button variant="error">Error</Components.Button>
          <Components.Button variant="primary" isDisabled>
            Disabled
          </Components.Button>
          <Components.Button variant="primary" isLoading>
            Loading
          </Components.Button>
        </div>
      </section>

      {/* Text Input */}
      <section style={{ marginTop: '2rem' }}>
        <Components.Heading as="h2">Text Input</Components.Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '24rem' }}>
          <Components.TextInput
            label="Full name"
            placeholder="Jane Doe"
            value={textValue}
            onChange={setTextValue}
          />
          <Components.TextInput label="With error" isInvalid value="" onChange={() => {}} />
          <Components.TextInput
            label="Disabled"
            isDisabled
            value="Cannot edit"
            onChange={() => {}}
          />
        </div>
      </section>

      {/* Select */}
      <section style={{ marginTop: '2rem' }}>
        <Components.Heading as="h2">Select</Components.Heading>
        <div style={{ maxWidth: '24rem' }}>
          <Components.Select
            label="Department"
            options={[
              { value: 'eng', label: 'Engineering' },
              { value: 'design', label: 'Design' },
              { value: 'product', label: 'Product' },
              { value: 'marketing', label: 'Marketing' },
            ]}
            value={selectValue}
            onChange={setSelectValue}
          />
          {selectValue && <Components.Text size="sm">Selected: {selectValue}</Components.Text>}
        </div>
      </section>

      {/* Alerts */}
      <section style={{ marginTop: '2rem' }}>
        <Components.Heading as="h2">Alerts</Components.Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Components.Alert status="info" label="This is an info alert" disableScrollIntoView />
          <Components.Alert
            status="success"
            label="This is a success alert"
            disableScrollIntoView
          />
          <Components.Alert
            status="warning"
            label="This is a warning alert"
            disableScrollIntoView
          />
          <Components.Alert status="error" label="This is an error alert" disableScrollIntoView />
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginTop: '2rem' }}>
        <Components.Heading as="h2">Badges</Components.Heading>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Components.Badge status="info">Info</Components.Badge>
          <Components.Badge status="success">Success</Components.Badge>
          <Components.Badge status="warning">Warning</Components.Badge>
          <Components.Badge status="error">Error</Components.Badge>
        </div>
      </section>

      {/* Typography */}
      <section style={{ marginTop: '2rem' }}>
        <Components.Heading as="h2">Typography</Components.Heading>
        <Components.Heading as="h1">Heading 1</Components.Heading>
        <Components.Heading as="h2">Heading 2</Components.Heading>
        <Components.Heading as="h3">Heading 3</Components.Heading>
        <Components.Heading as="h4">Heading 4</Components.Heading>
        <Components.Text size="lg">Text — Large</Components.Text>
        <Components.Text size="md">Text — Medium</Components.Text>
        <Components.Text size="sm">Text — Small</Components.Text>
        <Components.Text size="xs">Text — Extra Small</Components.Text>
      </section>
    </div>
  )
}
