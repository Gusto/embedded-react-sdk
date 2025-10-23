import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DescriptionList } from './DescriptionList'

describe('DescriptionList', () => {
  it('renders a description list with items', () => {
    render(
      <DescriptionList
        items={[
          { term: 'Term 1', description: 'Description 1' },
          { term: 'Term 2', description: 'Description 2' },
        ]}
      />,
    )

    expect(screen.getByText('Term 1')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('Term 2')).toBeInTheDocument()
    expect(screen.getByText('Description 2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <DescriptionList className="custom-class" items={[{ term: 'Term', description: 'Desc' }]} />,
    )

    const dl = container.querySelector('dl')
    expect(dl).toHaveClass('custom-class')
  })

  it('renders with ReactNode items', () => {
    render(
      <DescriptionList
        items={[
          {
            term: <strong>Bold Term</strong>,
            description: <em>Italic Description</em>,
          },
        ]}
      />,
    )

    expect(screen.getByText('Bold Term')).toBeInTheDocument()
    expect(screen.getByText('Italic Description')).toBeInTheDocument()
  })

  it('renders empty list when items array is empty', () => {
    const { container } = render(<DescriptionList items={[]} />)

    const dl = container.querySelector('dl')
    expect(dl).toBeInTheDocument()
    expect(dl?.children.length).toBe(0)
  })

  it('renders multiple terms for one description', () => {
    const { container } = render(
      <DescriptionList
        items={[
          {
            term: ['Firefox', 'Mozilla Firefox', 'Fx'],
            description: 'A web browser',
          },
        ]}
      />,
    )

    const dts = container.querySelectorAll('dt')
    expect(dts).toHaveLength(3)
    expect(dts[0]).toHaveTextContent('Firefox')
    expect(dts[1]).toHaveTextContent('Mozilla Firefox')
    expect(dts[2]).toHaveTextContent('Fx')

    const dds = container.querySelectorAll('dd')
    expect(dds).toHaveLength(1)
    expect(dds[0]).toHaveTextContent('A web browser')
  })

  it('renders one term with multiple descriptions', () => {
    const { container } = render(
      <DescriptionList
        items={[
          {
            term: 'Firefox',
            description: ['A web browser', 'The Red Panda'],
          },
        ]}
      />,
    )

    const dts = container.querySelectorAll('dt')
    expect(dts).toHaveLength(1)
    expect(dts[0]).toHaveTextContent('Firefox')

    const dds = container.querySelectorAll('dd')
    expect(dds).toHaveLength(2)
    expect(dds[0]).toHaveTextContent('A web browser')
    expect(dds[1]).toHaveTextContent('The Red Panda')
  })

  it('renders mixed patterns of terms and descriptions', () => {
    const { container } = render(
      <DescriptionList
        items={[
          { term: 'Single', description: 'Single' },
          { term: ['Multiple', 'Terms'], description: 'One desc' },
          { term: 'One term', description: ['Desc 1', 'Desc 2'] },
        ]}
      />,
    )

    const dts = container.querySelectorAll('dt')
    expect(dts).toHaveLength(4)

    const dds = container.querySelectorAll('dd')
    expect(dds).toHaveLength(4)
  })
})
