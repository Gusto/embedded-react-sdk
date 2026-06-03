import { useTranslation } from 'react-i18next'
import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeworkaddress'
import { useEmployeeBasicDetails } from './hooks'
import { ProfileCard } from '@/components/Employee/Profile/management/ProfileCard'
import { HomeAddressCard } from '@/components/Employee/HomeAddress/management/HomeAddressCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Loading } from '@/components/Common'
import { BaseLayout } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface BasicDetailsViewProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
  currentWorkAddress?: EmployeeWorkAddress
  /** Loads the work address card. */
  isLoading?: boolean
  isWorkAddressLoading?: boolean
  onManageWorkAddress?: () => void
}

export interface BasicDetailsViewWithDataProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
  onManageWorkAddress?: () => void
}

/**
 * Tab-mounted container for the Basic details tab. Owns the
 * `useEmployeeBasicDetails` fetch for the work address card. The
 * basic-details card is self-fetching via `<ProfileCard />`, and the
 * home address card is self-fetching via `<HomeAddressCard />`, so
 * this container only threads work-address data through.
 */
export function BasicDetailsViewWithData({
  employeeId,
  onEvent,
  onManageWorkAddress,
}: BasicDetailsViewWithDataProps) {
  const basicDetails = useEmployeeBasicDetails({ employeeId })

  return (
    <BaseLayout error={basicDetails.errorHandling.errors}>
      <BasicDetailsView
        employeeId={employeeId}
        onEvent={onEvent}
        currentWorkAddress={basicDetails.data.currentWorkAddress}
        isWorkAddressLoading={basicDetails.status.isWorkAddressLoading}
        onManageWorkAddress={onManageWorkAddress}
      />
    </BaseLayout>
  )
}

export function BasicDetailsView({
  employeeId,
  onEvent,
  currentWorkAddress,
  isLoading = false,
  isWorkAddressLoading = isLoading,
  onManageWorkAddress,
}: BasicDetailsViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={24}>
      <ProfileCard employeeId={employeeId} onEvent={onEvent} />

      <HomeAddressCard employeeId={employeeId} onEvent={onEvent} />

      <Components.Box
        header={
          <Components.BoxHeader
            title={t('workAddress.title')}
            action={
              <Components.Button
                variant="secondary"
                onClick={onManageWorkAddress}
                isDisabled={isWorkAddressLoading}
              >
                {t('workAddress.manageCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isWorkAddressLoading ? (
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
            <Components.Text>{t('workAddress.noAddress')}</Components.Text>
          )}
        </Flex>
      </Components.Box>
    </Flex>
  )
}
