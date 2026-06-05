import { useTranslation } from 'react-i18next'
import { useEmployeeWorkAddressSummary } from '../../shared/useEmployeeWorkAddressSummary'
import { Loading } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface WorkAddressCardProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "Work address" card. Owns its own data fetch via
 * `useEmployeeWorkAddressSummary` and emits
 * `EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED` when the Manage button
 * is clicked. The card has no alert API — alert rendering is the
 * orchestrator's responsibility (block's `WorkAddressCardContextual` for
 * standalone consumption, dashboard chrome for dashboard consumption).
 */
export function WorkAddressCard(props: WorkAddressCardProps) {
  return (
    <BaseBoundaries componentName="Employee.Management.WorkAddress">
      <WorkAddressCardContent {...props} />
    </BaseBoundaries>
  )
}

function WorkAddressCardContent({ employeeId, onEvent }: WorkAddressCardProps) {
  useI18n('Employee.Management.WorkAddress')
  const { t } = useTranslation('Employee.Management.WorkAddress')
  const Components = useComponentContext()

  const summary = useEmployeeWorkAddressSummary({ employeeId })

  const isLoading = summary.isLoading
  const currentWorkAddress = summary.isLoading ? undefined : summary.data.currentWorkAddress

  const handleEdit = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED, { employeeId })
  }

  return (
    <BaseLayout error={summary.errorHandling.errors}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('cardTitle')}
            action={
              <Components.Button variant="secondary" onClick={handleEdit} isDisabled={isLoading}>
                {t('cardManageCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : currentWorkAddress ? (
            <Flex flexDirection="column" gap={0}>
              <Components.Text weight="medium">
                {currentWorkAddress.street1}
                {currentWorkAddress.street2 ? `, ${currentWorkAddress.street2}` : ''}
              </Components.Text>
              <Components.Text variant="supporting">
                {currentWorkAddress.city}, {currentWorkAddress.state} {currentWorkAddress.zip}
              </Components.Text>
            </Flex>
          ) : (
            <Components.Text>{t('cardNoAddress')}</Components.Text>
          )}
        </Flex>
      </Components.Box>
    </BaseLayout>
  )
}
