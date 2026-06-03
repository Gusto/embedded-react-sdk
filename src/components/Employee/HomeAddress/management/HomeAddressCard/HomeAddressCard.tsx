import { useTranslation } from 'react-i18next'
import { useHomeAddressSummary } from '../../shared/useHomeAddressSummary'
import { Loading } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { getStreet, getCityStateZip } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface HomeAddressCardProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "Home address" card. Owns its own data fetch via
 * `useHomeAddressSummary` and emits
 * `EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_REQUESTED` when the Manage
 * button is clicked. The card has no alert API — alert rendering
 * (when introduced) is the orchestrator's responsibility.
 */
export function HomeAddressCard({ employeeId, onEvent }: HomeAddressCardProps) {
  useI18n('Employee.HomeAddress.Management')
  const { t } = useTranslation('Employee.HomeAddress.Management')
  const Components = useComponentContext()

  const summary = useHomeAddressSummary({ employeeId })

  const isLoading = summary.isLoading
  const currentHomeAddress = summary.isLoading ? undefined : summary.data.currentHomeAddress

  const handleManage = () => {
    onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_REQUESTED, { employeeId })
  }

  return (
    <BaseLayout error={summary.errorHandling.errors}>
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
