import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useErrorBoundary } from 'react-error-boundary'
import type { TFunction } from 'i18next'
import type { Form as FormSchema } from '@gusto/embedded-api/models/components/form'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { companyFormsGetPdf } from '@gusto/embedded-api/funcs/companyFormsGetPdf'
import { useDocumentList } from './useDocumentList'
import { DocumentList, type FormData } from '@/components/Common/DocumentList'

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
  const { companyForms, handleRequestFormToSign, documentListError, isSelfSignatory } =
    useDocumentList()

  const { t } = useTranslation('Company.DocumentList')
  const { showBoundary } = useErrorBoundary()
  const gustoEmbedded = useGustoEmbeddedContext()
  const [viewingUuid, setViewingUuid] = useState<string | null>(null)

  const onRequestSign = (requestedForm: FormData) => {
    const companyForm = companyForms.find(currentForm => currentForm.uuid === requestedForm.uuid)
    handleRequestFormToSign(companyForm || requestedForm)
  }

  const onView = useCallback(
    async (requestedForm: FormData) => {
      setViewingUuid(requestedForm.uuid)
      try {
        const result = await companyFormsGetPdf(gustoEmbedded, { formId: requestedForm.uuid })
        const documentUrl = result.ok ? result.value.formPdf?.documentUrl : undefined
        if (documentUrl) {
          window.open(documentUrl, '_blank', 'noopener,noreferrer')
        }
      } catch (err) {
        showBoundary(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setViewingUuid(null)
      }
    },
    [gustoEmbedded, showBoundary],
  )

  return (
    <DocumentList
      forms={companyForms.map(form => ({
        uuid: form.uuid,
        title: form.title,
        description: resolveFormDescription(form, t),
        requires_signing: form.requiresSigning,
      }))}
      onRequestSign={onRequestSign}
      onView={form => void onView(form)}
      viewingUuid={viewingUuid}
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
  )
}

export { List }
