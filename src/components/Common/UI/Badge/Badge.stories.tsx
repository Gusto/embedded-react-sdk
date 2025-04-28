import type { Story } from '@ladle/react'
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

export const Success: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Success.args = {
  status: 'success',
  children: 'Success',
}

export const Warning: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Warning.args = {
  status: 'warning',
  children: 'Warning',
}

export const Error: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Error.args = {
  status: 'error',
  children: 'Error',
}

export const Info: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Info.args = {
  status: 'info',
  children: 'Info',
}

export const Default: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Default.args = {
  children: 'Default',
}
