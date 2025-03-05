import { type ReactNode } from 'react'
import { Head } from './Head'
import { List } from './List'
import { ManageSignatories } from './ManageSignatories'
import { Actions } from './Actions'
import { useI18n } from '@/i18n'
import {
  useBase,
  BaseComponent,
  createCompoundContext,
  type BaseComponentInterface,
} from '@/components/Base/Base'
import { useGetAllCompanyForms } from '@/api/queries/companyForms'
import { useGetAllSignatories } from '@/api/queries/company'
import { Flex } from '@/components/Common'
import { type Schemas } from '@/types/schema'
import { companyEvents } from '@/shared/constants'

type DocumentListContextType = {
  companyForms: Schemas['Form'][]
  documentListError: Error | null
  handleRequestFormToSign: (form: Schemas['Form']) => void
  handleChangeSignatory: () => void
  handleContinue: () => void
  isSelfSignatory: boolean
  signatory?: Schemas['Signatory']
}

const [useDocumentList, DocumentListProvider] = createCompoundContext<DocumentListContextType>(
  'CompanyDocumentListContext',
)

export { useDocumentList }

interface DocumentListProps {
  companyId: string
  signatoryId?: string
  className?: string
  children?: ReactNode
}

export function DocumentList({
  companyId,
  signatoryId,
  className,
  children,
  ...props
}: DocumentListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} signatoryId={signatoryId} className={className}>
        {children}
      </Root>
    </BaseComponent>
  )
}

function Root({ companyId, signatoryId, className, children }: DocumentListProps) {
  useI18n('Company.DocumentList')
  const { onEvent } = useBase()

  const { data: companyForms = [], error: documentListError } = useGetAllCompanyForms(companyId)
  const { data: signatories = [] } = useGetAllSignatories(companyId)

  // For now, this will only ever have one entry for the current signatory since companies can
  // only have one signatory. If that changes in the future, this UX will need to be revisited.
  const signatory = signatories[0]
  const isSelfSignatory = !!signatoryId && signatory?.uuid === signatoryId

  const handleRequestFormToSign = (form: Schemas['Form']) => {
    onEvent(companyEvents.COMPANY_VIEW_FORM_TO_SIGN, form)
  }

  const handleChangeSignatory = () => {
    onEvent(companyEvents.COMPANY_FORM_EDIT_SIGNATORY, signatory)
  }

  const handleContinue = () => {
    onEvent(companyEvents.COMPANY_FORMS_DONE)
  }

  return (
    <section className={className}>
      <DocumentListProvider
        value={{
          companyForms,
          documentListError,
          handleRequestFormToSign,
          handleChangeSignatory,
          handleContinue,
          isSelfSignatory,
          signatory,
        }}
      >
        <Flex flexDirection="column" gap={32}>
          {children ? (
            children
          ) : (
            <>
              <Head />
              <ManageSignatories />
              <List />
              <Actions />
            </>
          )}
        </Flex>
      </DocumentListProvider>
    </section>
  )
}

DocumentList.Head = Head
DocumentList.ManageSignatories = ManageSignatories
DocumentList.List = List
DocumentList.Actions = Actions
