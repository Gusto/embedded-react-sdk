import type { StoryObj } from '@storybook/react-vite'
import type { BoxProps } from './BoxTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BoxWrapper = (args: Omit<BoxProps, 'children'>) => {
  const Components = useComponentContext()
  return (
    <Components.Box {...args}>
      <Components.Text>This is content inside a box.</Components.Text>
    </Components.Box>
  )
}

export default {
  title: 'UI/Components/Box',
  component: BoxWrapper,
}

type Story = StoryObj<typeof BoxWrapper>

export const Default: Story = {
  args: {},
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

export const WithCustomClassName: Story = {
  decorators: [
    Story => (
      <>
        <style>{`.custom-box { background-color: #FFFAF2; border-color: #E9B550; }`}</style>
        <Story />
      </>
    ),
  ],
  args: {
    className: 'custom-box',
  },
}
