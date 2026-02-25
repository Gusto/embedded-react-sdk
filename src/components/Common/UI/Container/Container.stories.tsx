import type { StoryObj } from '@storybook/react-vite'
import type { ContainerProps } from './ContainerTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const ContainerWrapper = (args: Omit<ContainerProps, 'children'>) => {
  const Components = useComponentContext()
  return (
    <Components.Container {...args}>
      <Components.Text>This is content inside a container.</Components.Text>
    </Components.Container>
  )
}

export default {
  title: 'UI/Components/Container',
  component: ContainerWrapper,
}

type Story = StoryObj<typeof ContainerWrapper>

export const Default: Story = {
  args: {},
}

export const WithCustomClassName: Story = {
  args: {
    className: 'custom-container',
  },
}
