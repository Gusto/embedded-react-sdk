import { useContractorList } from '../shared/useContractorList'
import { ContractorListView } from './ContractorListView'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link ContractorList}.
 *
 * @public
 */
export interface ContractorListProps extends BaseComponentInterface<'Contractor.ContractorList'> {
  /** The associated company identifier. */
  companyId: string
  /** Success message to display in an alert above the list, typically after a create, update, or delete action. */
  successMessage?: string
}

function ContractorListRoot({
  companyId,
  onEvent,
  dictionary,
  successMessage,
}: ContractorListProps) {
  useI18n('Contractor.ContractorList')
  useComponentDictionary('Contractor.ContractorList', dictionary)

  const contractorList = useContractorList({ companyId })

  if (contractorList.isLoading) {
    return <BaseLayout isLoading error={contractorList.errorHandling.errors} />
  }

  const handleAddContractor = () => {
    onEvent(componentEvents.CONTRACTOR_CREATE)
  }

  const handleEdit = (contractorId: string) => {
    onEvent(componentEvents.CONTRACTOR_UPDATE, { contractorId })
  }

  const handleContinue = () => {
    onEvent(componentEvents.CONTRACTOR_ONBOARDING_CONTINUE)
  }

  return (
    <BaseLayout error={contractorList.errorHandling.errors}>
      <ContractorListView
        contractors={contractorList.data.contractors}
        isFetching={contractorList.status.isFetching}
        pagination={contractorList.pagination}
        status={contractorList.status}
        successMessage={successMessage}
        onEdit={handleEdit}
        onDelete={async (contractorId: string) => {
          await contractorList.actions.onDelete(contractorId)
          onEvent(componentEvents.CONTRACTOR_DELETED, { contractorId })
        }}
        onCancelSelfOnboarding={async (contractorId: string) => {
          const onboardingStatus = await contractorList.actions.onCancelSelfOnboarding(contractorId)
          if (!onboardingStatus) return
          onEvent(componentEvents.CONTRACTOR_SELF_ONBOARDING_CANCELLED, onboardingStatus)
        }}
        onAddContractor={handleAddContractor}
        onContinue={handleContinue}
      />
    </BaseLayout>
  )
}

/**
 * Lists a company's contractors with controls to add, edit, delete, cancel self-onboarding, and continue onboarding.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/create` | The add-contractor action was triggered. | — |
 * | `contractor/update` | A contractor row's edit action was triggered. | `{ contractorId: string }` |
 * | `contractor/deleted` | A contractor was successfully deleted. | `{ contractorId: string }` |
 * | `contractor/selfOnboarding/cancelled` | A contractor's self-onboarding was cancelled, reverting them to admin onboarding. | The updated `contractorOnboardingStatus` returned by the API. |
 * | `contractor/onboarding/continue` | The continue action was triggered to advance onboarding. | — |
 *
 * @param props - See {@link ContractorListProps}.
 * @returns The rendered contractor list.
 * @public
 */
export function ContractorList({ FallbackComponent, ...props }: ContractorListProps) {
  return (
    <BaseBoundaries componentName="Contractor.ContractorList" FallbackComponent={FallbackComponent}>
      <ContractorListRoot {...props} />
    </BaseBoundaries>
  )
}
