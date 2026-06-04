import { useTranslation } from 'react-i18next'
import type { Form } from '@gusto/embedded-api-v-2025-11-15/models/components/form'
import { useDocumentsList } from '../../shared/useDocumentsList'
import { DataView, useDataView, EmptyData } from '@/components/Common'
import { BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface DocumentsCardProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "Documents" (forms) card. Owns its own data fetch via
 * {@link useDocumentsList} and renders the employee's forms in a table with a
 * per-row "View" action. Emits the management block's scoped event
 * (`EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED`) when a row's View CTA is
 * clicked. The card is read-only — viewing or signing a form happens in the
 * `DocumentManager` screen the orchestrator routes to — and has no alert API:
 * alert rendering is the orchestrator's responsibility (the block's
 * `DocumentsCardContextual` for standalone consumption; the dashboard chrome
 * for dashboard consumption).
 */
export function DocumentsCard({ employeeId, onEvent }: DocumentsCardProps) {
  useI18n('Employee.Management.Documents')
  const { t } = useTranslation('Employee.Management.Documents')
  const Components = useComponentContext()

  const documentsList = useDocumentsList({ employeeId })

  const forms = documentsList.isLoading ? [] : documentsList.data.forms

  const formsColumns = [
    {
      key: 'title',
      title: t('columns.title'),
      render: (form: Form) => form.title || '-',
    },
    {
      key: 'year',
      title: t('columns.year'),
      render: (form: Form) => (form.year ? String(form.year) : '-'),
    },
    {
      key: 'status',
      title: t('columns.status'),
      render: (form: Form) => (form.draft ? t('status.draft') : t('status.final')),
    },
    {
      key: 'requiresSigning',
      title: t('columns.requiresSigning'),
      render: (form: Form) =>
        form.requiresSigning ? (
          <Components.Badge status="warning">{t('signingStatus.notSigned')}</Components.Badge>
        ) : (
          <Components.Badge status="success">{t('signingStatus.signed')}</Components.Badge>
        ),
    },
  ]

  const formsDataView = useDataView({
    data: forms,
    columns: formsColumns,
    itemMenu: (form: Form) => (
      <Components.Button
        variant="secondary"
        onClick={() => {
          onEvent(componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED, {
            employeeId,
            formId: form.uuid,
          })
        }}
      >
        {t('viewCta')}
      </Components.Button>
    ),
    emptyState: () => (
      <EmptyData title={t('emptyState.title')} description={t('emptyState.description')} />
    ),
  })

  if (documentsList.isLoading) {
    return <BaseLayout isLoading error={documentsList.errorHandling.errors} />
  }

  return (
    <BaseLayout error={documentsList.errorHandling.errors}>
      <Components.Box withPadding={false} header={<Components.BoxHeader title={t('title')} />}>
        <DataView label={t('listLabel')} isWithinBox {...formsDataView} />
      </Components.Box>
    </BaseLayout>
  )
}
