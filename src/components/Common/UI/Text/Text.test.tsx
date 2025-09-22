import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'
import { TextDefaults } from './TextTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Text Component', () => {
  it('renders with default size as md', () => {
    render(<Text {...TextDefaults}>Hello World</Text>)
    const textElement = screen.getByText('Hello World')
    expect(textElement).toBeInTheDocument()
    expect(textElement.tagName).toBe('P')
  })

  it('renders with correct tag based on as prop', () => {
    render(<Text as="span">Span Text</Text>)
    const spanElement = screen.getByText('Span Text')
    expect(spanElement.tagName).toBe('SPAN')

    render(<Text as="div">Div Text</Text>)
    const divElement = screen.getByText('Div Text')
    expect(divElement.tagName).toBe('DIV')
  })

  it('applies correct textAlign classes', () => {
    const { rerender } = render(
      <Text {...TextDefaults} textAlign="center">
        Centered Text
      </Text>,
    )
    const centeredText = screen.getByText('Centered Text')
    expect(centeredText.className).toContain('textAlign-center')

    rerender(
      <Text {...TextDefaults} textAlign="end">
        End Text
      </Text>,
    )
    const endText = screen.getByText('End Text')
    expect(endText.className).toContain('textAlign-end')
  })

  it('applies correct weight classes', () => {
    const { rerender } = render(
      <Text {...TextDefaults} weight="bold">
        Bold Text
      </Text>,
    )
    const boldText = screen.getByText('Bold Text')
    expect(boldText.className).toContain('weight-bold')

    rerender(
      <Text {...TextDefaults} weight="semibold">
        Semibold Text
      </Text>,
    )
    const semiboldText = screen.getByText('Semibold Text')
    expect(semiboldText.className).toContain('weight-semibold')

    rerender(
      <Text {...TextDefaults} weight="medium">
        Medium Text
      </Text>,
    )
    const mediumText = screen.getByText('Medium Text')
    expect(mediumText.className).toContain('weight-medium')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(
      <Text {...TextDefaults} size="sm">
        Small Text
      </Text>,
    )
    const smallText = screen.getByText('Small Text')
    expect(smallText.className).toContain('sm')

    rerender(
      <Text {...TextDefaults} size="lg">
        Large Text
      </Text>,
    )
    const largeText = screen.getByText('Large Text')
    expect(largeText.className).toContain('lg')
  })

  it('accepts and applies custom className', () => {
    render(
      <Text {...TextDefaults} className="custom-class">
        Custom Class Text
      </Text>,
    )
    const textWithCustomClass = screen.getByText('Custom Class Text')
    expect(textWithCustomClass.className).toContain('custom-class')
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic text',
        render: () => <Text {...TextDefaults}>This is basic text content</Text>,
      },
      // HTML elements - these have different semantic meanings
      {
        name: 'paragraph text',
        render: () => (
          <Text {...TextDefaults} as="p">
            Paragraph text
          </Text>
        ),
      },
      {
        name: 'span text',
        render: () => (
          <Text {...TextDefaults} as="span">
            Span text
          </Text>
        ),
      },
      {
        name: 'div text',
        render: () => (
          <Text {...TextDefaults} as="div">
            Div text
          </Text>
        ),
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ render }) => {
        const renderResult = renderWithProviders(render())
        await expectNoAxeViolationsOnRender(renderResult)
      },
    )
  })
})
