import exampleDocument from '../../../../.ladle/demo-images/example-document.png'
import { DocumentViewer } from './DocumentViewer'

export const DocumentViewerDefault = () => (
  <DocumentViewer
    url={exampleDocument}
    title="Employment Contract"
    downloadInstructions="Please review the terms of your employment contract before signing."
    viewDocumentLabel="View Document"
  />
)
