import type { Story } from '@ladle/react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ProgressBarStoryProps {
  currentStep: number
}

export default {
  title: 'UI/Components/ProgressBar',
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 1, max: 10 },
      defaultValue: 1,
    },
  },
}
/* eslint-disable react/prop-types */
export const Default: Story<ProgressBarStoryProps> = ({ currentStep }) => {
  const { ProgressBar } = useComponentContext()

  return <ProgressBar totalSteps={10} currentStep={currentStep} label="Progress Bar" />
}
