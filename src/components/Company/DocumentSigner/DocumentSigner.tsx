import { useCompanyDocumentSigner } from './useCompanyDocumentSigner'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface DocumentSignerProps extends BaseComponentInterface<'Company.DocumentList'> {
  companyId: string
  signatoryId?: string
}

function DocumentSignerFlow({ companyId, signatoryId, onEvent, dictionary }: DocumentSignerProps) {
  useComponentDictionary('Company.DocumentList', dictionary)

  const {
    meta: { machine },
  } = useCompanyDocumentSigner({ companyId, signatoryId })

  return <Flow machine={machine} onEvent={onEvent} />
}

export function DocumentSigner(props: DocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <DocumentSignerFlow {...props} />
    </BaseComponent>
  )
}
