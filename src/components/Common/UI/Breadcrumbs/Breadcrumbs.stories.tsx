import type { Story } from '@ladle/react'
import type { Breadcrumb } from './BreadcrumbsTypes'
import { Breadcrumbs } from './Breadcrumbs'

interface BreadcrumbsStoryProps {
  currentBreadcrumbIndex: number
}

export default {
  title: 'UI/Components/Breadcrumbs',
  argTypes: {
    currentBreadcrumbIndex: {
      control: { type: 'number', min: 0, max: 4 },
      defaultValue: 0,
    },
  },
}

const mockBreadcrumbs: Breadcrumb[] = [
  { id: 'configuration', label: 'Configuration' },
  { id: 'overview', label: 'Overview' },
  { id: 'review', label: 'Review' },
  { id: 'submit', label: 'Submit' },
  { id: 'complete', label: 'Complete' },
]

/* eslint-disable react/prop-types, no-console */
export const Default: Story<BreadcrumbsStoryProps> = ({ currentBreadcrumbIndex }) => {
  const handleClick = (id: string) => {
    console.log('Breadcrumb clicked:', id)
  }

  return (
    <Breadcrumbs
      breadcrumbs={mockBreadcrumbs}
      currentBreadcrumbId={mockBreadcrumbs[currentBreadcrumbIndex]?.id}
      onClick={handleClick}
    />
  )
}

/* eslint-disable no-console */
export const WithThreeSteps: Story = () => {
  const threeBreadcrumbs: Breadcrumb[] = [
    { id: 'configuration', label: 'Configuration' },
    { id: 'review', label: 'Review' },
    { id: 'complete', label: 'Complete' },
  ]

  const handleClick = (id: string) => {
    console.log('Breadcrumb clicked:', id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3>Step 1 of 3</h3>
        <Breadcrumbs
          breadcrumbs={threeBreadcrumbs}
          currentBreadcrumbId="configuration"
          onClick={handleClick}
        />
      </div>
      <div>
        <h3>Step 2 of 3</h3>
        <Breadcrumbs
          breadcrumbs={threeBreadcrumbs}
          currentBreadcrumbId="review"
          onClick={handleClick}
        />
      </div>
      <div>
        <h3>Step 3 of 3</h3>
        <Breadcrumbs
          breadcrumbs={threeBreadcrumbs}
          currentBreadcrumbId="complete"
          onClick={handleClick}
        />
      </div>
    </div>
  )
}

/* eslint-disable no-console */
export const WithManySteps: Story = () => {
  const manyBreadcrumbs: Breadcrumb[] = [
    { id: 'start', label: 'Start' },
    { id: 'personal', label: 'Personal Info' },
    { id: 'address', label: 'Address' },
    { id: 'employment', label: 'Employment' },
    { id: 'taxes', label: 'Taxes' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'review', label: 'Review' },
    { id: 'complete', label: 'Complete' },
  ]

  const handleClick = (id: string) => {
    console.log('Breadcrumb clicked:', id)
  }

  return (
    <Breadcrumbs
      breadcrumbs={manyBreadcrumbs}
      currentBreadcrumbId="employment"
      onClick={handleClick}
    />
  )
}

export const WithoutClick: Story = () => {
  return <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="overview" />
}

/* eslint-disable no-console */
export const WithCustomClassName: Story = () => {
  const handleClick = (id: string) => {
    console.log('Breadcrumb clicked:', id)
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
      <Breadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumbId="review"
        className="custom-breadcrumbs"
        onClick={handleClick}
      />
    </div>
  )
}
