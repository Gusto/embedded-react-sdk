import type { StoryObj, Meta } from '@storybook/react'
import type { BadgeProps } from './BadgeTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BadgeWrapper = (props: BadgeProps) => {
  const Components = useComponentContext()
  return <Components.Badge {...props} />
}

const meta: Meta<typeof BadgeWrapper> = {
  title: 'UI/Components/Badge',
  component: BadgeWrapper,
}
export default meta

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
