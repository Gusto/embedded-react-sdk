import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { DocumentEmbed } from './DocumentEmbed'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const getEmbed = (container: HTMLElement) => container.querySelector('embed')

describe('DocumentEmbed', () => {
  describe('default rendering', () => {
    it('renders an <embed> decorated to hide the native PDF viewer chrome', () => {
      const { container } = renderWithProviders(
        <DocumentEmbed url="https://example.com/document.pdf" title="W-4" />,
      )

      const embed = getEmbed(container)
      expect(embed).not.toBeNull()
      expect(embed).toHaveAttribute('src', 'https://example.com/document.pdf#toolbar=0&navpanes=0')
      expect(embed).toHaveAttribute('type', 'application/pdf')
      expect(embed).toHaveAttribute('title', 'W-4')
    })

    it('applies the className to the <embed>', () => {
      const { container } = renderWithProviders(
        <DocumentEmbed url="https://example.com/document.pdf" title="W-4" className="custom" />,
      )

      expect(getEmbed(container)).toHaveClass('custom')
    })
  })

  describe('with a DocumentEmbed override', () => {
    const CustomEmbed = ({
      url,
      title,
      className,
    }: {
      url: string
      title: string
      className?: string
    }) => <div data-testid="custom-embed" data-url={url} data-title={title} className={className} />

    it('renders the override instead of the default <embed>', () => {
      const { container } = renderWithProviders(
        <ComponentsProvider value={{ ...defaultComponents, DocumentEmbed: CustomEmbed }}>
          <DocumentEmbed url="https://example.com/document.pdf" title="W-4" className="custom" />
        </ComponentsProvider>,
      )

      expect(getEmbed(container)).toBeNull()
      const override = screen.getByTestId('custom-embed')
      expect(override).toHaveClass('custom')
      expect(override).toHaveAttribute('data-title', 'W-4')
    })

    it('passes the raw URL to the override, without the default toolbar-hiding decoration', () => {
      renderWithProviders(
        <ComponentsProvider value={{ ...defaultComponents, DocumentEmbed: CustomEmbed }}>
          <DocumentEmbed url="https://example.com/document.pdf" title="W-4" />
        </ComponentsProvider>,
      )

      expect(screen.getByTestId('custom-embed')).toHaveAttribute(
        'data-url',
        'https://example.com/document.pdf',
      )
    })
  })
})
