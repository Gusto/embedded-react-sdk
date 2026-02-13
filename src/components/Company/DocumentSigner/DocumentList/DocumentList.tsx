import { Head } from './Head'
import { List } from './List'
import { ManageSignatories } from './ManageSignatories'
import { Actions } from './Actions'
import { DocumentListProvider } from './useDocumentList'
import { useCompanyDocumentList } from './useCompanyDocumentList'
import { useI18n, useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { Flex } from '@/components/Common'

interface DocumentListProps extends BaseComponentInterface<'Company.DocumentList'> {
  companyId: string
  signatoryId?: string
}

export function DocumentList(props: DocumentListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, signatoryId, className, children, dictionary }: DocumentListProps) {
  useComponentDictionary('Company.DocumentList', dictionary)
  useI18n('Company.DocumentList')

  const {
    data: { companyForms, signatory, isSelfSignatory, documentListError },
    actions: { handleRequestFormToSign, handleChangeSignatory, handleContinue },
  } = useCompanyDocumentList({ companyId, signatoryId })

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
