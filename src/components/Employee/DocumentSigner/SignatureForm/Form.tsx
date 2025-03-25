import { useTranslation } from 'react-i18next'
import styles from './SignatureForm.module.scss'
import { useSignatureForm } from './SignatureForm'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import {
  SignatureFormFields,
  SignatureFormActions,
  SignatureForm as SharedSignatureForm,
} from '@/components/Common/SignatureForm'

export function Form() {
  const { formToSign, pdfUrl, isPending, handleBack, handleSubmit } = useSignatureForm()
  const { t } = useTranslation('Employee.DocumentSigner')
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
