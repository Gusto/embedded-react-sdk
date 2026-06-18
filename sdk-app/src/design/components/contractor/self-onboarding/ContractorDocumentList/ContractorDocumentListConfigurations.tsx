import type { Document } from '@gusto/embedded-api-v-2025-11-15/models/components/document'
import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { ContractorDocumentListDemo } from './ContractorDocumentListStates'

function build(overrides: Partial<Document>): Document {
  return {
    uuid: 'doc-default',
    name: 'Document',
    title: 'Document',
    description: 'A document to sign',
    requiresSigning: true,
    signedAt: null,
    fields: [],
    ...overrides,
  } as Document
}

export const contractorDocumentListConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'all-unsigned',
    name: 'All unsigned',
    description: 'Three documents waiting for signature. Continue button disabled until signed.',
    render: () => (
      <ContractorDocumentListDemo
        documents={[
          build({ uuid: 'doc-w9', title: 'W-9', description: 'Tax form' }),
          build({ uuid: 'doc-nda', title: 'NDA', description: 'Non-disclosure agreement' }),
          build({
            uuid: 'doc-handbook',
            title: 'Employee Handbook',
            description: 'Company policies',
          }),
        ]}
      />
    ),
  },
  {
    slug: 'mixed',
    name: 'Mixed signed and unsigned',
    description: 'One signed, two unsigned. Continue still disabled.',
    render: () => (
      <ContractorDocumentListDemo
        documents={[
          build({
            uuid: 'doc-w9',
            title: 'W-9',
            description: 'Tax form',
            signedAt: new Date('2025-05-15').toISOString(),
          }),
          build({ uuid: 'doc-nda', title: 'NDA', description: 'Non-disclosure agreement' }),
          build({
            uuid: 'doc-handbook',
            title: 'Employee Handbook',
            description: 'Company policies',
          }),
        ]}
      />
    ),
  },
  {
    slug: 'all-signed',
    name: 'All signed',
    description: 'Every required document signed — Continue button enabled.',
    render: () => (
      <ContractorDocumentListDemo
        documents={[
          build({
            uuid: 'doc-w9',
            title: 'W-9',
            description: 'Tax form',
            signedAt: new Date('2025-05-15').toISOString(),
          }),
          build({
            uuid: 'doc-nda',
            title: 'NDA',
            description: 'Non-disclosure agreement',
            signedAt: new Date('2025-05-15').toISOString(),
          }),
        ]}
      />
    ),
  },
  {
    slug: 'empty',
    name: 'Empty',
    description: 'No documents to sign — empty-state message renders.',
    render: () => <ContractorDocumentListDemo documents={[]} />,
  },
]
