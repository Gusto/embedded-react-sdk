import { action, type Story } from '@ladle/react'
import type { Breadcrumb } from './BreadcrumbsTypes'
import { Breadcrumbs } from './Breadcrumbs'

export default {
  title: 'UI/Components/Breadcrumbs',
  argTypes: {
    onClick: { action: 'Breadcrumb clicked' },
  },
}

const mockBreadcrumbs: Breadcrumb[] = [
  { id: 'configuration', label: 'Configuration' },
  { id: 'overview', label: 'Overview' },
  { id: 'review', label: 'Review' },
  { id: 'submit', label: 'Submit' },
  { id: 'complete', label: 'Complete' },
]

export const Default: Story = () => {
  return <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="configuration" />
}

export const WithThreeSteps: Story = () => {
  const threeBreadcrumbs: Breadcrumb[] = [
    { id: 'configuration', label: 'Configuration' },
    { id: 'review', label: 'Review' },
    { id: 'complete', label: 'Complete' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3>Step 1 of 3</h3>
        <Breadcrumbs
          breadcrumbs={threeBreadcrumbs}
          currentBreadcrumbId="configuration"
          onClick={action('Breadcrumb clicked')}
        />
      </div>
      <div>
        <h3>Step 2 of 3</h3>
        <Breadcrumbs
          breadcrumbs={threeBreadcrumbs}
          currentBreadcrumbId="review"
          onClick={action('Breadcrumb clicked')}
        />
      </div>
      <div>
        <h3>Step 3 of 3</h3>
        <Breadcrumbs
          breadcrumbs={threeBreadcrumbs}
          currentBreadcrumbId="complete"
          onClick={action('Breadcrumb clicked')}
        />
      </div>
    </div>
  )
}

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

  return (
    <Breadcrumbs
      breadcrumbs={manyBreadcrumbs}
      currentBreadcrumbId="employment"
      onClick={action('Breadcrumb clicked')}
    />
  )
}

export const WithoutClick: Story = () => {
  return <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="overview" />
}

export const WithCustomClassName: Story = () => {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
      <Breadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumbId="review"
        className="custom-breadcrumbs"
        onClick={action('Breadcrumb clicked')}
      />
    </div>
  )
}
