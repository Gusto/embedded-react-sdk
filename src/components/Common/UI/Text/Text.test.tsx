import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text Component', () => {
  it('renders with default size as md', () => {
    render(<Text as="p">Hello World</Text>)
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
      <Text as="p" textAlign="center">
        Centered Text
      </Text>,
    )
    const centeredText = screen.getByText('Centered Text')
    expect(centeredText.className).toContain('textAlign-center')

    rerender(
      <Text as="p" textAlign="end">
        End Text
      </Text>,
    )
    const endText = screen.getByText('End Text')
    expect(endText.className).toContain('textAlign-end')
  })

  it('applies correct weight classes', () => {
    const { rerender } = render(
      <Text as="p" weight="bold">
        Bold Text
      </Text>,
    )
    const boldText = screen.getByText('Bold Text')
    expect(boldText.className).toContain('weight-bold')

    rerender(
      <Text as="p" weight="medium">
        Medium Text
      </Text>,
    )
    const mediumText = screen.getByText('Medium Text')
    expect(mediumText.className).toContain('weight-medium')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(
      <Text as="p" size="sm">
        Small Text
      </Text>,
    )
    const smallText = screen.getByText('Small Text')
    expect(smallText.className).toContain('sm')

    rerender(
      <Text as="p" size="lg">
        Large Text
      </Text>,
    )
    const largeText = screen.getByText('Large Text')
    expect(largeText.className).toContain('lg')
  })

  it('accepts and applies custom className', () => {
    render(
      <Text as="p" className="custom-class">
        Custom Class Text
      </Text>,
    )
    const textWithCustomClass = screen.getByText('Custom Class Text')
    expect(textWithCustomClass.className).toContain('custom-class')
  })
})
