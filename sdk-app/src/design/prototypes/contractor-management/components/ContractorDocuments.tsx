import { useCallback } from 'react'
import type { Document } from '@gusto/embedded-api/models/components/document'
import { useContractorDocumentsGetPdf } from '@gusto/embedded-api/react-query/contractorDocumentsGetPdf'
import { DataView, useDataView } from '@/components/Common/DataView'
import { EmptyData } from '@/components/Common/EmptyData/EmptyData'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

function ViewButton({ documentUuid }: { documentUuid: string }) {
  const Components = useComponentContext()
  const { refetch, isFetching } = useContractorDocumentsGetPdf({ documentUuid }, { enabled: false })

  const handleView = useCallback(async () => {
    const { data } = await refetch()
    const url = data?.documentPdf?.documentUrl
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [refetch])

  return (
    <Components.Button variant="secondary" onClick={handleView} isLoading={isFetching}>
      View
    </Components.Button>
  )
}

interface ContractorDocumentsProps {
  documents: Document[]
}

export function ContractorDocuments({ documents }: ContractorDocumentsProps) {
  const Components = useComponentContext()

  const dataViewProps = useDataView<Document>({
    data: documents,
    columns: [
      {
        title: 'Name',
        render: (doc: Document) => (
          <Components.Text weight="medium" size="sm">
            {doc.title ?? doc.name ?? '–'}
          </Components.Text>
        ),
      },
      {
        title: 'Description',
        render: (doc: Document) => (
          <Components.Text variant="supporting" size="sm">
            {doc.description ?? '–'}
          </Components.Text>
        ),
      },
      {
        title: '',
        render: (doc: Document) => (doc.uuid ? <ViewButton documentUuid={doc.uuid} /> : null),
      },
    ],
    emptyState: () => <EmptyData title="No documents yet" />,
  })

  return (
    <Components.Box
      withPadding={false}
      header={
        <Components.Heading as="h3" styledAs="h4">
          Documents
        </Components.Heading>
      }
    >
      <DataView isWithinBox label="Contractor documents" {...dataViewProps} />
    </Components.Box>
  )
}
