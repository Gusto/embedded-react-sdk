import type { StoryObj } from '@storybook/react-vite'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

const BoxWrapper = () => {
  const Components = useComponentContext()
  return (
    <Components.Box>
      <Components.Text>This is content inside a box.</Components.Text>
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
      <Components.Box header={<Components.Heading as="h3">Box Header</Components.Heading>}>
        <Components.Text>This is the main content area with padding.</Components.Text>
      </Components.Box>
    )
  },
}

export const WithFooter: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box
        footer={
          <Components.Button variant="primary" onClick={() => {}}>
            Save
          </Components.Button>
        }
      >
        <Components.Text>This is the main content area with padding.</Components.Text>
      </Components.Box>
    )
  },
}

export const WithAllSections: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box
        header={
          <Flex flexDirection="row" gap={16} justifyContent="space-between" alignItems="center">
            <Flex flexDirection="column" gap={4}>
              <Components.Heading as="h3">Box Header</Components.Heading>
              <Components.Text variant="supporting">
                This is a super cool description of the box header.
              </Components.Text>
            </Flex>
            <Components.Button variant="secondary" onClick={() => {}}>
              <PlusCircleIcon />
              Do a thing
            </Components.Button>
          </Flex>
        }
        footer={
          <Components.Button variant="secondary" onClick={() => {}}>
            Add another something
          </Components.Button>
        }
      >
        <Components.Alert label="Woah! Check it out! An alert inside a box!" status="info" />
        There is so much we can do here!
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
        <Components.Text>This box has a custom className applied.</Components.Text>
      </Components.Box>
    )
  },
}

export const FlushContent: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box withPadding={false}>
        <Components.Text>This content has no padding (flush variant).</Components.Text>
      </Components.Box>
    )
  },
}

export const WithEmbeddedTable: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box
        header={<Components.Heading as="h3">Team Members</Components.Heading>}
        withPadding={false}
      >
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
      </Components.Box>
    )
  },
}
