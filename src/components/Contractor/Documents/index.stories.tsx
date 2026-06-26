import { fn } from 'storybook/test'
import { ContractorDocumentSigner } from './ContractorDocumentSigner'
import { DocumentsList } from './DocumentsList'
import { SignatureForm } from './SignatureForm'

export default {
  title: 'Domain/Contractor/Documents',
}

const contractorId = 'mock-contractor-id'
const documentUuid = 'mock-document-uuid'

export const DocumentSigner = () => (
  <ContractorDocumentSigner
    contractorId={contractorId}
    onEvent={fn().mockName('Domain/Contractor/Documents')}
  />
)

export const List = () => (
  <DocumentsList
    contractorId={contractorId}
    onEvent={fn().mockName('Domain/Contractor/Documents/List')}
  />
)

export const Signature = () => (
  <SignatureForm
    contractorId={contractorId}
    documentUuid={documentUuid}
    onEvent={fn().mockName('Domain/Contractor/Documents/Signature')}
  />
)
