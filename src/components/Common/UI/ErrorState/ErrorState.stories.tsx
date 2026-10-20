import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { ErrorStateProps } from '@/components/Common/UI/ErrorState/ErrorStateTypes'

const ErrorStateWrapper = (props: ErrorStateProps) => {
  const Components = useComponentContext()
  return <Components.ErrorState {...props} />
}

const meta: Meta<typeof ErrorStateWrapper> = {
  title: 'UI/Components/ErrorState',
  component: ErrorStateWrapper,
}

export default meta

type Story = StoryObj<typeof ErrorStateWrapper>

export const TitleOnly: Story = {
  args: {
    title: 'This payroll has changed',
  },
}

export const WithDescription: Story = {
  args: {
    title: 'This payroll has changed',
    description: 'Refresh or return to your payrolls to continue.',
  },
}

export const WithAction: Story = {
  args: {
    title: 'This payroll has changed',
    description: 'Refresh or return to your payrolls to continue.',
    action: { label: 'Back to payrolls', onClick: fn() },
  },
}

export const LongCopy: Story = {
  args: {
    title: 'We couldn’t load this page because something changed while it was open',
    description:
      'Another session may have updated or cancelled this record. Return to the previous page to see its current status, then try again. If the problem persists, contact support.',
    action: { label: 'Back to payrolls', onClick: fn() },
  },
}
