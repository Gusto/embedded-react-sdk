import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContractorDocumentsGetPdf } from '@gusto/embedded-api/react-query/contractorDocumentsGetPdf'
import type { Document } from '@gusto/embedded-api/models/components/document'
import { useContractorDocumentsList } from '../../DocumentsList/useContractorDocumentsList'
import { DataView, EmptyData, useDataView, Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link DocumentsCard}.
 *
 * @public
 */
export interface DocumentsCardProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Event handler fired when the user views a document. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone read-only "Documents" card.
 *
 * @remarks
 * Fetches its own data via {@link useContractorDocumentsList} and renders a
 * table of the contractor's forms with a per-row "View" action that opens
 * the document's PDF in a new tab. Read-only — signing happens during
 * contractor onboarding, not from this surface.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/documents/card/viewRequested` | Fired when a document row's "View" button is clicked, before the PDF is fetched | `{ contractorId: string, documentUuid: string }` |
 * | `contractor/management/documents/card/viewed` | Fired after the PDF is fetched and opened in a new tab | `{ contractorId: string, documentUuid: string }` |
 *
 * @param props - See {@link DocumentsCardProps}.
 * @returns The contractor documents card.
 * @public
 */
export function DocumentsCard(props: DocumentsCardProps) {
  return (
    <BaseBoundaries componentName="Contractor.Management.Documents">
      <DocumentsCardContent {...props} />
    </BaseBoundaries>
  )
}

function DocumentsCardContent({ contractorId, onEvent }: DocumentsCardProps) {
  useI18n('Contractor.Management.Documents')
  const { t } = useTranslation('Contractor.Management.Documents')
  const Components = useComponentContext()
  const documentsList = useContractorDocumentsList({ contractorId })

  const isLoading = documentsList.isLoading
  const documents = documentsList.isLoading ? [] : documentsList.data.documents
  const isShowingTable = documents.length > 0

  const columns = [
    {
      key: 'title',
      title: t('nameColumn'),
      render: (document: Document) => (
        <Components.Text weight="medium" size="sm">
          {document.title ?? document.name ?? t('emptyPlaceholder')}
        </Components.Text>
      ),
    },
    {
      key: 'description',
      title: t('descriptionColumn'),
      render: (document: Document) => (
        <Components.Text variant="supporting" size="sm">
          {document.description ?? t('emptyPlaceholder')}
        </Components.Text>
      ),
    },
  ]

  const dataViewProps = useDataView({
    data: documents,
    columns,
    itemMenu: document =>
      document.uuid ? (
        <ViewButton contractorId={contractorId} documentUuid={document.uuid} onEvent={onEvent} />
      ) : null,
    emptyState: () => <EmptyData title={t('emptyState.title')} />,
  })

  return (
    <BaseLayout error={documentsList.errorHandling.errors}>
      <Components.Box
        withPadding={!isShowingTable}
        header={<Components.BoxHeader title={t('title')} />}
      >
        {isLoading ? (
          <Loading />
        ) : isShowingTable ? (
          <DataView label={t('listLabel')} isWithinBox {...dataViewProps} />
        ) : (
          <EmptyData title={t('emptyState.title')} />
        )}
      </Components.Box>
    </BaseLayout>
  )
}

function ViewButton({
  contractorId,
  documentUuid,
  onEvent,
}: {
  contractorId: string
  documentUuid: string
  onEvent: OnEventType<EventType, unknown>
}) {
  const { t } = useTranslation('Contractor.Management.Documents')
  const Components = useComponentContext()
  const [isOpening, setIsOpening] = useState(false)
  const { refetch } = useContractorDocumentsGetPdf({ documentUuid }, { enabled: false })

  const handleView = async () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED, {
      contractorId,
      documentUuid,
    })
    setIsOpening(true)
    try {
      const { data } = await refetch()
      const url = data?.documentPdf?.documentUrl
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
        onEvent(componentEvents.CONTRACTOR_MANAGEMENT_DOCUMENTS_CARD_VIEWED, {
          contractorId,
          documentUuid,
        })
      }
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <Components.Button
      variant="secondary"
      onClick={() => {
        void handleView()
      }}
      isLoading={isOpening}
    >
      {t('viewCta')}
    </Components.Button>
  )
}
