import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Breadcrumbs } from './Breadcrumbs'
import type { Breadcrumb } from './BreadcrumbsTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('Breadcrumbs', () => {
  const mockBreadcrumbs: Breadcrumb[] = [
    { key: 'step-one', label: 'step.one' },
    { key: 'step-two', label: 'step.two', namespace: 'test' },
    { key: 'step-three', label: 'step.three' },
    { key: 'step-four', label: 'step.four' },
  ]

  it('renders breadcrumbs navigation', () => {
    renderWithProviders(<Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-one" />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders all breadcrumbs', () => {
    renderWithProviders(<Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-two" />)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(4)
  })

  it('marks current breadcrumb with aria-current="step"', () => {
    renderWithProviders(<Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-two" />)
    const listItems = screen.getAllByRole('listitem')

    expect(listItems).toHaveLength(4)
    expect(listItems[0]).toHaveAttribute('aria-current', 'false')
    expect(listItems[1]).toHaveAttribute('aria-current', 'step')
    expect(listItems[2]).toHaveAttribute('aria-current', 'false')
    expect(listItems[3]).toHaveAttribute('aria-current', 'false')
  })

  it('translates breadcrumb labels using i18n keys', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-three" />,
    )

    expect(screen.getByText('step.one')).toBeInTheDocument()
    expect(screen.getByText('step.two')).toBeInTheDocument()
    expect(screen.getByText('step.three')).toBeInTheDocument()
    expect(screen.getByText('step.four')).toBeInTheDocument()
  })

  it('renders with correct accessibility attributes', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-three" />,
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Progress Breadcrumbs')
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <Breadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumb="step-two"
        className="custom-breadcrumbs"
      />,
    )

    expect(container.querySelector('.custom-breadcrumbs')).toBeInTheDocument()
  })

  it('renders CTA component when provided', () => {
    const TestCta = () => <button>Test CTA</button>
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-one" cta={TestCta} />,
    )

    expect(screen.getByText('Test CTA')).toBeInTheDocument()
  })

  it('handles single breadcrumb', () => {
    const singleBreadcrumb: Breadcrumb[] = [{ key: 'only', label: 'only.step' }]
    renderWithProviders(<Breadcrumbs breadcrumbs={singleBreadcrumb} currentBreadcrumb="only" />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(1)
    expect(listItems[0]).toHaveAttribute('aria-current', 'step')
  })

  it('handles empty breadcrumbs array', () => {
    renderWithProviders(<Breadcrumbs breadcrumbs={[]} />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('handles currentBreadcrumb not matching any breadcrumb', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="non-existent" />,
    )

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(4)
    listItems.forEach(item => {
      expect(item).toHaveAttribute('aria-current', 'false')
    })
  })

  it('handles currentBreadcrumb at beginning', () => {
    renderWithProviders(<Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-one" />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems[0]).toHaveAttribute('aria-current', 'step')
  })

  it('handles currentBreadcrumb at end', () => {
    renderWithProviders(<Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-four" />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems[3]).toHaveAttribute('aria-current', 'step')
  })

  it('makes non-current breadcrumbs clickable when onEvent is provided', () => {
    const onEvent = vi.fn()
    renderWithProviders(
      <Breadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumb="step-three"
        onEvent={onEvent}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('does not make current breadcrumb clickable', () => {
    const onEvent = vi.fn()
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-four" onEvent={onEvent} />,
    )

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('calls onEvent when clicking a non-current breadcrumb', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    renderWithProviders(
      <Breadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumb="step-three"
        onEvent={onEvent}
      />,
    )

    const buttons = screen.getAllByRole('button')
    const firstButton = buttons[0]
    expect(firstButton).toBeDefined()
    await user.click(firstButton!)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.BREADCRUMB_NAVIGATE, {
      key: 'step-one',
      onNavigate: undefined,
    })
  })

  it('does not make breadcrumbs clickable when onEvent is not provided', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumb="step-three" />,
    )

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic breadcrumbs',
        props: { breadcrumbs: mockBreadcrumbs, currentBreadcrumb: 'step-two' },
      },
      {
        name: 'breadcrumbs at start',
        props: { breadcrumbs: mockBreadcrumbs, currentBreadcrumb: 'step-one' },
      },
      {
        name: 'breadcrumbs at end',
        props: { breadcrumbs: mockBreadcrumbs, currentBreadcrumb: 'step-four' },
      },
      {
        name: 'breadcrumbs with many steps',
        props: {
          breadcrumbs: [
            { key: '1', label: 'one' },
            { key: '2', label: 'two' },
            { key: '3', label: 'three' },
            { key: '4', label: 'four' },
            { key: '5', label: 'five' },
            { key: '6', label: 'six' },
          ],
          currentBreadcrumb: '3',
        },
      },
      {
        name: 'breadcrumbs with single step',
        props: { breadcrumbs: [{ key: 'only', label: 'only.step' }], currentBreadcrumb: 'only' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Breadcrumbs {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
