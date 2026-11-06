import { useTranslation } from 'react-i18next'
import type { Location } from '@gusto/embedded-api/models/components/location'
import { useCompanyLocationsSummary } from '../../shared/useCompanyLocationsSummary'
import styles from './LocationsCard.module.scss'
import {
  DataView,
  useDataView,
  EmptyData,
  Flex,
  Loading,
  VisuallyHidden,
} from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import { formatStreetForDisplay, getCityStateZip } from '@/helpers/formattedStrings'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link LocationsCard}.
 *
 * @alpha
 */
export interface LocationsCardProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the card emits an event. See the events table on {@link LocationsCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone "Locations" card listing a company's work addresses.
 *
 * @remarks
 * Owns its own data fetch and emits
 * `company/management/locations/editRequested` when the Manage button is
 * clicked. The card is read-only — adding and editing addresses happens in the
 * screen the parent routes to — and renders no alerts: alert presentation is
 * the surrounding surface's responsibility.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/locations/editRequested` | Fired when "Manage" is clicked | `{ companyId: string }` |
 *
 * @param props - See {@link LocationsCardProps}.
 * @returns The locations summary card.
 * @alpha
 */
export function LocationsCard(props: LocationsCardProps) {
  return (
    <BaseBoundaries
      componentName="Company.Management.Locations"
      LoaderComponent={props.LoaderComponent}
    >
      <LocationsCardContent {...props} />
    </BaseBoundaries>
  )
}

function LocationsCardContent({ companyId, onEvent, LoaderComponent }: LocationsCardProps) {
  useI18n('Company.Management.Locations')
  const { t } = useTranslation('Company.Management.Locations')
  const Components = useComponentContext()

  const summary = useCompanyLocationsSummary({ companyId })

  const isLoading = summary.isLoading
  const locations = summary.isLoading ? [] : summary.data.locations

  const handleManage = () => {
    onEvent(componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_REQUESTED, { companyId })
  }

  const locationsDataView = useDataView({
    data: locations,
    columns: [
      {
        key: 'address',
        title: t('card.addressColumn'),
        render: (location: Location) => (
          <address className={styles.addressCell}>
            <Components.Text size="sm" weight="medium">
              {formatStreetForDisplay(location)}
            </Components.Text>
            <Components.Text size="sm">{getCityStateZip(location)}</Components.Text>
          </address>
        ),
      },
      {
        key: 'designations',
        title: <VisuallyHidden>{t('card.designationsColumn')}</VisuallyHidden>,
        render: (location: Location) => (
          <Flex gap={8} alignItems="center" flexWrap="wrap">
            {location.mailingAddress && (
              <Components.Badge status="info">{t('card.mailingAddress')}</Components.Badge>
            )}
            {location.filingAddress && (
              <Components.Badge status="info">{t('card.filingAddress')}</Components.Badge>
            )}
          </Flex>
        ),
      },
    ],
    emptyState: () => (
      <EmptyData
        title={t('card.emptyState.title')}
        description={t('card.emptyState.description')}
      />
    ),
  })

  return (
    <BaseLayout error={summary.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <Components.Box
        withPadding={false}
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
        {isLoading ? (
          <Loading />
        ) : (
          <DataView label={t('card.listLabel')} isWithinBox {...locationsDataView} />
        )}
      </Components.Box>
    </BaseLayout>
  )
}
