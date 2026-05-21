import { useTranslation } from 'react-i18next'
import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import type { EmployeeAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeaddress'
import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeworkaddress'
import { useEmployeeBasicDetails } from './hooks'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { firstLastName, getStreet, getCityStateZip } from '@/helpers/formattedStrings'
import { Loading } from '@/components/Common'
import { BaseLayout } from '@/components/Base/Base'

export interface BasicDetailsViewProps {
  employee?: Employee
  currentHomeAddress?: EmployeeAddress
  currentWorkAddress?: EmployeeWorkAddress
  isLoading?: boolean
  onEditBasicDetails?: () => void
  onManageHomeAddress?: () => void
  onManageWorkAddress?: () => void
}

export interface BasicDetailsViewWithDataProps {
  employeeId: string
  onEditBasicDetails?: () => void
  onManageHomeAddress?: () => void
  onManageWorkAddress?: () => void
}

/**
 * Tab-mounted container for the Basic details tab. Owns the
 * `useEmployeeBasicDetails` fetch (employee + home address + work address)
 * so the requests only fire when the tab is mounted. The presentational
 * `BasicDetailsView` stays pure for testing/stories.
 */
export function BasicDetailsViewWithData({
  employeeId,
  onEditBasicDetails,
  onManageHomeAddress,
  onManageWorkAddress,
}: BasicDetailsViewWithDataProps) {
  const basicDetails = useEmployeeBasicDetails({ employeeId })

  if (basicDetails.isLoading) {
    return <BaseLayout isLoading error={basicDetails.errorHandling.errors} />
  }

  return (
    <BaseLayout error={basicDetails.errorHandling.errors}>
      <BasicDetailsView
        employee={basicDetails.data.employee}
        currentHomeAddress={basicDetails.data.currentHomeAddress}
        currentWorkAddress={basicDetails.data.currentWorkAddress}
        onEditBasicDetails={onEditBasicDetails}
        onManageHomeAddress={onManageHomeAddress}
        onManageWorkAddress={onManageWorkAddress}
      />
    </BaseLayout>
  )
}

export function BasicDetailsView({
  employee,
  currentHomeAddress,
  currentWorkAddress,
  isLoading = false,
  onEditBasicDetails,
  onManageHomeAddress,
  onManageWorkAddress,
}: BasicDetailsViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()

  if (isLoading || !employee) {
    return <Loading />
  }

  const legalName = firstLastName({
    first_name: employee.firstName,
    last_name: employee.lastName,
  })
  const startDate = formatDateLongWithYear(employee.jobs?.[0]?.hireDate)
  const dateOfBirth = formatDateLongWithYear(employee.dateOfBirth)
  const maskedSsn = employee.hasSsn ? 'XXX-XX-XXXX' : undefined

  return (
    <Flex flexDirection="column" gap={24}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('basicDetails.title')}
            action={
              <Components.Button variant="secondary" onClick={onEditBasicDetails}>
                {t('basicDetails.editCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          <Flex flexDirection="column" gap={12}>
            {legalName && (
              <Flex flexDirection="column" gap={0}>
                <Components.Text variant="supporting">
                  {t('basicDetails.legalName')}
                </Components.Text>
                <Components.Text>{legalName}</Components.Text>
              </Flex>
            )}

            {startDate && (
              <Flex flexDirection="column" gap={0}>
                <Components.Text variant="supporting">
                  {t('basicDetails.startDate')}
                </Components.Text>
                <Components.Text>{startDate}</Components.Text>
              </Flex>
            )}

            {maskedSsn && (
              <Flex flexDirection="column" gap={0}>
                <Components.Text variant="supporting">
                  {t('basicDetails.socialSecurityNumber')}
                </Components.Text>
                <Components.Text>{maskedSsn}</Components.Text>
              </Flex>
            )}

            {dateOfBirth && (
              <Flex flexDirection="column" gap={0}>
                <Components.Text variant="supporting">
                  {t('basicDetails.dateOfBirth')}
                </Components.Text>
                <Components.Text>{dateOfBirth}</Components.Text>
              </Flex>
            )}

            {employee.email && (
              <Flex flexDirection="column" gap={0}>
                <Components.Text variant="supporting">
                  {t('basicDetails.personalEmail')}
                </Components.Text>
                <Components.Text>{employee.email}</Components.Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Components.Box>

      <Components.Box
        header={
          <Components.BoxHeader
            title={t('homeAddress.title')}
            action={
              <Components.Button variant="secondary" onClick={onManageHomeAddress}>
                {t('homeAddress.manageCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {currentHomeAddress ? (
            <Flex flexDirection="column" gap={0}>
              <Components.Text variant="supporting">
                {t('homeAddress.currentAddress')}
              </Components.Text>
              <Components.Text>{getStreet(currentHomeAddress).replace(',', '')}</Components.Text>
              <Components.Text>{getCityStateZip(currentHomeAddress)}</Components.Text>
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
              <Components.Button variant="secondary" onClick={onManageWorkAddress}>
                {t('workAddress.manageCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {currentWorkAddress ? (
            <Flex flexDirection="column" gap={0}>
              <Components.Text variant="supporting">
                {t('workAddress.currentAddress')}
              </Components.Text>
              <Components.Text>
                {currentWorkAddress.street1}
                {currentWorkAddress.street2 ? `, ${currentWorkAddress.street2}` : ''}
              </Components.Text>
              <Components.Text>
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
