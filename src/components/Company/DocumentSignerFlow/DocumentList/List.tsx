import { useTranslation } from 'react-i18next'
import { useDocumentList } from './DocumentList'
import { DocumentList, type FormData } from '@/components/Common/DocumentList'

function List() {
  const { companyForms, handleRequestFormToSign, documentListError, isSelfSignatory } =
    useDocumentList()

  const { t } = useTranslation('Company.DocumentList')

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
        requires_signing: form.requiresSigning,
      }))}
      onRequestSign={onRequestSign}
      withError={!!documentListError}
      label={t('documentListLabel')}
      columnLabels={{
        form: t('formColumnLabel'),
        action: t('actionColumnLabel'),
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
