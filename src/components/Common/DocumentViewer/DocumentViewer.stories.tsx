import exampleDocument from '../../../../.ladle/demo-images/example-document.png'
import { DocumentViewer } from './DocumentViewer'

// Adding a meta object for title
export default {
  title: 'Domain/Company/Documents', // Creates nesting structure for domain-specific components
}

export const DocumentViewerDefault = () => (
  <DocumentViewer
    url={exampleDocument}
    title="Employment Contract"
    downloadInstructions="Please review the terms of your employment contract before signing."
    viewDocumentLabel="View Document"
  />
)
