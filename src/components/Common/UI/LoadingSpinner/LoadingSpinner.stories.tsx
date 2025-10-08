import type { Story } from '@ladle/react'
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

export const Large: Story<LoadingSpinnerProps> = args => <LoadingSpinnerWrapper {...args} />
Large.args = {
  size: 'lg',
  style: 'block',
}

export const Small: Story<LoadingSpinnerProps> = args => <LoadingSpinnerWrapper {...args} />
Small.args = {
  size: 'sm',
  style: 'block',
}

export const Inline: Story<LoadingSpinnerProps> = args => (
  <div>
    Loading <LoadingSpinnerWrapper {...args} /> please wait...
  </div>
)
Inline.args = {
  size: 'sm',
  style: 'inline',
}

export const Block: Story<LoadingSpinnerProps> = args => <LoadingSpinnerWrapper {...args} />
Block.args = {
  size: 'lg',
  style: 'block',
}
