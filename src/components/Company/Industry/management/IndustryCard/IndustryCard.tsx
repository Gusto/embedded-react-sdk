import { useTranslation } from 'react-i18next'
import { useCompanyIndustrySummary } from '../../shared/useCompanyIndustrySummary'
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
 * Props for {@link IndustryCard}.
 *
 * @alpha
 */
export interface IndustryCardProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the card emits an event. See the events table on {@link IndustryCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone "Industry" card summarizing a company's industry classification.
 *
 * @remarks
 * Owns its own data fetch and emits
 * `company/management/industry/editRequested` when the Edit button is clicked.
 * The card does not render success alerts itself — alert presentation is the
 * surrounding surface's responsibility.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/industry/editRequested` | Fired when "Edit" is clicked | `{ companyId: string }` |
 *
 * @param props - See {@link IndustryCardProps}.
 * @returns The industry summary card.
 * @alpha
 */
export function IndustryCard(props: IndustryCardProps) {
  return (
    <BaseBoundaries
      componentName="Company.Management.Industry"
      LoaderComponent={props.LoaderComponent}
    >
      <IndustryCardContent {...props} />
    </BaseBoundaries>
  )
}

function IndustryCardContent({ companyId, onEvent, LoaderComponent }: IndustryCardProps) {
  useI18n('Company.Management.Industry')
  const { t } = useTranslation('Company.Management.Industry')
  const Components = useComponentContext()

  const summary = useCompanyIndustrySummary({ companyId })

  const isLoading = summary.isLoading
  const industry = summary.isLoading ? undefined : summary.data.industry

  const handleEdit = () => {
    onEvent(componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED, { companyId })
  }

  const emptyPlaceholder = <span aria-label={t('card.listEmptyPlaceholder')}>–</span>

  const items = industry
    ? [
        {
          term: t('card.industry'),
          description: industry.title || emptyPlaceholder,
        },
        {
          term: t('card.naicsCode'),
          description: industry.naicsCode || emptyPlaceholder,
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
                aria-label={t('card.editAriaLabel')}
              >
                {t('card.editCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : industry?.naicsCode ? (
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
