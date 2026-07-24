import { useTranslation } from 'react-i18next'
import { useContractorProfileSummary } from '../../shared/useContractorProfileSummary'
import { Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { firstLastName } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
import { componentEvents, CONTRACTOR_TYPE, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link ProfileCard}.
 *
 * @public
 */
export interface ProfileCardProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Event handler fired when the user requests to edit the profile. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Read-only card showing a contractor's basic profile details with an Edit action.
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
 * | `contractor/management/profile/editRequested` | Fired when the user clicks the Edit button | `{ contractorId: string }` |
 *
 * @param props - See {@link ProfileCardProps}.
 * @returns The basic-details profile card.
 * @public
 */
export function ProfileCard(props: ProfileCardProps) {
  return (
    <BaseBoundaries componentName="Contractor.Management.Profile">
      <ProfileCardContent {...props} />
    </BaseBoundaries>
  )
}

function ProfileCardContent({ contractorId, onEvent }: ProfileCardProps) {
  useI18n('Contractor.Management.Profile')
  const { t } = useTranslation('Contractor.Management.Profile')
  const Components = useComponentContext()

  const profile = useContractorProfileSummary({ contractorId })

  const isContractorLoading = profile.isLoading

  const contractor = profile.isLoading ? undefined : profile.data.contractor

  const isBusiness = contractor?.type === CONTRACTOR_TYPE.BUSINESS

  const legalName = contractor
    ? isBusiness
      ? contractor.businessName
      : firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
    : undefined
  const startDate = contractor ? formatDateLongWithYear(contractor.startDate) : undefined
  const maskedSsn = contractor?.hasSsn ? 'XXX-XX-XXXX' : undefined
  const maskedEin = contractor?.hasEin ? (contractor.ein ?? undefined) : undefined

  const emptyPlaceholder = <span aria-label={t('listEmptyPlaceholder')}>–</span>
  const profileItems = contractor
    ? [
        { term: t('legalName'), description: legalName || emptyPlaceholder },
        { term: t('startDate'), description: startDate || emptyPlaceholder },
        isBusiness
          ? {
              term: t('employerIdentificationNumber'),
              description: maskedEin || emptyPlaceholder,
            }
          : {
              term: t('socialSecurityNumber'),
              description: maskedSsn || emptyPlaceholder,
            },
        { term: t('email'), description: contractor.email || emptyPlaceholder },
      ]
    : []

  const handleEdit = () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_EDIT_REQUESTED, { contractorId })
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
                isDisabled={isContractorLoading}
              >
                {t('editCta')}
              </Components.Button>
            }
          />
        }
      >
        {isContractorLoading ? (
          <Loading />
        ) : contractor ? (
          <Components.DescriptionList items={profileItems} />
        ) : null}
      </Components.Box>
    </BaseLayout>
  )
}
