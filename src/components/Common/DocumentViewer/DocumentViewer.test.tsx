import type { ReactElement } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { DocumentViewer } from './DocumentViewer'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const getEmbed = (container: HTMLElement) => container.querySelector('embed')

const CustomEmbed = ({ url, title }: { url: string; title: string }) => (
  <div data-testid="custom-embed" data-url={url} data-title={title} />
)

const renderWithOverride = (ui: ReactElement) =>
  renderWithProviders(
    <ComponentsProvider value={{ ...defaultComponents, DocumentEmbed: CustomEmbed }}>
      {ui}
    </ComponentsProvider>,
  )

describe('DocumentViewer', () => {
  it('remounts the embed when the document URL changes so the browser PDF plugin reloads', () => {
    const { container, rerender } = renderWithProviders(
      <DocumentViewer
        url="https://example.com/unsigned.pdf"
        title="W-4"
        viewDocumentLabel="Download"
      />,
    )

    const firstEmbed = getEmbed(container)
    expect(firstEmbed).not.toBeNull()
    expect(firstEmbed?.getAttribute('src')).toContain('unsigned.pdf')

    rerender(
      <DocumentViewer
        url="https://example.com/signed.pdf"
        title="W-4"
        viewDocumentLabel="Download"
      />,
    )

    const secondEmbed = getEmbed(container)
    expect(secondEmbed).not.toBeNull()
    expect(secondEmbed?.getAttribute('src')).toContain('signed.pdf')
    // A new DOM node — the `key={url}` on <embed> forces React to unmount the
    // previous element so the browser's PDF plugin picks up the new src.
    expect(secondEmbed).not.toBe(firstEmbed)
  })

  it('renders nothing when url is falsy', () => {
    const { container } = renderWithProviders(
      <DocumentViewer url={null} title="W-4" viewDocumentLabel="Download" />,
    )
    expect(getEmbed(container)).toBeNull()
  })

  describe('with a DocumentEmbed override', () => {
    it('renders the override in the large-breakpoint layout', () => {
      const { container } = renderWithOverride(
        <DocumentViewer
          url="https://example.com/w-4.pdf"
          title="W-4"
          viewDocumentLabel="Download"
        />,
      )

      expect(getEmbed(container)).toBeNull()
      const override = screen.getByTestId('custom-embed')
      expect(override).toHaveAttribute('data-url', 'https://example.com/w-4.pdf')
      expect(override).toHaveAttribute('data-title', 'W-4')
    })

    it('renders the override in the small-breakpoint layout', () => {
      vi.mocked(useContainerBreakpoints).mockReturnValue(['base'])

      const { container } = renderWithOverride(
        <DocumentViewer
          url="https://example.com/w-4.pdf"
          title="W-4"
          viewDocumentLabel="Download"
        />,
      )

      expect(getEmbed(container)).toBeNull()
      const override = screen.getByTestId('custom-embed')
      expect(override).toHaveAttribute('data-url', 'https://example.com/w-4.pdf')
      expect(override).toHaveAttribute('data-title', 'W-4')
    })
  })
})
