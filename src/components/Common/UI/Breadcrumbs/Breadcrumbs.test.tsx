import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Breadcrumbs } from './Breadcrumbs'
import type { Breadcrumb } from './BreadcrumbsTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Breadcrumbs', () => {
  const mockBreadcrumbs: Breadcrumb[] = [
    { id: 'step-one', label: 'Step One' },
    { id: 'step-two', label: 'Step Two' },
    { id: 'step-three', label: 'Step Three' },
    { id: 'step-four', label: 'Step Four' },
  ]

  it('renders breadcrumbs navigation', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="step-one" />,
    )
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders all breadcrumbs', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="step-two" />,
    )
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(4)
  })

  it('marks current breadcrumb with aria-current="step"', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="step-two" />,
    )
    const listItems = screen.getAllByRole('listitem')

    expect(listItems).toHaveLength(4)
    expect(listItems[0]).toHaveAttribute('aria-current', 'false')
    expect(listItems[1]).toHaveAttribute('aria-current', 'step')
    expect(listItems[2]).toHaveAttribute('aria-current', 'false')
    expect(listItems[3]).toHaveAttribute('aria-current', 'false')
  })

  it('renders breadcrumb labels', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="step-three" />,
    )

    expect(screen.getByText('Step One')).toBeInTheDocument()
    expect(screen.getByText('Step Two')).toBeInTheDocument()
    expect(screen.getByText('Step Three')).toBeInTheDocument()
    expect(screen.getByText('Step Four')).toBeInTheDocument()
  })

  it('renders with correct accessibility attributes', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="step-three" />,
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumbs')
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <Breadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumbId="step-two"
        className="custom-breadcrumbs"
      />,
    )

    expect(container.querySelector('.custom-breadcrumbs')).toBeInTheDocument()
  })

  it('handles single breadcrumb', () => {
    const singleBreadcrumb: Breadcrumb[] = [{ id: 'only', label: 'Only Step' }]
    renderWithProviders(<Breadcrumbs breadcrumbs={singleBreadcrumb} currentBreadcrumbId="only" />)

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

  it('handles currentBreadcrumbId not matching any breadcrumb', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="non-existent" />,
    )

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(4)
    listItems.forEach(item => {
      expect(item).toHaveAttribute('aria-current', 'false')
    })
  })

  it('handles currentBreadcrumbId at beginning', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="step-one" />,
    )

    const listItems = screen.getAllByRole('listitem')
    expect(listItems[0]).toHaveAttribute('aria-current', 'step')
  })

  it('handles currentBreadcrumbId at end', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="step-four" />,
    )

    const listItems = screen.getAllByRole('listitem')
    expect(listItems[3]).toHaveAttribute('aria-current', 'step')
  })

  it('makes non-current breadcrumbs clickable when onClick is provided', () => {
    const onClick = vi.fn()
    renderWithProviders(
      <Breadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumbId="step-three"
        onClick={onClick}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('does not make current breadcrumb clickable', () => {
    const onClick = vi.fn()
    renderWithProviders(
      <Breadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumbId="step-four"
        onClick={onClick}
      />,
    )

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('calls onClick when clicking a non-current breadcrumb', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(
      <Breadcrumbs
        breadcrumbs={mockBreadcrumbs}
        currentBreadcrumbId="step-three"
        onClick={onClick}
      />,
    )

    const buttons = screen.getAllByRole('button')
    const firstButton = buttons[0]
    expect(firstButton).toBeDefined()
    await user.click(firstButton!)

    expect(onClick).toHaveBeenCalledWith('step-one')
  })

  it('does not make breadcrumbs clickable when onClick is not provided', () => {
    renderWithProviders(
      <Breadcrumbs breadcrumbs={mockBreadcrumbs} currentBreadcrumbId="step-three" />,
    )

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic breadcrumbs',
        props: { breadcrumbs: mockBreadcrumbs, currentBreadcrumbId: 'step-two' },
      },
      {
        name: 'breadcrumbs at start',
        props: { breadcrumbs: mockBreadcrumbs, currentBreadcrumbId: 'step-one' },
      },
      {
        name: 'breadcrumbs at end',
        props: { breadcrumbs: mockBreadcrumbs, currentBreadcrumbId: 'step-four' },
      },
      {
        name: 'breadcrumbs with many steps',
        props: {
          breadcrumbs: [
            { id: '1', label: 'One' },
            { id: '2', label: 'Two' },
            { id: '3', label: 'Three' },
            { id: '4', label: 'Four' },
            { id: '5', label: 'Five' },
            { id: '6', label: 'Six' },
          ],
          currentBreadcrumbId: '3',
        },
      },
      {
        name: 'breadcrumbs with single step',
        props: { breadcrumbs: [{ id: 'only', label: 'Only Step' }], currentBreadcrumbId: 'only' },
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
