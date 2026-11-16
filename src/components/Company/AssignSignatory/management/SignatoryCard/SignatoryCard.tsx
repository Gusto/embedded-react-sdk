import { useTranslation } from 'react-i18next'
import { isValidSignatoryTitle } from '../../shared/signatoryTitle'
import { useCompanySignatorySummary } from '../../shared/useCompanySignatorySummary'
import { Flex } from '@/components/Common/Flex/Flex'
import { Loading } from '@/components/Common'
import { EmptyData } from '@/components/Common/EmptyData/EmptyData'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { firstLastName } from '@/helpers/formattedStrings'
import { componentEvents, SIGNATORY_TITLES, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link SignatoryCard}.
 *
 * @alpha
 */
export interface SignatoryCardProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the card emits an event. See the events table on {@link SignatoryCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

const IDENTITY_VERIFICATION_BADGE_STATUS = {
  Pass: 'success',
  Fail: 'error',
  Skipped: 'warning',
} as const

/**
 * Standalone "Signatory" card summarizing the person authorized to sign a company's forms.
 *
 * @remarks
 * Owns its own data fetch and emits `company/management/signatory/editRequested`
 * when the Edit or Assign button is clicked. A company has at most one
 * signatory, so the card reports one person rather than a list. The event
 * carries the current signatory's identifier alongside the company's, which is
 * what lets an edit screen amend the existing record instead of replacing it.
 * The card renders no alerts: alert presentation is the surrounding surface's
 * responsibility.
 *
 * Identity verification is what determines whether the signatory can sign at
 * all, so the card reports it: verified, failed, awaiting completion, or
 * requiring a wet signature on Form 8655.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the
 * flag throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/signatory/editRequested` | Fired when "Edit" or "Assign signatory" is clicked | `{ companyId: string, signatoryId?: string }` |
 *
 * @param props - See {@link SignatoryCardProps}.
 * @returns The signatory summary card.
 * @alpha
 */
export function SignatoryCard(props: SignatoryCardProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  return (
    <BaseBoundaries
      componentName="Company.Management.Signatory"
      LoaderComponent={props.LoaderComponent}
    >
      <SignatoryCardContent {...props} />
    </BaseBoundaries>
  )
}

function SignatoryCardContent({ companyId, onEvent, LoaderComponent }: SignatoryCardProps) {
  useI18n('Company.Management.Signatory')
  const { t } = useTranslation('Company.Management.Signatory')
  const Components = useComponentContext()

  const summary = useCompanySignatorySummary({ companyId })

  const isLoading = summary.isLoading
  const signatory = summary.isLoading ? undefined : summary.data.signatory

  const handleEdit = () => {
    onEvent(componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED, {
      companyId,
      signatoryId: signatory?.uuid,
    })
  }

  const emptyPlaceholder = <span aria-label={t('card.listEmptyPlaceholder')}>–</span>

  const titleLabel = (title: string | null | undefined) =>
    isValidSignatoryTitle(title)
      ? t(`signatoryTitles.${SIGNATORY_TITLES[title]}`, { ns: 'common' })
      : title

  const identityVerificationStatus = signatory?.identityVerificationStatus

  const identityVerificationDescription = identityVerificationStatus ? (
    <Components.Badge status={IDENTITY_VERIFICATION_BADGE_STATUS[identityVerificationStatus]}>
      {t(`card.identityVerificationStatus.${identityVerificationStatus}`)}
    </Components.Badge>
  ) : (
    <Components.Badge status="warning">
      {t('card.identityVerificationStatus.pending')}
    </Components.Badge>
  )

  const items = signatory
    ? [
        {
          term: t('card.name'),
          description:
            firstLastName({
              first_name: signatory.firstName,
              last_name: signatory.lastName,
            }) || emptyPlaceholder,
        },
        {
          term: t('card.jobTitle'),
          description: titleLabel(signatory.title) || emptyPlaceholder,
        },
        {
          term: t('card.email'),
          description: signatory.email || emptyPlaceholder,
        },
        {
          term: t('card.identityVerification'),
          description: identityVerificationDescription,
        },
      ]
    : []

  return (
    <BaseLayout error={summary.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('card.title')}
            action={
              <Components.Button
                variant="secondary"
                onClick={handleEdit}
                isDisabled={isLoading}
                aria-label={signatory ? t('card.editAriaLabel') : undefined}
              >
                {signatory ? t('card.editCta') : t('card.assignCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : signatory ? (
            <Components.DescriptionList items={items} />
          ) : (
            <EmptyData
              title={t('card.emptyState.title')}
              description={t('card.emptyState.description')}
            />
          )}
        </Flex>
      </Components.Box>
    </BaseLayout>
  )
}
