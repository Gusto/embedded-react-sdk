import { useTranslation } from 'react-i18next'
import type { TaxPayment } from '@gusto/embedded-api/models/components/taxpayment'
import { useCompanyTaxPaymentsSummary } from '../../shared/useCompanyTaxPaymentsSummary'
import { getJurisdictionLabel } from '../../shared/taxPaymentStatus'
import { Flex } from '@/components/Common/Flex/Flex'
import { Loading } from '@/components/Common'
import { EmptyData } from '@/components/Common/EmptyData/EmptyData'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link TaxPaymentsCard}.
 *
 * @alpha
 */
export interface TaxPaymentsCardProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the card emits an event. See the events table on {@link TaxPaymentsCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

const JURISDICTION_LABEL = {
  federal: 'card.jurisdiction.federal',
  state: 'card.jurisdiction.state',
} as const satisfies Record<ReturnType<typeof getJurisdictionLabel>['key'], string>

/**
 * Standalone "Tax payments" card reporting what a company still owes its tax
 * agencies.
 *
 * @remarks
 * Owns its own data fetch and emits
 * `company/management/taxPayments/editRequested` when the Manage button is
 * clicked. The card is read-only and renders no alerts: alert presentation is
 * the surrounding surface's responsibility.
 *
 * Reports the count of overdue payments and the next one coming due rather than
 * listing the ledger — the full searchable history lives in the screen the
 * parent routes to. The API returns no status field, so overdue is derived from
 * each payment's amounts and dates; see `useCompanyTaxPaymentsSummary` for the
 * windows that derivation reads.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the
 * flag throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/taxPayments/editRequested` | Fired when "Manage" is clicked | `{ companyId: string }` |
 *
 * @param props - See {@link TaxPaymentsCardProps}.
 * @returns The tax payments summary card.
 * @alpha
 */
export function TaxPaymentsCard(props: TaxPaymentsCardProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  return (
    <BaseBoundaries
      componentName="Company.Management.TaxPayments"
      LoaderComponent={props.LoaderComponent}
    >
      <TaxPaymentsCardContent {...props} />
    </BaseBoundaries>
  )
}

function TaxPaymentsCardContent({ companyId, onEvent, LoaderComponent }: TaxPaymentsCardProps) {
  useI18n('Company.Management.TaxPayments')
  const { t } = useTranslation('Company.Management.TaxPayments')
  const Components = useComponentContext()
  const { formatShortWithYear } = useDateFormatter()
  const currencyFormatter = useNumberFormatter('currency')

  const summary = useCompanyTaxPaymentsSummary({ companyId })

  const isLoading = summary.isLoading
  const overduePayments = summary.isLoading ? [] : summary.data.overduePayments
  const nextPayment = summary.isLoading ? undefined : summary.data.nextPayment

  const handleManage = () => {
    onEvent(componentEvents.COMPANY_MANAGEMENT_TAX_PAYMENTS_EDIT_REQUESTED, { companyId })
  }

  const jurisdictionLabel = (payment: TaxPayment) => {
    const { key, values } = getJurisdictionLabel(payment)
    return t(JURISDICTION_LABEL[key], values)
  }

  const overdueTotal = overduePayments.reduce((total, payment) => total + Number(payment.amount), 0)

  const overdueDescription =
    overduePayments.length > 0 ? (
      <Flex gap={8} alignItems="center" flexWrap="wrap">
        <Components.Badge status="error">
          {t('card.overdueCount', { count: overduePayments.length })}
        </Components.Badge>
        <Components.Text size="sm">{currencyFormatter(overdueTotal)}</Components.Text>
      </Flex>
    ) : (
      <Components.Badge status="success">{t('card.noneOverdue')}</Components.Badge>
    )

  const nextPaymentItems = nextPayment
    ? [
        {
          term: t('card.nextPaymentDue'),
          description: nextPayment.dueDate
            ? formatShortWithYear(nextPayment.dueDate.toString())
            : t('card.noDueDate'),
        },
        {
          term: t('card.agency'),
          description: (
            <Flex flexDirection="column" gap={4}>
              <Components.Text size="sm">
                {nextPayment.agencyName ?? t('card.unknownAgency')}
              </Components.Text>
              <Components.Text size="sm" variant="supporting">
                {jurisdictionLabel(nextPayment)}
              </Components.Text>
            </Flex>
          ),
        },
        {
          term: t('card.amount'),
          description: currencyFormatter(Number(nextPayment.amount)),
        },
      ]
    : []

  // A failed read leaves both windows empty, which every branch below would otherwise
  // state as fact — a green "None overdue", or an empty state asserting the company
  // owes nothing. Neither is known, so the error replaces them rather than sitting
  // above them. The box header stays either way, so the card is still legible as the
  // tax payments card while erroring.
  const hasError = summary.errorHandling.errors.length > 0
  const hasOutstandingPayments = overduePayments.length > 0 || Boolean(nextPayment)

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
                aria-label={t('card.manageAriaLabel')}
              >
                {t('card.manageCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : hasError ? (
            <EmptyData title={t('card.errorState.title')} />
          ) : hasOutstandingPayments ? (
            <Components.DescriptionList
              items={[
                { term: t('card.overdue'), description: overdueDescription },
                ...nextPaymentItems,
              ]}
            />
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
