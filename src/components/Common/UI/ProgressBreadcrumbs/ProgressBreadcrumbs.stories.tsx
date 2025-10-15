import type { Story } from '@ladle/react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { BreadcrumbStep } from './ProgressBreadcrumbsTypes'

interface ProgressBreadcrumbsStoryProps {
  currentStep: number
}

export default {
  title: 'UI/Components/ProgressBreadcrumbs',
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 1, max: 5 },
      defaultValue: 1,
    },
  },
}

const mockSteps: BreadcrumbStep[] = [
  { key: 'configuration', label: 'configuration.title', namespace: 'payroll' },
  { key: 'overview', label: 'overview.title', namespace: 'payroll' },
  { key: 'review', label: 'review.title', namespace: 'payroll' },
  { key: 'submit', label: 'submit.title', namespace: 'payroll' },
  { key: 'complete', label: 'complete.title', namespace: 'payroll' },
]

/* eslint-disable react/prop-types */
export const Default: Story<ProgressBreadcrumbsStoryProps> = ({ currentStep }) => {
  const { ProgressBreadcrumbs } = useComponentContext()

  const handleEvent = (eventType: string, payload: { key: string }) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return <ProgressBreadcrumbs steps={mockSteps} currentStep={currentStep} onEvent={handleEvent} />
}

export const WithThreeSteps: Story = () => {
  const { ProgressBreadcrumbs } = useComponentContext()

  const threeSteps: BreadcrumbStep[] = [
    { key: 'configuration', label: 'step.configuration' },
    { key: 'review', label: 'step.review' },
    { key: 'complete', label: 'step.complete' },
  ]

  const handleEvent = (eventType: string, payload: { key: string }) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3>Step 1 of 3</h3>
        <ProgressBreadcrumbs steps={threeSteps} currentStep={1} onEvent={handleEvent} />
      </div>
      <div>
        <h3>Step 2 of 3</h3>
        <ProgressBreadcrumbs steps={threeSteps} currentStep={2} onEvent={handleEvent} />
      </div>
      <div>
        <h3>Step 3 of 3</h3>
        <ProgressBreadcrumbs steps={threeSteps} currentStep={3} onEvent={handleEvent} />
      </div>
    </div>
  )
}

export const WithManySteps: Story = () => {
  const { ProgressBreadcrumbs } = useComponentContext()

  const manySteps: BreadcrumbStep[] = [
    { key: 'start', label: 'step.start' },
    { key: 'personal', label: 'step.personal' },
    { key: 'address', label: 'step.address' },
    { key: 'employment', label: 'step.employment' },
    { key: 'taxes', label: 'step.taxes' },
    { key: 'benefits', label: 'step.benefits' },
    { key: 'review', label: 'step.review' },
    { key: 'complete', label: 'step.complete' },
  ]

  const handleEvent = (eventType: string, payload: { key: string }) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return <ProgressBreadcrumbs steps={manySteps} currentStep={4} onEvent={handleEvent} />
}

export const WithCTA: Story = () => {
  const { ProgressBreadcrumbs, Button } = useComponentContext()

  const TestCta = () => (
    <Button variant="text" onClick={() => alert('CTA clicked')}>
      Save & Exit
    </Button>
  )

  const handleEvent = (eventType: string, payload: { key: string }) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return (
    <ProgressBreadcrumbs steps={mockSteps} currentStep={2} cta={TestCta} onEvent={handleEvent} />
  )
}

export const WithCustomClassName: Story = () => {
  const { ProgressBreadcrumbs } = useComponentContext()

  const handleEvent = (eventType: string, payload: { key: string }) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
      <ProgressBreadcrumbs
        steps={mockSteps}
        currentStep={3}
        className="custom-breadcrumbs"
        onEvent={handleEvent}
      />
    </div>
  )
}
