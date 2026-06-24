import { useTaxRequirementsGetAllSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/taxRequirementsGetAll'
import { Head } from './Head'
import { StateTaxesListProvider } from './context'
import { Actions } from './Actions'
import { List } from './List'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { componentEvents } from '@/shared/constants'
import { useBase } from '@/components/Base'

/**
 * Props for the {@link StateTaxesList} component.
 *
 * @public
 */
export interface StateTaxesListProps extends BaseComponentInterface<'Company.StateTaxes'> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Displays the list of state tax requirements for a company with their setup status.
 *
 * @remarks
 * Standalone building block used internally by the orchestrated `StateTaxes` component for its list view. Use this directly when you need full control over navigation between the list and form views.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/stateTaxes/edit` | A user chose to edit requirements for a specific state | `{ state: string }` |
 * | `company/stateTaxes/done` | The user chose to proceed to the next step | — |
 *
 * @param props - Component props including the `companyId` whose state tax requirements should be listed.
 * @returns The rendered state taxes list section.
 * @public
 */
export function StateTaxesList(props: StateTaxesListProps) {
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
  const stateTaxRequirements = data.taxRequirementStatesList!

  const handleContinue = () => {
    onEvent(componentEvents.COMPANY_STATE_TAX_DONE)
  }

  const handleChange = (state: string) => {
    onEvent(componentEvents.COMPANY_STATE_TAX_EDIT, { state })
  }

  return (
    <section className={className}>
      <StateTaxesListProvider
        value={{
          isPending: false,
          stateTaxRequirements,
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
