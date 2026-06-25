import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { ContractorDocumentSignatureDemo } from './ContractorDocumentSignatureStates'

export const contractorDocumentSignatureConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'default',
    name: 'Default',
    description:
      'A typical document signing screen — title, description, View document link to the W-9 PDF, signature input, and agree checkbox.',
    render: () => (
      <ContractorDocumentSignatureDemo
        title="Form W-9"
        description="Please review and sign your W-9 to proceed."
        pdfUrl="/sample-documents/w9.pdf"
      />
    ),
  },
  {
    slug: 'pending',
    name: 'Submitting',
    description: 'Sign-document mutation is in flight — button shows the loading state.',
    render: () => (
      <ContractorDocumentSignatureDemo
        title="Form W-9"
        description="Please review and sign your W-9 to proceed."
        pdfUrl="/sample-documents/w9.pdf"
        isPending
      />
    ),
  },
]
