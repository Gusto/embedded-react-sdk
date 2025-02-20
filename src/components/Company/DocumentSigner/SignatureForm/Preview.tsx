import { useTranslation } from 'react-i18next'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { useSignatureForm } from './SignatureForm'

export function Preview() {
  const { form, pdfUrl } = useSignatureForm()
  const { t } = useTranslation('Company.SignatureForm')

  return (
    <DocumentViewer
      url={pdfUrl}
      title={form.title}
      downloadInstructions={t('downloadInstructions')}
      viewDocumentLabel={t('viewDocumentCta')}
    />
  )
}
