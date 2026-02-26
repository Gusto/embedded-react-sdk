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
