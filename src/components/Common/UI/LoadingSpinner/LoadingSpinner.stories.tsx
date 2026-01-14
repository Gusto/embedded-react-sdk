import type { StoryObj } from '@storybook/react-vite'
import type { LoadingSpinnerProps } from './LoadingSpinnerTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const LoadingSpinnerWrapper = (props: LoadingSpinnerProps) => {
  const Components = useComponentContext()
  return <Components.LoadingSpinner {...props} />
}

export default {
  title: 'UI/Components/LoadingSpinner',
  component: LoadingSpinnerWrapper,
}

type Story = StoryObj<typeof LoadingSpinnerWrapper>

export const Large: Story = {
  args: {
    size: 'lg',
    style: 'block',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    style: 'block',
  },
}

export const Inline: Story = {
  args: {
    size: 'sm',
    style: 'inline',
  },
  render: args => (
    <div>
      Loading <LoadingSpinnerWrapper {...args} /> please wait...
    </div>
  ),
}

export const Block: Story = {
  args: {
    size: 'lg',
    style: 'block',
  },
}
