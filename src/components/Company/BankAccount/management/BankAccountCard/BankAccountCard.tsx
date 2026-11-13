import { useTranslation } from 'react-i18next'
import { useCompanyBankAccountSummary } from '../../shared/useCompanyBankAccountSummary'
import { Flex } from '@/components/Common/Flex/Flex'
import { Loading } from '@/components/Common'
import { EmptyData } from '@/components/Common/EmptyData/EmptyData'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link BankAccountCard}.
 *
 * @alpha
 */
export interface BankAccountCardProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the card emits an event. See the events table on {@link BankAccountCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

const VERIFICATION_BADGE_STATUS = {
  verified: 'success',
  awaiting_deposits: 'warning',
  ready_for_verification: 'info',
} as const

/**
 * Standalone "Bank account" card summarizing a company's funding account.
 *
 * @remarks
 * Owns its own data fetch and emits
 * `company/management/bankAccount/editRequested` when the Manage or Add button
 * is clicked. Gusto supports a single default company bank account, so the card
 * reports one account rather than a list. The account number is only ever
 * available masked. The card renders no alerts: alert presentation is the
 * surrounding surface's responsibility.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the
 * flag throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/bankAccount/editRequested` | Fired when "Manage" or "Add bank account" is clicked | `{ companyId: string }` |
 *
 * @param props - See {@link BankAccountCardProps}.
 * @returns The bank account summary card.
 * @alpha
 */
export function BankAccountCard(props: BankAccountCardProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  return (
    <BaseBoundaries
      componentName="Company.Management.BankAccount"
      LoaderComponent={props.LoaderComponent}
    >
      <BankAccountCardContent {...props} />
    </BaseBoundaries>
  )
}

function BankAccountCardContent({ companyId, onEvent, LoaderComponent }: BankAccountCardProps) {
  useI18n('Company.Management.BankAccount')
  const { t } = useTranslation('Company.Management.BankAccount')
  const Components = useComponentContext()

  const summary = useCompanyBankAccountSummary({ companyId })

  const isLoading = summary.isLoading
  const bankAccount = summary.isLoading ? undefined : summary.data.bankAccount

  const handleManage = () => {
    onEvent(componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_REQUESTED, { companyId })
  }

  const emptyPlaceholder = <span aria-label={t('card.listEmptyPlaceholder')}>–</span>

  const verificationStatus = bankAccount?.verificationStatus

  const items = bankAccount
    ? [
        {
          term: t('card.accountName'),
          description: bankAccount.name || emptyPlaceholder,
        },
        {
          term: t('card.accountNumber'),
          description: bankAccount.hiddenAccountNumber || emptyPlaceholder,
        },
        {
          term: t('card.routingNumber'),
          description: bankAccount.routingNumber || emptyPlaceholder,
        },
        {
          term: t('card.accountType'),
          description: bankAccount.accountType || emptyPlaceholder,
        },
        {
          term: t('card.verification'),
          description: verificationStatus ? (
            <Components.Badge status={VERIFICATION_BADGE_STATUS[verificationStatus]}>
              {t(`card.verificationStatus.${verificationStatus}`)}
            </Components.Badge>
          ) : (
            emptyPlaceholder
          ),
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
                onClick={handleManage}
                isDisabled={isLoading}
                aria-label={bankAccount ? t('card.manageAriaLabel') : undefined}
              >
                {bankAccount ? t('card.manageCta') : t('card.addCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : bankAccount ? (
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
