import { useTranslation } from 'react-i18next'
import styles from './SignatureForm.module.scss'
import { useDocumentSigner } from '@/components/Employee/DocumentSigner/DocumentSigner'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import {
  SignatureForm as SharedSignatureForm,
  SignatureFormFields,
  SignatureFormActions,
} from '@/components/Common/SignatureForm'

export function SignatureForm() {
  const { mode, pdfUrl, handleSubmit, formToSign, handleBack, isPending } = useDocumentSigner()
  const { t } = useTranslation('Employee.DocumentSigner')

  if (mode !== 'SIGN') return null

  return (
    <section className={styles.container}>
      <DocumentViewer
        url={pdfUrl}
        title={formToSign?.title}
        downloadInstructions={t('downloadAndReviewInstructions')}
        viewDocumentLabel={t('viewDocumentCta')}
      />
      <SharedSignatureForm onSubmit={handleSubmit}>
        <SignatureFormFields
          signatureLabel="Signature"
          signatureDescription={t('signatureFieldDescription')}
          signatureError={t('signatureFieldError')}
          confirmationGroupLabel={t('confirmationGroupLabel')}
          confirmationLabel={t('confirmSignatureCheckboxLabel')}
          confirmationError={t('confirmSignatureError')}
        />
        <SignatureFormActions
          onBack={handleBack}
          backLabel={t('backCta')}
          submitLabel={t('signFormCta')}
          isLoading={isPending}
        />
      </SharedSignatureForm>
    </section>
  )
}
