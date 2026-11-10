import { useTranslation } from 'react-i18next'
import {
  SetupStatus,
  type TaxRequirementStatesList,
} from '@gusto/embedded-api/models/components/taxrequirementstateslist'
import { useCompanyStateTaxesSummary } from '../../shared/useCompanyStateTaxesSummary'
import { DataView, useDataView, EmptyData, Loading, VisuallyHidden } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType, type STATES_ABBR } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link StateTaxesCard}.
 *
 * @alpha
 */
export interface StateTaxesCardProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the card emits an event. See the events table on {@link StateTaxesCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

const SETUP_STATUS_BADGE = {
  [SetupStatus.NotStarted]: 'info',
  [SetupStatus.InProgress]: 'warning',
  [SetupStatus.Complete]: 'success',
} as const satisfies Record<SetupStatus, 'info' | 'warning' | 'success'>

const SETUP_STATUS_LABEL = {
  [SetupStatus.NotStarted]: 'card.setupStatus.notStarted',
  [SetupStatus.InProgress]: 'card.setupStatus.inProgress',
  [SetupStatus.Complete]: 'card.setupStatus.complete',
} as const satisfies Record<SetupStatus, string>

/**
 * Standalone "State taxes" card listing the states a company has tax requirements in.
 *
 * @remarks
 * Owns its own data fetch and emits
 * `company/management/stateTaxes/editRequested` when the Manage button is
 * clicked. The card is read-only — completing a state's requirements and
 * managing its tax rates happens in the screen the parent routes to — and
 * renders no alerts: alert presentation is the surrounding surface's
 * responsibility.
 *
 * A state's requirements are reported as a setup status rather than field by
 * field: which fields a state asks for varies by state, and a company is not
 * finished until every one of them is answered.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the
 * flag throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/stateTaxes/editRequested` | Fired when "Manage" is clicked | `{ companyId: string }` |
 *
 * @param props - See {@link StateTaxesCardProps}.
 * @returns The state taxes summary card.
 * @alpha
 */
export function StateTaxesCard(props: StateTaxesCardProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  return (
    <BaseBoundaries
      componentName="Company.Management.StateTaxes"
      LoaderComponent={props.LoaderComponent}
    >
      <StateTaxesCardContent {...props} />
    </BaseBoundaries>
  )
}

function StateTaxesCardContent({ companyId, onEvent, LoaderComponent }: StateTaxesCardProps) {
  useI18n('Company.Management.StateTaxes')
  const { t } = useTranslation('Company.Management.StateTaxes')
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })
  const Components = useComponentContext()

  const summary = useCompanyStateTaxesSummary({ companyId })

  const isLoading = summary.isLoading
  const stateTaxRequirements = summary.isLoading ? [] : summary.data.stateTaxRequirements

  const handleManage = () => {
    onEvent(componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED, { companyId })
  }

  const stateTaxesDataView = useDataView({
    data: stateTaxRequirements,
    columns: [
      {
        key: 'state',
        title: t('card.stateColumn'),
        render: (requirement: TaxRequirementStatesList) => (
          <Flex flexDirection="column" gap={4}>
            <Components.Text size="sm" weight="medium">
              {requirement.state
                ? statesHash(requirement.state as (typeof STATES_ABBR)[number])
                : t('card.unknownState')}
            </Components.Text>
            {requirement.defaultRatesApplied && (
              <Components.Text size="sm">{t('card.defaultRatesApplied')}</Components.Text>
            )}
          </Flex>
        ),
      },
      {
        key: 'status',
        title: <VisuallyHidden>{t('card.statusColumn')}</VisuallyHidden>,
        render: (requirement: TaxRequirementStatesList) => {
          const status = requirement.setupStatus ?? SetupStatus.InProgress
          return (
            <Flex gap={8} alignItems="center" flexWrap="wrap">
              <Components.Badge status={SETUP_STATUS_BADGE[status]}>
                {t(SETUP_STATUS_LABEL[status])}
              </Components.Badge>
              {requirement.readyToRunPayroll && (
                <Components.Badge status="success">{t('card.readyToRunPayroll')}</Components.Badge>
              )}
            </Flex>
          )
        },
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
          <DataView label={t('card.listLabel')} isWithinBox {...stateTaxesDataView} />
        )}
      </Components.Box>
    </BaseLayout>
  )
}
