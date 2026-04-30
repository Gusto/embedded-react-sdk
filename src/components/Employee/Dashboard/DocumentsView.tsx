import { useTranslation } from 'react-i18next'
import type { Form } from '@gusto/embedded-api/models/components/form'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, useDataView, EmptyData, Loading } from '@/components/Common'

export interface DocumentsViewProps {
  forms?: Form[]
  isLoading?: boolean
  onViewForm?: (formUuid: string) => void
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
        if (form.requiresSigning) return t('common.yes')
        return t('common.no')
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

  if (isLoading) {
    return <Loading />
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <Components.Box header={<Components.BoxHeader title={t('documents.title')} />}>
        <Flex flexDirection="column" gap={16}>
          <DataView label={t('documents.listLabel')} {...formsDataView} />
        </Flex>
      </Components.Box>
    </Flex>
  )
}
