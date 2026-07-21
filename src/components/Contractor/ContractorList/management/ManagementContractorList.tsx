import { useState } from 'react'
import { useContractorList, type ContractorType } from '../shared/useContractorList'
import { ManagementContractorListView } from './ManagementContractorListView'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/**
 * The tab currently selected on {@link ManagementContractorList}.
 *
 * @public
 */
export type ContractorTab = 'active' | 'onboarding' | 'dismissed'

/**
 * Props for {@link ManagementContractorList}.
 *
 * @public
 */
export interface ManagementContractorListProps extends BaseComponentInterface<'Contractor.ManagementContractorList'> {
  /** The associated company identifier. */
  companyId: string
  /** Tab to render first: Active, Onboarding, or Dismissed. Defaults to `'active'`. */
  initialTab?: ContractorTab
}

const mapTabToContractorType = (tab: ContractorTab): ContractorType => {
  switch (tab) {
    case 'active':
      return 'active'
    case 'onboarding':
      return 'onboarding'
    case 'dismissed':
      return 'terminated'
  }
}

function ManagementContractorListRoot({
  companyId,
  initialTab = 'active',
  onEvent,
  dictionary,
}: ManagementContractorListProps) {
  useI18n('Contractor.ManagementContractorList')
  useComponentDictionary('Contractor.ManagementContractorList', dictionary)

  const [selectedTab, setSelectedTab] = useState<ContractorTab>(initialTab)

  const contractorList = useContractorList({
    companyId,
    contractorType: mapTabToContractorType(selectedTab),
  })

  if (contractorList.isLoading) {
    return <BaseLayout isLoading error={contractorList.errorHandling.errors} />
  }

  const handleEdit = (contractorId: string) => {
    onEvent(componentEvents.CONTRACTOR_UPDATE, { contractorId })
  }

  const handleView = (contractorId: string) => {
    onEvent(componentEvents.CONTRACTOR_VIEW, { contractorId })
  }

  const handleAddContractor = () => {
    onEvent(componentEvents.CONTRACTOR_CREATE)
  }

  const handleDismiss = (contractorId: string) => {
    onEvent(componentEvents.CONTRACTOR_DISMISS, { contractorId })
  }

  const handleRehire = (contractorId: string) => {
    onEvent(componentEvents.CONTRACTOR_REHIRE, { contractorId })
  }

  const handleTabChange = (tab: ContractorTab) => {
    setSelectedTab(tab)
  }

  return (
    <BaseLayout error={contractorList.errorHandling.errors}>
      <ManagementContractorListView
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        contractors={contractorList.data.contractors}
        isFetching={contractorList.status.isFetching}
        pagination={contractorList.pagination}
        status={contractorList.status}
        onEdit={handleEdit}
        onView={handleView}
        onDismiss={handleDismiss}
        onRehire={handleRehire}
        onDelete={async (contractorId: string) => {
          await contractorList.actions.onDelete(contractorId)
          onEvent(componentEvents.CONTRACTOR_DELETED, { contractorId })
        }}
        onCancelSelfOnboarding={async (contractorId: string) => {
          const onboardingStatus = await contractorList.actions.onCancelSelfOnboarding(contractorId)
          if (!onboardingStatus) return
          onEvent(componentEvents.CONTRACTOR_SELF_ONBOARDING_CANCELLED, onboardingStatus)
        }}
        onCancelDismissal={async (contractorId: string) => {
          await contractorList.actions.onCancelDismissal(contractorId)
          onEvent(componentEvents.CONTRACTOR_DISMISSAL_CANCELLED, { contractorId })
        }}
        onCancelRehire={async (contractorId: string) => {
          await contractorList.actions.onCancelRehire(contractorId)
          onEvent(componentEvents.CONTRACTOR_REHIRE_CANCELLED, { contractorId })
        }}
        onAddContractor={handleAddContractor}
      />
    </BaseLayout>
  )
}

/**
 * Renders a tabbed list of a company's contractors split across Active, Onboarding, and Dismissed
 * tabs, with per-row actions tailored to each tab (edit, delete, view details, dismiss, rehire,
 * cancel a scheduled dismissal or rehire).
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/create` | Fired when the user clicks "Add contractor". | — |
 * | `contractor/update` | Fired when the user selects "Edit"/"Review" on an onboarding-tab row. | `{ contractorId: string }` |
 * | `contractor/view` | Fired when the user selects "View details" on an active or dismissed row. | `{ contractorId: string }` |
 * | `contractor/deleted` | Fired after an onboarding-tab row's "Remove" action completes. | `{ contractorId: string }` |
 * | `contractor/selfOnboarding/cancelled` | Fired after the "Cancel self-onboarding" action updates a contractor's onboarding status. | The updated `contractorOnboardingStatus` returned by the API. |
 * | `contractor/dismiss` | Fired when the user selects "Dismiss" on an active row. No mutation is performed by this component. | `{ contractorId: string }` |
 * | `contractor/rehire` | Fired when the user selects "Rehire" on a dismissed row. No mutation is performed by this component. | `{ contractorId: string }` |
 * | `contractor/dismissal/cancelled` | Fired after a scheduled dismissal is cancelled via the confirm dialog. | `{ contractorId: string }` |
 * | `contractor/rehire/cancelled` | Fired after a scheduled rehire is cancelled via the confirm dialog. | `{ contractorId: string }` |
 *
 * @public
 */
export function ManagementContractorList({
  FallbackComponent,
  ...props
}: ManagementContractorListProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.ManagementContractorList"
      FallbackComponent={FallbackComponent}
    >
      <ManagementContractorListRoot {...props} />
    </BaseBoundaries>
  )
}
