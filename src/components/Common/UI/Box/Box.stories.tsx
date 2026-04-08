import type { StoryObj } from '@storybook/react-vite'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import { Flex } from '@/components/Common/Flex'

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
      <Components.Box
        header={
          <Components.BoxHeader
            title="Hello World"
            description="This is a description of the box header."
            action={
              <Components.Button variant="secondary" onClick={() => {}}>
                Do a thing
              </Components.Button>
            }
          />
        }
      >
        <Components.Text>This is the main content area with padding.</Components.Text>
      </Components.Box>
    )
  },
}

export const WithCustomHeader: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.Box
        header={
          <Flex flexDirection="column" gap={16}>
            <Components.Heading as="h3">Hello world</Components.Heading>
            <Components.Button variant="secondary" onClick={() => {}}>
              Do a thing
            </Components.Button>
          </Flex>
        }
      >
        This is content inside a box.
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
          <Components.BoxHeader
            title="Box Header"
            description="This is a super cool description of the box header."
            action={
              <Components.Button variant="secondary" onClick={() => {}}>
                <PlusCircleIcon />
                Do a thing
              </Components.Button>
            }
          />
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
          isWithinBox
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
