import { describe, it, expect } from 'vitest'
import { DocumentViewer } from './DocumentViewer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const getEmbed = (container: HTMLElement) => container.querySelector('embed')

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
})
