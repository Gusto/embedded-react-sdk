import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { Form as FormSchema } from '@gusto/embedded-api/models/components/form'
import { useDocumentList } from './useDocumentList'
import { DocumentList, type FormData } from '@/components/Common/DocumentList'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Resolves a form's rendered description, preferring a partner-provided
 * `forms.<name>.description` dictionary override over the API-provided text.
 * Falls back to the API text when no override exists (including for form
 * names outside the SDK's known catalog).
 */
function resolveFormDescription(form: FormSchema, t: TFunction<'Company.DocumentList'>) {
  if (!form.name) return form.description
  const override = t(`forms.${form.name}.description` as never, { defaultValue: '' }) as string
  return override || form.description
}

/** @internal */
function List() {
  const {
    companyForms,
    handleRequestFormToSign,
    handleViewForm,
    viewingFormUuid,
    viewFormError,
    dismissViewFormError,
    documentListError,
    isSelfSignatory,
  } = useDocumentList()

  const { t } = useTranslation('Company.DocumentList')
  const Components = useComponentContext()

  const onRequestSign = (requestedForm: FormData) => {
    const companyForm = companyForms.find(currentForm => currentForm.uuid === requestedForm.uuid)
    handleRequestFormToSign(companyForm || requestedForm)
  }

  const onView = (requestedForm: FormData) => {
    handleViewForm(requestedForm.uuid)
  }

  return (
    <>
      {viewFormError && (
        <Components.Alert
          status="error"
          label={t('viewDocumentError')}
          onDismiss={dismissViewFormError}
        />
      )}
      <DocumentList
        forms={companyForms.map(form => ({
          uuid: form.uuid,
          title: form.title,
          description: resolveFormDescription(form, t),
          requires_signing: form.requiresSigning,
        }))}
        onRequestSign={onRequestSign}
        onView={onView}
        viewingUuid={viewingFormUuid}
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
          viewCta: t('viewCta'),
        }}
        emptyStateLabel={t('emptyTableTitle')}
        errorLabel={t('documentListError')}
        canSign={isSelfSignatory}
      />
    </>
  )
}

export { List }
