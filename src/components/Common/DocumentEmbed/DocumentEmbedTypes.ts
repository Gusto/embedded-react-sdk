/**
 * Props your `DocumentEmbed` implementation must accept from the component adapter.
 * Renders a PDF document inline. Override this to control how PDFs are rendered inline —
 * especially useful if you have strict Content Security Policy directives.
 *
 * @public
 * @group Component props
 */
export interface DocumentEmbedProps {
  /**
   * The URL of the PDF document to render. Always a PDF today — the SDK does not render
   * any other document type through this slot.
   *
   * This is the raw URL as returned by the API. The SDK's default `<embed>`-based
   * rendering separately appends query parameters to display the built-in PDF viewer
   * without its toolbar or navigation panel; that decoration is not applied here, so
   * your implementation receives the URL unmodified and is free to choose its own
   * display treatment.
   */
  url: string
  /** Title describing the document, for assistive technology. */
  title: string
  /** Additional class names appended to the root element. */
  className?: string
}
