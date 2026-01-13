import { DocumentViewer } from './DocumentViewer'

export default {
  title: 'Domain/Company/Documents',
}

const exampleDocumentUrl = 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg'

export const DocumentViewerDefault = () => (
  <DocumentViewer
    url={exampleDocumentUrl}
    title="Employment Contract"
    downloadInstructions="Please review the terms of your employment contract before signing."
    viewDocumentLabel="View Document"
  />
)
