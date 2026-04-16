import { useTranslation } from 'react-i18next'
import { useSignatureForm } from './useSignatureForm'
import { DocumentViewer } from '@/components/Common/DocumentViewer'

export function Preview() {
  const { document, pdfUrl } = useSignatureForm()
  const { t } = useTranslation('Contractor.DocumentSigner')

  return (
    <DocumentViewer
      url={pdfUrl}
      title={document.title}
      downloadInstructions={t('downloadAndReviewInstructions')}
      viewDocumentLabel={t('viewDocumentCta')}
    />
  )
}
