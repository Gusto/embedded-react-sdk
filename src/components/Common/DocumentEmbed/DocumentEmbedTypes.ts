/**
 * Props your `DocumentEmbed` implementation must accept from the component adapter.
 * Renders a PDF document inline. Override this to control how PDFs are rendered inline —
 * especially useful if you have strict Content Security Policy directives.
 *
 * @public
 * @group Component props
 */
export interface DocumentEmbedProps {
  /** The URL of the PDF document to render. Always a PDF today — the SDK does not render any other document type through this slot. */
  url: string
  /** Optional title describing the document, for assistive technology. */
  title?: string
  /** Additional class names appended to the root element. */
  className?: string
}
