import { useTranslation } from 'react-i18next'
import { useContractorAddressSummary } from '../../shared/useContractorAddressSummary'
import { Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, CONTRACTOR_TYPE, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link AddressCard}.
 *
 * @public
 */
export interface AddressCardProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Event handler fired when the user requests to edit the address. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Read-only card showing a contractor's mailing address with an Edit action.
 *
 * @remarks
 * Standalone card that fetches its own data. Emits an event when the user
 * clicks Edit so the parent can switch to the edit form. The card does not
 * render success or error alerts itself — alert presentation is the
 * surrounding surface's responsibility.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/address/editRequested` | Fired when the user clicks the Edit button | `{ contractorId: string }` |
 *
 * @param props - See {@link AddressCardProps}.
 * @returns The contractor address card.
 * @public
 */
export function AddressCard(props: AddressCardProps) {
  return (
    <BaseBoundaries componentName="Contractor.Management.Address">
      <AddressCardContent {...props} />
    </BaseBoundaries>
  )
}

function AddressCardContent({ contractorId, onEvent }: AddressCardProps) {
  useI18n('Contractor.Management.Address')
  const { t } = useTranslation('Contractor.Management.Address')
  const Components = useComponentContext()

  const summary = useContractorAddressSummary({ contractorId })

  const isLoading = summary.isLoading
  const contractorAddress = summary.isLoading ? undefined : summary.data.contractorAddress
  const isBusiness = !summary.isLoading && summary.data.contractorType === CONTRACTOR_TYPE.BUSINESS

  const emptyPlaceholder = <span aria-label={t('listEmptyPlaceholder')}>–</span>
  const addressItems = contractorAddress
    ? [
        { term: t('addressLine1'), description: contractorAddress.street1 || emptyPlaceholder },
        { term: t('addressLine2'), description: contractorAddress.street2 || emptyPlaceholder },
        { term: t('city'), description: contractorAddress.city || emptyPlaceholder },
        { term: t('state'), description: contractorAddress.state || emptyPlaceholder },
        { term: t('zip'), description: contractorAddress.zip || emptyPlaceholder },
      ]
    : []

  const handleEdit = () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_REQUESTED, { contractorId })
  }

  return (
    <BaseLayout error={summary.errorHandling.errors}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={isBusiness ? t('businessTitle') : t('homeTitle')}
            action={
              <Components.Button variant="secondary" onClick={handleEdit} isDisabled={isLoading}>
                {t('editCta')}
              </Components.Button>
            }
          />
        }
      >
        {isLoading ? (
          <Loading />
        ) : contractorAddress ? (
          <Components.DescriptionList items={addressItems} />
        ) : null}
      </Components.Box>
    </BaseLayout>
  )
}
