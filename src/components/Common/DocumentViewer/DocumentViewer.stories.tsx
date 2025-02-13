import { DocumentViewer } from './DocumentViewer'
import exampleDocument from '../../../../.ladle/demo-images/example-document.png'

export const DocumentViewerDefault = () => (
  <DocumentViewer
    url={exampleDocument}
    title="Employment Contract"
    downloadInstructions="Please review the terms of your employment contract before signing."
    viewDocumentLabel="View Document"
  />
)
