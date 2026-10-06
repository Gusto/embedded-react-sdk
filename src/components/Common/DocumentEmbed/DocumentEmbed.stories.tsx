import type { DocumentEmbedProps } from './DocumentEmbedTypes'
import { DocumentEmbed } from './DocumentEmbed'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'

export default {
  title: 'UI/Components/DocumentEmbed',
}

const exampleDocumentUrl = '/sample-documents/w9.pdf'

export const Default = () => <DocumentEmbed url={exampleDocumentUrl} title="Employment Contract" />

// Add a `sandbox` attribute here if your policy needs one — test it against your
// target browsers first, since sandboxed PDF rendering isn't consistently supported.
const IframeOverride = ({ url, title, className }: DocumentEmbedProps) => (
  <iframe src={url} title={title} className={className} width="100%" height="500" />
)

export const WithIframeOverride = () => (
  <ComponentsProvider value={{ ...defaultComponents, DocumentEmbed: IframeOverride }}>
    <DocumentEmbed url={exampleDocumentUrl} title="W-9" />
  </ComponentsProvider>
)
