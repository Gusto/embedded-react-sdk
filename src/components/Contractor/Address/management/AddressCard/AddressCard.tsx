import { useTranslation } from 'react-i18next'
import { useContractorAddressSummary } from '../../shared/useContractorAddressSummary'
import { Loading } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

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
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
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
export function AddressCard({ LoaderComponent, ...props }: AddressCardProps) {
  return (
    <BaseBoundaries componentName="Contractor.Management.Address" LoaderComponent={LoaderComponent}>
      <AddressCardContent LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function AddressCardContent({ contractorId, onEvent, LoaderComponent }: AddressCardProps) {
  useI18n('Contractor.Management.Address')
  const { t } = useTranslation('Contractor.Management.Address')
  const Components = useComponentContext()

  const summary = useContractorAddressSummary({ contractorId })

  const isLoading = summary.isLoading
  const contractorAddress = summary.isLoading ? undefined : summary.data.contractorAddress

  const handleEdit = () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_REQUESTED, { contractorId })
  }

  return (
    <BaseLayout error={summary.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('title')}
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
        ) : contractorAddress?.street1 ? (
          <Flex flexDirection="column" gap={0}>
            <Components.Text weight="medium">{contractorAddress.street1}</Components.Text>
            {contractorAddress.street2 && (
              <Components.Text>{contractorAddress.street2}</Components.Text>
            )}
            <Components.Text>
              {contractorAddress.city}, {contractorAddress.state} {contractorAddress.zip}
            </Components.Text>
          </Flex>
        ) : (
          <Components.Text>{t('emptyPlaceholder')}</Components.Text>
        )}
      </Components.Box>
    </BaseLayout>
  )
}
