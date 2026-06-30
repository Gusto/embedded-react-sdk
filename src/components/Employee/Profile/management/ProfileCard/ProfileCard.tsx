import { useTranslation } from 'react-i18next'
import { useEmployeeProfileSummary } from '../../shared/useEmployeeProfileSummary'
import { Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { firstLastName } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link ProfileCard}.
 *
 * @public
 */
export interface ProfileCardProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired when the user requests to edit the profile. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Read-only card showing an employee's basic profile details with an Edit action.
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
 * | `employee/management/profile/editRequested` | Fired when the user clicks the Edit button | `{ employeeId: string }` |
 *
 * @param props - See {@link ProfileCardProps}.
 * @returns The basic-details profile card.
 * @public
 */
export function ProfileCard(props: ProfileCardProps) {
  return (
    <BaseBoundaries componentName="Employee.Management.Profile">
      <ProfileCardContent {...props} />
    </BaseBoundaries>
  )
}

function ProfileCardContent({ employeeId, onEvent }: ProfileCardProps) {
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
