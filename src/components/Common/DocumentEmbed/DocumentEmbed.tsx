import type { DocumentEmbedProps } from './DocumentEmbedTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const DefaultDocumentEmbed = ({ url, title, className }: DocumentEmbedProps) => (
  <embed
    // `#toolbar=0&navpanes=0` is a PDF.js/browser-plugin URL fragment convention
    // (not a real query string) that hides the built-in PDF viewer's toolbar and
    // side navigation panel so it reads as part of our UI rather than a bare
    // plugin frame. It only affects this default `<embed>` rendering — a partner
    // supplying their own `DocumentEmbed` override gets the raw `url` and owns
    // any such chrome themselves.
    src={`${url}#toolbar=0&navpanes=0`}
    title={title}
    type="application/pdf"
    className={className}
  />
)

/** @internal */
export const DocumentEmbed = (props: DocumentEmbedProps) => {
  const Components = useComponentContext()

  return Components.DocumentEmbed ? (
    <Components.DocumentEmbed {...props} />
  ) : (
    <DefaultDocumentEmbed {...props} />
  )
}
