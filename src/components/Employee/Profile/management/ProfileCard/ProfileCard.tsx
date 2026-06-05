import { useTranslation } from 'react-i18next'
import { useEmployeeProfileSummary } from '../../shared/useEmployeeProfileSummary'
import { Loading } from '@/components/Common'
import { BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { firstLastName } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface ProfileCardProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "Basic details" card. Owns its own data fetch via
 * `useEmployeeProfileSummary` and emits
 * `EMPLOYEE_MANAGEMENT_PROFILE_EDIT_REQUESTED` when the Edit button is
 * clicked. The card has no alert API — alert rendering is the
 * orchestrator's responsibility (block's `CardContextual` for standalone
 * consumption, dashboard chrome for dashboard consumption).
 */
export function ProfileCard({ employeeId, onEvent }: ProfileCardProps) {
  useI18n('Employee.Management.Profile')
  const { t } = useTranslation('Employee.Management.Profile')
  const Components = useComponentContext()

  const profile = useEmployeeProfileSummary({ employeeId })

  const isEmployeeLoading = profile.isLoading

  const employee = profile.isLoading ? undefined : profile.data.employee

  const legalName = employee
    ? firstLastName({ first_name: employee.firstName, last_name: employee.lastName })
    : undefined
  const startDate = employee ? formatDateLongWithYear(employee.jobs?.[0]?.hireDate) : undefined
  const dateOfBirth = employee ? formatDateLongWithYear(employee.dateOfBirth) : undefined
  const maskedSsn = employee?.hasSsn ? 'XXX-XX-XXXX' : undefined

  const emptyPlaceholder = <span aria-label={t('listEmptyPlaceholder')}>–</span>
  const profileItems = employee
    ? [
        { term: t('legalName'), description: legalName || emptyPlaceholder },
        { term: t('startDate'), description: startDate || emptyPlaceholder },
        { term: t('socialSecurityNumber'), description: maskedSsn || emptyPlaceholder },
        { term: t('dateOfBirth'), description: dateOfBirth || emptyPlaceholder },
        { term: t('personalEmail'), description: employee.email || emptyPlaceholder },
      ]
    : []

  const handleEdit = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PROFILE_EDIT_REQUESTED, { employeeId })
  }

  return (
    <BaseLayout error={profile.errorHandling.errors}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('title')}
            action={
              <Components.Button
                variant="secondary"
                onClick={handleEdit}
                isDisabled={isEmployeeLoading}
              >
                {t('editCta')}
              </Components.Button>
            }
          />
        }
      >
        {isEmployeeLoading ? (
          <Loading />
        ) : employee ? (
          <Components.DescriptionList items={profileItems} />
        ) : null}
      </Components.Box>
    </BaseLayout>
  )
}
