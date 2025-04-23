import { useTaxRequirementsGetAllSuspense } from '@gusto/embedded-api/react-query/taxRequirementsGetAll'
import { Head } from './Head'
import { StateTaxesListProvider } from './context'
import { Actions } from './Actions'
import { List } from './List'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { componentEvents } from '@/shared/constants'

interface StateTaxesListProps extends CommonComponentInterface {
  companyId: string
}

export function StateTaxesList(props: StateTaxesListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, children, companyId }: StateTaxesListProps) {
  useI18n('Company.StateTaxes')
  const { onEvent } = useBase()
  const { data } = useTaxRequirementsGetAllSuspense({ companyUuid: companyId })
  const stateTaxeRequirements = data.responseBodies!

  const handleContinue = () => {
    onEvent(componentEvents.COMPANY_STATE_TAX_DONE)
  }

  const handleChange = () => {
    onEvent(componentEvents.COMPANY_STATE_TAX_EDIT)
  }

  return (
    <section className={className}>
      <StateTaxesListProvider
        value={{
          isPending: false,
          stateTaxeRequirements,
          handleContinue,
          handleChange,
        }}
      >
        <Flex flexDirection="column" gap={32}>
          {children ? (
            children
          ) : (
            <>
              <Head />
              <List />
              <Actions />
            </>
          )}
        </Flex>
      </StateTaxesListProvider>
    </section>
  )
}

StateTaxesList.Head = Head
StateTaxesList.List = List
StateTaxesList.Actions = Actions
