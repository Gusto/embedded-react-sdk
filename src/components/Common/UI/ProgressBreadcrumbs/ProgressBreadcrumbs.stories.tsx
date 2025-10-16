import type { Story } from '@ladle/react'
import type { Breadcrumb } from './ProgressBreadcrumbsTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ProgressBreadcrumbsStoryProps {
  currentBreadcrumbIndex: number
}

export default {
  title: 'UI/Components/ProgressBreadcrumbs',
  argTypes: {
    currentBreadcrumbIndex: {
      control: { type: 'number', min: 0, max: 4 },
      defaultValue: 0,
    },
  },
}

const mockBreadcrumbs: Breadcrumb[] = [
  { key: 'configuration', label: 'configuration.title', namespace: 'payroll' },
  { key: 'overview', label: 'overview.title', namespace: 'payroll' },
  { key: 'review', label: 'review.title', namespace: 'payroll' },
  { key: 'submit', label: 'submit.title', namespace: 'payroll' },
  { key: 'complete', label: 'complete.title', namespace: 'payroll' },
]

/* eslint-disable react/prop-types, no-console */
export const Default: Story<ProgressBreadcrumbsStoryProps> = ({ currentBreadcrumbIndex }) => {
  const { ProgressBreadcrumbs } = useComponentContext()

  const handleEvent = (eventType: string, payload: unknown) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return (
    <ProgressBreadcrumbs
      breadcrumbs={mockBreadcrumbs}
      currentBreadcrumb={mockBreadcrumbs[currentBreadcrumbIndex]?.key}
      onEvent={handleEvent}
    />
  )
}

/* eslint-disable no-console */
export const WithThreeSteps: Story = () => {
  const { ProgressBreadcrumbs } = useComponentContext()

  const threeBreadcrumbs: Breadcrumb[] = [
    { key: 'configuration', label: 'step.configuration' },
    { key: 'review', label: 'step.review' },
    { key: 'complete', label: 'step.complete' },
  ]

  const handleEvent = (eventType: string, payload: unknown) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3>Step 1 of 3</h3>
        <ProgressBreadcrumbs
          breadcrumbs={threeBreadcrumbs}
          currentBreadcrumb="configuration"
          onEvent={handleEvent}
        />
      </div>
      <div>
        <h3>Step 2 of 3</h3>
        <ProgressBreadcrumbs
          breadcrumbs={threeBreadcrumbs}
          currentBreadcrumb="review"
          onEvent={handleEvent}
        />
      </div>
      <div>
        <h3>Step 3 of 3</h3>
        <ProgressBreadcrumbs
          breadcrumbs={threeBreadcrumbs}
          currentBreadcrumb="complete"
          onEvent={handleEvent}
        />
      </div>
    </div>
  )
}

/* eslint-disable no-console */
export const WithManySteps: Story = () => {
  const { ProgressBreadcrumbs } = useComponentContext()

  const manyBreadcrumbs: Breadcrumb[] = [
    { key: 'start', label: 'step.start' },
    { key: 'personal', label: 'step.personal' },
    { key: 'address', label: 'step.address' },
    { key: 'employment', label: 'step.employment' },
    { key: 'taxes', label: 'step.taxes' },
    { key: 'benefits', label: 'step.benefits' },
    { key: 'review', label: 'step.review' },
    { key: 'complete', label: 'step.complete' },
  ]

  const handleEvent = (eventType: string, payload: unknown) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return (
    <ProgressBreadcrumbs
      breadcrumbs={manyBreadcrumbs}
      currentBreadcrumb="employment"
      onEvent={handleEvent}
    />
  )
}

/* eslint-disable no-console */
export const WithCTA: Story = () => {
  const { ProgressBreadcrumbs, Button } = useComponentContext()

  const TestCta = () => (
    <Button
      variant="tertiary"
      onClick={() => {
        alert('CTA clicked')
      }}
    >
      Save & Exit
    </Button>
  )

  const handleEvent = (eventType: string, payload: unknown) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return (
    <ProgressBreadcrumbs
      breadcrumbs={mockBreadcrumbs}
      currentBreadcrumb="overview"
      cta={TestCta}
      onEvent={handleEvent}
    />
  )
}

/* eslint-disable no-console */
export const WithCustomClassName: Story = () => {
  const { ProgressBreadcrumbs } = useComponentContext()

  const handleEvent = (eventType: string, payload: unknown) => {
    console.log('Breadcrumb clicked:', eventType, payload)
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
      <ProgressBreadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumb="review"
        className="custom-breadcrumbs"
        onEvent={handleEvent}
      />
    </div>
  )
}
