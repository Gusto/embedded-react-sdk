import { useTranslation } from 'react-i18next'
import { useSignatureForm } from './useSignatureForm'
import { DocumentViewer } from '@/components/Common/DocumentViewer'

export function Preview() {
  const { form, pdfUrl } = useSignatureForm()
  const { t } = useTranslation('Employee.DocumentSigner')

  return (
    <DocumentViewer
      url={pdfUrl}
      title={form.title}
      downloadInstructions={t('downloadAndReviewInstructions')}
      viewDocumentLabel={t('viewDocumentCta')}
    />
  )
}
