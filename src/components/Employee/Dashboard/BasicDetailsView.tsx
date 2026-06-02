import { useTranslation } from 'react-i18next'
import type { EmployeeAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeaddress'
import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeworkaddress'
import { useEmployeeBasicDetails } from './hooks'
import { ProfileCard } from '@/components/Employee/Profile/management/ProfileCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { getStreet, getCityStateZip } from '@/helpers/formattedStrings'
import { Loading } from '@/components/Common'
import { BaseLayout } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface BasicDetailsViewProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
  currentHomeAddress?: EmployeeAddress
  currentWorkAddress?: EmployeeWorkAddress
  /** Loads the address cards. Per-section flags below take precedence
   *  when each query resolves independently. */
  isLoading?: boolean
  isHomeAddressLoading?: boolean
  isWorkAddressLoading?: boolean
  onManageHomeAddress?: () => void
  onManageWorkAddress?: () => void
}

export interface BasicDetailsViewWithDataProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
  onManageHomeAddress?: () => void
  onManageWorkAddress?: () => void
}

/**
 * Tab-mounted container for the Basic details tab. Owns the
 * `useEmployeeBasicDetails` fetch for the home + work address cards.
 * The basic-details card is now self-fetching via `<ProfileCard />`,
 * so this container no longer threads employee data through.
 */
export function BasicDetailsViewWithData({
  employeeId,
  onEvent,
  onManageHomeAddress,
  onManageWorkAddress,
}: BasicDetailsViewWithDataProps) {
  const basicDetails = useEmployeeBasicDetails({ employeeId })

  return (
    <BaseLayout error={basicDetails.errorHandling.errors}>
      <BasicDetailsView
        employeeId={employeeId}
        onEvent={onEvent}
        currentHomeAddress={basicDetails.data.currentHomeAddress}
        currentWorkAddress={basicDetails.data.currentWorkAddress}
        isHomeAddressLoading={basicDetails.status.isHomeAddressLoading}
        isWorkAddressLoading={basicDetails.status.isWorkAddressLoading}
        onManageHomeAddress={onManageHomeAddress}
        onManageWorkAddress={onManageWorkAddress}
      />
    </BaseLayout>
  )
}

export function BasicDetailsView({
  employeeId,
  onEvent,
  currentHomeAddress,
  currentWorkAddress,
  isLoading = false,
  isHomeAddressLoading = isLoading,
  isWorkAddressLoading = isLoading,
  onManageHomeAddress,
  onManageWorkAddress,
}: BasicDetailsViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={24}>
      <ProfileCard employeeId={employeeId} onEvent={onEvent} />

      <Components.Box
        header={
          <Components.BoxHeader
            title={t('homeAddress.title')}
            action={
              <Components.Button
                variant="secondary"
                onClick={onManageHomeAddress}
                isDisabled={isHomeAddressLoading}
              >
                {t('homeAddress.manageCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isHomeAddressLoading ? (
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
            <Components.Text>{t('homeAddress.noAddress')}</Components.Text>
          )}
        </Flex>
      </Components.Box>

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
