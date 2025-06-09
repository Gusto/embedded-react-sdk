import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Heading } from './Heading'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Heading', () => {
  it('renders with correct heading level', () => {
    renderWithProviders(<Heading as="h2">Test Heading</Heading>)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.getByText('Test Heading')).toBeInTheDocument()
  })

  it('renders with default h1', () => {
    renderWithProviders(<Heading as="h1">Default Heading</Heading>)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <Heading as="h2" className="custom-heading">
        Styled Heading
      </Heading>,
    )
    expect(container.querySelector('.custom-heading')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'heading level 1',
        props: { as: 'h1' as const, children: 'Main Title' },
      },
      {
        name: 'heading level 2',
        props: { as: 'h2' as const, children: 'Section Title' },
      },
      {
        name: 'heading level 3',
        props: { as: 'h3' as const, children: 'Subsection Title' },
      },
      {
<<<<<<< HEAD
=======
        name: 'heading level 4',
        props: { as: 'h4' as const, children: 'Sub-subsection Title' },
      },
      {
        name: 'heading level 5',
        props: { as: 'h5' as const, children: 'Minor Heading' },
      },
      {
>>>>>>> 3626d2f (feat: add accessibility testing infrastructure with foundational component coverage)
        name: 'heading level 6',
        props: { as: 'h6' as const, children: 'Smallest Heading' },
      },
      {
<<<<<<< HEAD
=======
        name: 'heading with custom className',
        props: { as: 'h2' as const, className: 'custom-style', children: 'Styled Heading' },
      },
      {
>>>>>>> 3626d2f (feat: add accessibility testing infrastructure with foundational component coverage)
        name: 'heading with styledAs',
        props: { as: 'h1' as const, styledAs: 'h3' as const, children: 'H1 styled as H3' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Heading {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
