import { useTranslation } from 'react-i18next'
import { DocumentList, type FormData } from '@/components/Common/DocumentList'
import { useDocumentList } from './DocumentList'

function List() {
  const { companyForms, handleRequestFormToSign, documentListError, isSelfSignatory } =
    useDocumentList()
  // @ts-expect-error HACK missing translations
  const { t } = useTranslation('Company.DocumentSigner')

  const onRequestSign = (requestedForm: FormData) => {
    const companyForm = companyForms.find(currentForm => currentForm.uuid === requestedForm.uuid)
    handleRequestFormToSign(companyForm || requestedForm)
  }

  return (
    <DocumentList
      forms={companyForms.map(form => ({
        uuid: form.uuid,
        title: form.title,
        description: form.description,
        requires_signing: form.requires_signing,
      }))}
      onRequestSign={onRequestSign}
      withError={!!documentListError}
      label={t('documentListLabel')}
      columnLabels={{
        form: t('formColumnLabel'),
        status: t('statusColumnLabel'),
      }}
      statusLabels={{
        signCta: t('signDocumentCta'),
        notSigned: t('notSigned'),
        complete: t('signDocumentComplete'),
      }}
      emptyStateLabel={t('emptyTableTitle')}
      errorLabel={t('documentListError')}
      canSign={isSelfSignatory}
    />
  )
}

export { List }
