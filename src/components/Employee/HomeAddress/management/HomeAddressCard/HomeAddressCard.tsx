import { useTranslation } from 'react-i18next'
import { useHomeAddressSummary } from '../../shared/useHomeAddressSummary'
import { Loading } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { getStreet, getCityStateZip } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link HomeAddressCard}.
 *
 * @public
 */
export interface HomeAddressCardProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired when the card's Manage button is clicked. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone employee home address summary card.
 *
 * @remarks
 * Fetches the employee's active home address and renders it alongside a Manage button.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/homeAddress/editRequested` | Manage button clicked | `{ employeeId: string }` |
 *
 * @public
 */
export function HomeAddressCard(props: HomeAddressCardProps) {
  return (
    <BaseBoundaries
      componentName="Employee.Management.HomeAddress"
      LoaderComponent={props.LoaderComponent}
    >
      <HomeAddressCardContent {...props} />
    </BaseBoundaries>
  )
}

function HomeAddressCardContent({ employeeId, onEvent, LoaderComponent }: HomeAddressCardProps) {
  useI18n('Employee.Management.HomeAddress')
  const { t } = useTranslation('Employee.Management.HomeAddress')
  const Components = useComponentContext()

  const summary = useHomeAddressSummary({ employeeId })

  const isLoading = summary.isLoading
  const currentHomeAddress = summary.isLoading ? undefined : summary.data.currentHomeAddress

  const handleManage = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_HOME_ADDRESS_EDIT_REQUESTED, { employeeId })
  }

  return (
    <BaseLayout error={summary.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('card.title')}
            action={
              <Components.Button variant="secondary" onClick={handleManage} isDisabled={isLoading}>
                {t('card.manageCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : currentHomeAddress ? (
            <Flex flexDirection="column" gap={0}>
              <Components.Text weight="medium">
                {getStreet(currentHomeAddress).replace(',', '')}
              </Components.Text>
              <Components.Text variant="supporting">
                {getCityStateZip(currentHomeAddress)}
              </Components.Text>
            </Flex>
          ) : (
            <Components.Text>{t('card.noAddress')}</Components.Text>
          )}
        </Flex>
      </Components.Box>
    </BaseLayout>
  )
}
