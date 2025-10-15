import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProgressBreadcrumbs } from './ProgressBreadcrumbs'
import type { BreadcrumbStep } from './ProgressBreadcrumbsTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('ProgressBreadcrumbs', () => {
  const mockSteps: BreadcrumbStep[] = [
    { key: 'step-one', label: 'step.one' },
    { key: 'step-two', label: 'step.two', namespace: 'test' },
    { key: 'step-three', label: 'step.three' },
    { key: 'step-four', label: 'step.four' },
  ]

  it('renders breadcrumbs navigation', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={1} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders steps up to current step', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={2} />)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)
  })

  it('marks current step with aria-current="step"', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={2} />)
    const listItems = screen.getAllByRole('listitem')

    expect(listItems).toHaveLength(2)
    expect(listItems[0]).not.toHaveAttribute('aria-current')
    expect(listItems[1]).toHaveAttribute('aria-current', 'step')
  })

  it('translates step labels using i18n keys', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={3} />)

    expect(screen.getByText('step.one')).toBeInTheDocument()
    expect(screen.getByText('step.two')).toBeInTheDocument()
    expect(screen.getByText('step.three')).toBeInTheDocument()
    expect(screen.queryByText('step.four')).not.toBeInTheDocument()
  })

  it('renders with correct accessibility attributes', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={3} />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Progress Breadcrumbs')
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <ProgressBreadcrumbs steps={mockSteps} currentStep={2} className="custom-breadcrumbs" />,
    )

    expect(container.querySelector('.custom-breadcrumbs')).toBeInTheDocument()
  })

  it('renders CTA component when provided', () => {
    const TestCta = () => <button>Test CTA</button>
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={1} cta={TestCta} />)

    expect(screen.getByText('Test CTA')).toBeInTheDocument()
  })

  it('handles single step', () => {
    const singleStep: BreadcrumbStep[] = [{ key: 'only', label: 'only.step' }]
    renderWithProviders(<ProgressBreadcrumbs steps={singleStep} currentStep={1} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(1)
    expect(listItems[0]).toHaveAttribute('aria-current', 'step')
  })

  it('handles empty steps array', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={[]} currentStep={1} />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('handles current step beyond steps length', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={10} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(4)
    const currentItem = listItems.find(item => item.hasAttribute('aria-current'))
    expect(currentItem).toBeUndefined()
  })

  it('handles current step at beginning', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={1} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems[0]).toHaveAttribute('aria-current', 'step')
  })

  it('handles current step at end', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={4} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems[3]).toHaveAttribute('aria-current', 'step')
  })

  it('makes previous steps clickable when onEvent is provided', () => {
    const onEvent = vi.fn()
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={3} onEvent={onEvent} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('does not make last rendered step clickable', () => {
    const onEvent = vi.fn()
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={4} onEvent={onEvent} />)

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('calls onEvent when clicking a previous step', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={3} onEvent={onEvent} />)

    const firstButton = screen.getAllByRole('button')[0]
    await user.click(firstButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.BREADCRUMB_NAVIGATE, { key: 'step-one' })
  })

  it('does not make steps clickable when onEvent is not provided', () => {
    renderWithProviders(<ProgressBreadcrumbs steps={mockSteps} currentStep={3} />)

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic breadcrumbs',
        props: { steps: mockSteps, currentStep: 2 },
      },
      {
        name: 'breadcrumbs at start',
        props: { steps: mockSteps, currentStep: 1 },
      },
      {
        name: 'breadcrumbs at end',
        props: { steps: mockSteps, currentStep: 4 },
      },
      {
        name: 'breadcrumbs with many steps',
        props: {
          steps: [
            { key: '1', label: 'one' },
            { key: '2', label: 'two' },
            { key: '3', label: 'three' },
            { key: '4', label: 'four' },
            { key: '5', label: 'five' },
            { key: '6', label: 'six' },
          ],
          currentStep: 3,
        },
      },
      {
        name: 'breadcrumbs with single step',
        props: { steps: [{ key: 'only', label: 'only.step' }], currentStep: 1 },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<ProgressBreadcrumbs {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
