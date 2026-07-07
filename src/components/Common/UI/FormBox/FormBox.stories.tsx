import type { StoryObj } from '@storybook/react-vite'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import { Flex } from '@/components/Common/Flex'

const FormBoxWrapper = () => {
  const Components = useComponentContext()
  return (
    <Components.FormBox>
      <Components.Text>This is content inside a form box.</Components.Text>
    </Components.FormBox>
  )
}

export default {
  title: 'UI/Components/FormBox',
  component: FormBoxWrapper,
}

type Story = StoryObj<typeof FormBoxWrapper>

export const Default: Story = {}

export const WithHeader: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.FormBox
        header={
          <Components.BoxHeader
            title="Hello World"
            description="This is a description of the form box header."
            action={
              <Components.Button variant="secondary" onClick={() => {}}>
                Do a thing
              </Components.Button>
            }
          />
        }
      >
        <Components.Text>This is the main content area with padding.</Components.Text>
      </Components.FormBox>
    )
  },
}

export const WithCustomHeader: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.FormBox
        header={
          <Flex flexDirection="column" gap={16}>
            <Components.Heading as="h3">Hello world</Components.Heading>
            <Components.Button variant="secondary" onClick={() => {}}>
              Do a thing
            </Components.Button>
          </Flex>
        }
      >
        This is content inside a form box.
      </Components.FormBox>
    )
  },
}

export const WithHeaderAndContent: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.FormBox
        header={
          <Components.BoxHeader
            title="Form Box Header"
            description="This is a super cool description of the form box header."
            action={
              <Components.Button variant="secondary" onClick={() => {}}>
                <PlusCircleIcon />
                Do a thing
              </Components.Button>
            }
          />
        }
      >
        <Components.Alert label="Woah! Check it out! An alert inside a form box!" status="info" />
        There is so much we can do here!
      </Components.FormBox>
    )
  },
}

export const WithCustomClassName: Story = {
  decorators: [
    Story => (
      <>
        <style>{`.custom-form-box { background-color: #FFFAF2; border-color: #E9B550; }`}</style>
        <Story />
      </>
    ),
  ],
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.FormBox className="custom-form-box">
        <Components.Text>This form box has a custom className applied.</Components.Text>
      </Components.FormBox>
    )
  },
}

export const FlushContent: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.FormBox withPadding={false}>
        <Components.Text>This content has no padding (flush variant).</Components.Text>
      </Components.FormBox>
    )
  },
}

export const WithEmbeddedTable: Story = {
  render: () => {
    const Components = useComponentContext()
    return (
      <Components.FormBox
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
      </Components.FormBox>
    )
  },
}
