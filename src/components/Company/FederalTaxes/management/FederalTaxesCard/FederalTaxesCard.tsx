import { useTranslation } from 'react-i18next'
import { useCompanyFederalTaxesSummary } from '../../shared/useCompanyFederalTaxesSummary'
import { Flex } from '@/components/Common/Flex/Flex'
import { Loading } from '@/components/Common'
import { EmptyData } from '@/components/Common/EmptyData/EmptyData'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link FederalTaxesCard}.
 *
 * @alpha
 */
export interface FederalTaxesCardProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the card emits an event. See the events table on {@link FederalTaxesCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone "Federal taxes" card summarizing a company's federal tax details.
 *
 * @remarks
 * Owns its own data fetch and emits
 * `company/management/federalTaxes/editRequested` when the Edit button is
 * clicked. The EIN itself is never returned by the API, so the card reports
 * only whether one is on file and whether it has been verified. The card
 * renders no alerts: alert presentation is the surrounding surface's
 * responsibility.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/federalTaxes/editRequested` | Fired when "Edit" is clicked | `{ companyId: string }` |
 *
 * @param props - See {@link FederalTaxesCardProps}.
 * @returns The federal taxes summary card.
 * @alpha
 */
export function FederalTaxesCard(props: FederalTaxesCardProps) {
  return (
    <BaseBoundaries
      componentName="Company.Management.FederalTaxes"
      LoaderComponent={props.LoaderComponent}
    >
      <FederalTaxesCardContent {...props} />
    </BaseBoundaries>
  )
}

function FederalTaxesCardContent({ companyId, onEvent, LoaderComponent }: FederalTaxesCardProps) {
  useI18n('Company.Management.FederalTaxes')
  const { t } = useTranslation('Company.Management.FederalTaxes')
  const Components = useComponentContext()

  const summary = useCompanyFederalTaxesSummary({ companyId })

  const isLoading = summary.isLoading
  const federalTaxDetails = summary.isLoading ? undefined : summary.data.federalTaxDetails

  const handleEdit = () => {
    onEvent(componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_REQUESTED, { companyId })
  }

  const emptyPlaceholder = <span aria-label={t('card.listEmptyPlaceholder')}>–</span>

  const einDescription = !federalTaxDetails?.hasEin ? (
    <Components.Badge status="warning">{t('card.einMissing')}</Components.Badge>
  ) : federalTaxDetails.einVerified ? (
    <Components.Badge status="success">{t('card.einVerified')}</Components.Badge>
  ) : (
    <Components.Badge status="warning">{t('card.einUnverified')}</Components.Badge>
  )

  const items = federalTaxDetails
    ? [
        {
          term: t('card.legalName'),
          description: federalTaxDetails.legalName || emptyPlaceholder,
        },
        {
          term: t('card.ein'),
          description: einDescription,
        },
        {
          term: t('card.taxPayerType'),
          description: federalTaxDetails.taxPayerType || emptyPlaceholder,
        },
        {
          term: t('card.filingForm'),
          description: federalTaxDetails.filingForm || emptyPlaceholder,
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
              <Components.Button variant="secondary" onClick={handleEdit} isDisabled={isLoading}>
                {t('card.editCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : federalTaxDetails ? (
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
