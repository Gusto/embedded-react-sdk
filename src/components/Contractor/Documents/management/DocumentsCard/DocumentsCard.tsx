import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContractorDocumentsGetPdf } from '@gusto/embedded-api/react-query/contractorDocumentsGetPdf'
import { useContractorFormsGetPdf } from '@gusto/embedded-api/react-query/contractorFormsGetPdf'
import { requiresSignature } from '../../shared/documentSigningStatus'
import { useContractorDocumentsList } from '../../shared/useContractorDocumentsList'
import { useContractorTaxForms } from '../../shared/useContractorTaxForms'
import { toDocumentRows, type DocumentRow } from './documentRows'
import { DataView, EmptyData, useDataView, Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

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
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone read-only "Documents" card.
 *
 * @remarks
 * Lists the contractor's tax forms (1099s) and documents (W-9) in a single
 * table, forms first, with a per-row "View" action that opens the row's PDF in
 * a new tab. These are two distinct API resources — the documents endpoint
 * serves only the W-9 — so the card composes
 * {@link useContractorDocumentsList} and `useContractorTaxForms`.
 *
 * Read-only. Document signing happens during contractor onboarding, not from
 * this surface, and contractor forms cannot be signed through the API at all —
 * so form rows show no signing status.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/documents/card/viewRequested` | Fired when a row's "View" button is clicked, before the PDF is fetched | `{ contractorId: string, documentUuid: string }` for a document row, `{ contractorId: string, formId: string }` for a tax form row |
 * | `contractor/management/documents/card/viewed` | Fired after the PDF is fetched and opened in a new tab | `{ contractorId: string, documentUuid: string }` for a document row, `{ contractorId: string, formId: string }` for a tax form row |
 *
 * @param props - See {@link DocumentsCardProps}.
 * @returns The contractor documents card.
 * @public
 */
export function DocumentsCard({ LoaderComponent, ...props }: DocumentsCardProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Management.Documents"
      LoaderComponent={LoaderComponent}
    >
      <DocumentsCardContent LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function DocumentsCardContent({ contractorId, onEvent, LoaderComponent }: DocumentsCardProps) {
  useI18n('Contractor.Management.Documents')
  const { t } = useTranslation('Contractor.Management.Documents')
  const Components = useComponentContext()
  const documentsList = useContractorDocumentsList({ contractorId })
  const taxForms = useContractorTaxForms({ contractorId })

  const isLoading = documentsList.isLoading || taxForms.isLoading
  const rows = isLoading
    ? []
    : toDocumentRows({ forms: taxForms.data.forms, documents: documentsList.data.documents })
  const isShowingTable = rows.length > 0

  const columns = [
    {
      key: 'title',
      title: t('nameColumn'),
      render: (row: DocumentRow) => (
        <Components.Text weight="medium" size="sm">
          {row.title ?? row.name ?? t('emptyPlaceholder')}
        </Components.Text>
      ),
    },
    {
      key: 'description',
      title: t('descriptionColumn'),
      render: (row: DocumentRow) => (
        <Components.Text variant="supporting" size="sm">
          {row.description ?? t('emptyPlaceholder')}
        </Components.Text>
      ),
    },
    {
      key: 'signingStatus',
      title: t('signingStatusColumn'),
      render: (row: DocumentRow) => {
        if (row.kind === 'form') {
          return (
            <Components.Text variant="supporting" size="sm">
              {t('emptyPlaceholder')}
            </Components.Text>
          )
        }
        return requiresSignature(row) ? (
          <Components.Badge status="warning">{t('signingStatus.notSigned')}</Components.Badge>
        ) : (
          <Components.Badge status="success">{t('signingStatus.signed')}</Components.Badge>
        )
      },
    },
  ]

  const dataViewProps = useDataView({
    data: rows,
    columns,
    itemMenu: row => <ViewButton contractorId={contractorId} row={row} onEvent={onEvent} />,
    emptyState: () => <EmptyData title={t('emptyState.title')} />,
  })

  return (
    <BaseLayout
      error={[...documentsList.errorHandling.errors, ...taxForms.errorHandling.errors]}
      LoaderComponent={LoaderComponent}
    >
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
  row,
  onEvent,
}: {
  contractorId: string
  row: DocumentRow
  onEvent: OnEventType<EventType, unknown>
}) {
  const { t } = useTranslation('Contractor.Management.Documents')
  const Components = useComponentContext()
  const [isOpening, setIsOpening] = useState(false)

  // The PDF endpoints return a signed URL that expires within seconds, so both
  // stay disabled until the row is clicked rather than being fetched with the list.
  const documentPdfQuery = useContractorDocumentsGetPdf(
    { documentUuid: row.uuid },
    { enabled: false },
  )
  const formPdfQuery = useContractorFormsGetPdf(
    { contractorUuid: contractorId, formId: row.uuid },
    { enabled: false },
  )

  const eventPayload =
    row.kind === 'form'
      ? { contractorId, formId: row.uuid }
      : { contractorId, documentUuid: row.uuid }

  const handleView = async () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED, eventPayload)
    setIsOpening(true)
    try {
      const url =
        row.kind === 'form'
          ? (await formPdfQuery.refetch()).data?.formPdf?.documentUrl
          : (await documentPdfQuery.refetch()).data?.documentPdf?.documentUrl
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
        onEvent(componentEvents.CONTRACTOR_MANAGEMENT_DOCUMENTS_CARD_VIEWED, eventPayload)
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
