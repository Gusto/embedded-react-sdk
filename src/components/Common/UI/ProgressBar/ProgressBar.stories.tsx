import type { StoryObj } from '@storybook/react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ProgressBarStoryProps {
  currentStep: number
}

const ProgressBarWrapper = ({ currentStep }: ProgressBarStoryProps) => {
  const { ProgressBar } = useComponentContext()
  return <ProgressBar totalSteps={10} currentStep={currentStep} label="Progress Bar" />
}

export default {
  title: 'UI/Components/ProgressBar',
  component: ProgressBarWrapper,
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 1, max: 10 },
    },
  },
}

type Story = StoryObj<typeof ProgressBarWrapper>

export const Default: Story = {
  args: {
    currentStep: 1,
  },
}
