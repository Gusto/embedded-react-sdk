import { useTranslation } from 'react-i18next'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
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
  /** Loads all three cards. Per-section flags below take precedence
   *  when each query resolves independently. */
  isLoading?: boolean
  isEmployeeLoading?: boolean
  isHomeAddressLoading?: boolean
  isWorkAddressLoading?: boolean
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
 * so the requests only fire when the tab is mounted. Each card paints
 * its own skeleton + content as the underlying query resolves.
 */
export function BasicDetailsViewWithData({
  employeeId,
  onEditBasicDetails,
  onManageHomeAddress,
  onManageWorkAddress,
}: BasicDetailsViewWithDataProps) {
  const basicDetails = useEmployeeBasicDetails({ employeeId })

  return (
    <BaseLayout error={basicDetails.errorHandling.errors}>
      <BasicDetailsView
        employee={basicDetails.data.employee}
        currentHomeAddress={basicDetails.data.currentHomeAddress}
        currentWorkAddress={basicDetails.data.currentWorkAddress}
        isEmployeeLoading={basicDetails.status.isEmployeeLoading}
        isHomeAddressLoading={basicDetails.status.isHomeAddressLoading}
        isWorkAddressLoading={basicDetails.status.isWorkAddressLoading}
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
  isEmployeeLoading = isLoading,
  isHomeAddressLoading = isLoading,
  isWorkAddressLoading = isLoading,
  onEditBasicDetails,
  onManageHomeAddress,
  onManageWorkAddress,
}: BasicDetailsViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()

  const legalName = employee
    ? firstLastName({ first_name: employee.firstName, last_name: employee.lastName })
    : undefined
  const startDate = employee ? formatDateLongWithYear(employee.jobs?.[0]?.hireDate) : undefined
  const dateOfBirth = employee ? formatDateLongWithYear(employee.dateOfBirth) : undefined
  const maskedSsn = employee?.hasSsn ? 'XXX-XX-XXXX' : undefined

  const basicDetailsItems = employee
    ? [
        { term: t('basicDetails.legalName'), description: legalName || '–' },
        { term: t('basicDetails.startDate'), description: startDate || '–' },
        { term: t('basicDetails.socialSecurityNumber'), description: maskedSsn || '–' },
        { term: t('basicDetails.dateOfBirth'), description: dateOfBirth || '–' },
        { term: t('basicDetails.personalEmail'), description: employee.email || '–' },
      ]
    : []

  return (
    <Flex flexDirection="column" gap={24}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('basicDetails.title')}
            action={
              <Components.Button
                variant="secondary"
                onClick={onEditBasicDetails}
                isDisabled={isEmployeeLoading}
              >
                {t('basicDetails.editCta')}
              </Components.Button>
            }
          />
        }
      >
        {isEmployeeLoading ? (
          <Loading />
        ) : employee ? (
          <Components.DescriptionList items={basicDetailsItems} />
        ) : null}
      </Components.Box>

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
