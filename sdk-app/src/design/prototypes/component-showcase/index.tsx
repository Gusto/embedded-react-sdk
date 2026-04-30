import { useState } from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, Flex, Grid, useDataView } from '@/components/Common'

const teamMembers = [
  {
    name: 'Alice Chen',
    role: 'Software Engineer',
    department: 'Engineering',
    startDate: '2024-01-15',
  },
  { name: 'Bob Martinez', role: 'Product Designer', department: 'Design', startDate: '2023-06-01' },
]

export function ComponentShowcase() {
  const Components = useComponentContext()
  const [textValue, setTextValue] = useState('')
  const [selectValue, setSelectValue] = useState('')

  const dataViewProps = useDataView({
    data: teamMembers,
    columns: [
      { key: 'name' as const, title: 'Name' },
      { key: 'role' as const, title: 'Role' },
      { key: 'department' as const, title: 'Department' },
      { key: 'startDate' as const, title: 'Start Date' },
    ],
  })

  return (
    <Grid gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h1">Component Showcase</Components.Heading>
        <Components.Text variant="supporting">
          A single-page prototype demonstrating the SDK component library. Use this as a reference
          for available components and their props.
        </Components.Text>
      </Flex>

      <Flex flexDirection="column" gap={12}>
        <Components.Heading as="h2">Buttons</Components.Heading>
        <Flex gap={8} alignItems="center">
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
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap={12}>
        <Components.Heading as="h2">Text Input</Components.Heading>
        <Flex flexDirection="column" gap={16}>
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
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap={12}>
        <Components.Heading as="h2">Select</Components.Heading>
        <Flex flexDirection="column" gap={8}>
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
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap={12}>
        <Components.Heading as="h2">Alerts</Components.Heading>
        <Flex flexDirection="column" gap={12}>
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
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap={12}>
        <Components.Heading as="h2">Badges</Components.Heading>
        <Flex gap={8} alignItems="center">
          <Components.Badge status="info">Info</Components.Badge>
          <Components.Badge status="success">Success</Components.Badge>
          <Components.Badge status="warning">Warning</Components.Badge>
          <Components.Badge status="error">Error</Components.Badge>
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">Typography</Components.Heading>
        <Components.Heading as="h1">Heading 1</Components.Heading>
        <Components.Heading as="h2">Heading 2</Components.Heading>
        <Components.Heading as="h3">Heading 3</Components.Heading>
        <Components.Heading as="h4">Heading 4</Components.Heading>
        <Components.Text size="lg">Text — Large</Components.Text>
        <Components.Text size="md">Text — Medium</Components.Text>
        <Components.Text size="sm">Text — Small</Components.Text>
        <Components.Text size="xs">Text — Extra Small</Components.Text>
      </Flex>

      <Flex flexDirection="column" gap={12}>
        <Components.Heading as="h2">Data View</Components.Heading>
        <Components.Box withPadding={false} header={<Components.BoxHeader title="Team Members" />}>
          <DataView label="Team members" {...dataViewProps} isWithinBox />
        </Components.Box>
      </Flex>
    </Grid>
  )
}
