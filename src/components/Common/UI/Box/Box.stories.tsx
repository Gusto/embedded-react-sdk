import type { StoryObj } from '@storybook/react-vite'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BoxWrapper = () => {
  const Components = useComponentContext()
  return (
    <Components.Box>
      <Components.Box.Content>
        <Components.Text>This is content inside a box.</Components.Text>
      </Components.Box.Content>
    </Components.Box>
  )
}

export default {
  title: 'UI/Components/Box',
  component: BoxWrapper,
}

type Story = StoryObj<typeof BoxWrapper>

export const Default: Story = {}

export const WithHeader: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box>
        <Components.Box.Header>
          <Components.Heading as="h3">Box Header</Components.Heading>
        </Components.Box.Header>
        <Components.Box.Content>
          <Components.Text>This is the main content area with padding.</Components.Text>
        </Components.Box.Content>
      </Components.Box>
    )
  },
}

export const WithFooter: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box>
        <Components.Box.Content>
          <Components.Text>This is the main content area with padding.</Components.Text>
        </Components.Box.Content>
        <Components.Box.Footer>
          <Components.Button variant="primary" onClick={() => {}}>
            Save
          </Components.Button>
        </Components.Box.Footer>
      </Components.Box>
    )
  },
}

export const WithAllSections: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box>
        <Components.Box.Header>
          <Components.Heading as="h3">Box Header</Components.Heading>
        </Components.Box.Header>
        <Components.Box.Content>
          <Components.Text>This is the main content area with padding.</Components.Text>
        </Components.Box.Content>
        <Components.Box.Footer>
          <Components.Button variant="primary" onClick={() => {}}>
            Save
          </Components.Button>
        </Components.Box.Footer>
      </Components.Box>
    )
  },
}

export const WithCustomClassName: Story = {
  decorators: [
    Story => (
      <>
        <style>{`.custom-box { background-color: #FFFAF2; border-color: #E9B550; }`}</style>
        <Story />
      </>
    ),
  ],
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box className="custom-box">
        <Components.Box.Content>
          <Components.Text>This box has a custom className applied.</Components.Text>
        </Components.Box.Content>
      </Components.Box>
    )
  },
}

export const FlushContent: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box>
        <Components.Box.Content variant="flush">
          <Components.Text>This content has no padding (flush variant).</Components.Text>
        </Components.Box.Content>
      </Components.Box>
    )
  },
}

export const WithEmbeddedTable: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box>
        <Components.Box.Header>
          <Components.Heading as="h3">Team Members</Components.Heading>
        </Components.Box.Header>
        <Components.Box.Content variant="flush">
          <Components.Table
            aria-label="Team members"
            variant="embedded"
            headers={[
              { key: 'name', content: 'Name' },
              { key: 'role', content: 'Role' },
              { key: 'status', content: 'Status' },
            ]}
            rows={[
              {
                key: '1',
                data: [
                  { key: 'name', content: 'Alice Johnson' },
                  { key: 'role', content: 'Engineer' },
                  { key: 'status', content: 'Active' },
                ],
              },
              {
                key: '2',
                data: [
                  { key: 'name', content: 'Bob Smith' },
                  { key: 'role', content: 'Designer' },
                  { key: 'status', content: 'Active' },
                ],
              },
              {
                key: '3',
                data: [
                  { key: 'name', content: 'Carol Davis' },
                  { key: 'role', content: 'Manager' },
                  { key: 'status', content: 'On Leave' },
                ],
              },
            ]}
          />
        </Components.Box.Content>
      </Components.Box>
    )
  },
}
