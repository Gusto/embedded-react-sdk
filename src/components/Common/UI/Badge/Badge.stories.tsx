import type { StoryObj } from '@storybook/react-vite'
import type { BadgeProps } from './BadgeTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BadgeWrapper = (props: BadgeProps) => {
  const Components = useComponentContext()
  return <Components.Badge {...props} />
}

export default {
  title: 'UI/Components/Badge',
  component: BadgeWrapper,
}

type Story = StoryObj<typeof BadgeWrapper>

export const Success: Story = {
  args: {
    status: 'success',
    children: 'Success',
  },
}

export const Warning: Story = {
  args: {
    status: 'warning',
    children: 'Warning',
  },
}

export const Error: Story = {
  args: {
    status: 'error',
    children: 'Error',
  },
}

export const Info: Story = {
  args: {
    status: 'info',
    children: 'Info',
  },
}
