import { useTranslation } from 'react-i18next'
import type { Form } from '@gusto/embedded-api-v-2025-11-15/models/components/form'
import { useEmployeeForms } from './hooks'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, useDataView, EmptyData, Loading } from '@/components/Common'
import { BaseLayout } from '@/components/Base/Base'

export interface DocumentsViewProps {
  forms?: Form[]
  isLoading?: boolean
  onViewForm?: (formUuid: string) => void
}

export interface DocumentsViewWithDataProps {
  employeeId: string
  onViewForm?: (formUuid: string) => void
}

/**
 * Tab-mounted container for the Documents tab. Owns the
 * `useEmployeeForms` fetch so the request only fires when the user
 * actually opens this tab (or whatever the parent chooses to mount).
 * The presentational `DocumentsView` stays pure for testing/stories.
 */
export function DocumentsViewWithData({ employeeId, onViewForm }: DocumentsViewWithDataProps) {
  const forms = useEmployeeForms({ employeeId })

  return (
    <BaseLayout error={forms.errorHandling.errors}>
      <DocumentsView
        forms={forms.data.formList}
        isLoading={forms.status.isFormsLoading}
        onViewForm={onViewForm}
      />
    </BaseLayout>
  )
}

export function DocumentsView({ forms = [], isLoading = false, onViewForm }: DocumentsViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()

  const formsColumns = [
    {
      key: 'title',
      title: t('documents.columns.title'),
      render: (form: Form) => form.title || '-',
    },
    {
      key: 'year',
      title: t('documents.columns.year'),
      render: (form: Form) => {
        if (form.year) return String(form.year)
        return '-'
      },
    },
    {
      key: 'status',
      title: t('documents.columns.status'),
      render: (form: Form) => {
        if (form.draft) return t('documents.status.draft')
        return t('documents.status.final')
      },
    },
    {
      key: 'requiresSigning',
      title: t('documents.columns.requiresSigning'),
      render: (form: Form) => {
        if (form.requiresSigning) {
          return (
            <Components.Badge status="warning">
              {t('documents.signingStatus.notSigned')}
            </Components.Badge>
          )
        }
        return (
          <Components.Badge status="success">
            {t('documents.signingStatus.signed')}
          </Components.Badge>
        )
      },
    },
  ]

  const formsDataView = useDataView({
    data: forms,
    columns: formsColumns,
    itemMenu: (form: Form) => (
      <Components.Button variant="secondary" onClick={() => onViewForm?.(form.uuid)}>
        {t('documents.viewCta')}
      </Components.Button>
    ),
    emptyState: () => (
      <EmptyData
        title={t('documents.emptyState.title')}
        description={t('documents.emptyState.description')}
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <Components.Box header={<Components.BoxHeader title={t('documents.title')} />}>
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : (
            <DataView label={t('documents.listLabel')} {...formsDataView} />
          )}
        </Flex>
      </Components.Box>
    </Flex>
  )
}
