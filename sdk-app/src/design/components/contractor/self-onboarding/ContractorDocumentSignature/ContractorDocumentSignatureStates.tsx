import { ContractorDocumentSignature } from './ContractorDocumentSignature'

export interface ContractorDocumentSignatureDemoProps {
  title: string
  description?: string | null
  pdfUrl: string | null
  isPending?: boolean
}

/**
 * Renders ContractorDocumentSignature for state demos with no-op submit
 * and back handlers.
 */
export function ContractorDocumentSignatureDemo(props: ContractorDocumentSignatureDemoProps) {
  return (
    <ContractorDocumentSignature
      {...props}
      onSubmit={async () => Promise.resolve()}
      onBack={() => {}}
    />
  )
}
