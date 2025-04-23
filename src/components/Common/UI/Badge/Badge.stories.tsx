import type { Story } from '@ladle/react'
import type { BadgeProps } from './BadgeTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

const BadgeWrapper = (props: BadgeProps) => {
  const Components = useComponentContext()
  return <Components.Badge {...props} />
}

export default {
  title: 'UI/Components/Badge',
  component: BadgeWrapper,
  argTypes: {
    variant: {
      options: ['success', 'warning', 'error', 'info', undefined],
      control: { type: 'select' },
    },
    text: {
      control: { type: 'text' },
    },
    className: {
      control: { type: 'text' },
    },
    id: {
      control: { type: 'text' },
    },
    'aria-label': {
      control: { type: 'text' },
    },
  },
} as const

export const Success: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Success.args = {
  variant: 'success',
  text: 'Success',
}

export const Warning: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Warning.args = {
  variant: 'warning',
  text: 'Warning',
}

export const Error: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Error.args = {
  variant: 'error',
  text: 'Error',
}

export const Info: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Info.args = {
  variant: 'info',
  text: 'Info',
}

export const Default: Story<BadgeProps> = args => <BadgeWrapper {...args} />
Default.args = {
  text: 'Default',
}
