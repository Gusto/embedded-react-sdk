import type { Document } from '@gusto/embedded-api/models/components/document'
import { ActionsLayout, DataView, Flex, useDataView } from '@/components/Common'
import { EmptyData } from '@/components/Common/EmptyData/EmptyData'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ContractorDocumentListProps {
  documents: Document[]
  onRequestSign: (doc: Document) => void
  onContinue: () => void
  className?: string
}

export function ContractorDocumentList({
  documents,
  onRequestSign,
  onContinue,
  className,
}: ContractorDocumentListProps) {
  const Components = useComponentContext()

  const hasSignedAllDocs = documents.every(doc => !doc.requiresSigning || doc.signedAt)

  const dataViewProps = useDataView<Document>({
    data: documents,
    columns: [
      {
        title: 'Document',
        render: (doc: Document) => (
          <>
            <Components.Text weight="medium" size="sm">
              {doc.title ?? doc.name ?? '–'}
            </Components.Text>
            <Components.Text variant="supporting" size="sm">
              {doc.description ?? '–'}
            </Components.Text>
          </>
        ),
      },
      {
        title: 'Status',
        render: (doc: Document) =>
          doc.signedAt ? (
            <Components.Badge status="success">Signed</Components.Badge>
          ) : (
            <Components.Badge status="warning">Not signed</Components.Badge>
          ),
      },
      {
        title: '',
        render: (doc: Document) =>
          doc.signedAt ? null : (
            <Components.Button
              variant="secondary"
              onClick={() => {
                onRequestSign(doc)
              }}
            >
              Sign document
            </Components.Button>
          ),
      },
    ],
    emptyState: () => <EmptyData title="No documents to sign" />,
  })

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={24}>
        <header>
          <Components.Heading as="h2">Review and sign documents</Components.Heading>
          <Components.Text>
            Please review and sign the following documents to complete your onboarding.
          </Components.Text>
        </header>

        <DataView label="Contractor documents" {...dataViewProps} />

        <ActionsLayout>
          <Components.Button variant="primary" onClick={onContinue} isDisabled={!hasSignedAllDocs}>
            Continue
          </Components.Button>
        </ActionsLayout>
      </Flex>
    </section>
  )
}
