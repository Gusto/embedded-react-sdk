import { Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { DetailsView } from './DetailsView'
import { PayView } from './PayView'
import { DocumentsCard } from '@/components/Contractor/Documents/management/DocumentsCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents, CONTRACTOR_TYPE } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

/** @public */
export type DashboardTab = 'details' | 'pay' | 'documents'

/** @internal */
export type DashboardSuccessAlert =
  | 'profileUpdated'
  | 'addressUpdated'
  | 'bankAccountAdded'
  | 'bankAccountRemoved'
  | 'compensationUpdated'

/** @public */
export interface DashboardProps extends BaseComponentInterface<'Contractor.Dashboard'> {
  /** The associated contractor identifier. */
  contractorId: string
  /** The currently active tab. Defaults to `'details'` when uncontrolled. */
  selectedTab?: DashboardTab
  /** When set, a success alert with the corresponding translated label is rendered above the dashboard tabs. */
  successAlert?: DashboardSuccessAlert
}

const alertKeys = {
  profileUpdated: 'alerts.profileUpdated',
  addressUpdated: 'alerts.addressUpdated',
  bankAccountAdded: 'alerts.bankAccountAdded',
  bankAccountRemoved: 'alerts.bankAccountRemoved',
  compensationUpdated: 'alerts.compensationUpdated',
} as const satisfies Record<DashboardSuccessAlert, string>

function DashboardRoot({
  contractorId,
  dictionary,
  onEvent,
  selectedTab: controlledTab,
  successAlert,
  LoaderComponent,
}: DashboardProps) {
  useI18n('Contractor.Dashboard')
  useComponentDictionary('Contractor.Dashboard', dictionary)
  const { t } = useTranslation('Contractor.Dashboard')
  const Components = useComponentContext()
  const [internalTab, setInternalTab] = useState<DashboardTab>('details')
  const selectedTab = controlledTab ?? internalTab

  const tabs = [
    { id: 'details' as const, label: t('tabs.details'), content: null },
    { id: 'pay' as const, label: t('tabs.pay'), content: null },
    { id: 'documents' as const, label: t('tabs.documents'), content: null },
  ]

  return (
    <Flex flexDirection="column" gap={32}>
      {successAlert && (
        <Components.Alert
          status="success"
          label={t(alertKeys[successAlert])}
          onDismiss={() => {
            onEvent(componentEvents.CONTRACTOR_DASHBOARD_ALERT_DISMISSED, null)
          }}
          disableScrollIntoView
        />
      )}
      <Suspense fallback={null}>
        <DashboardHeader contractorId={contractorId} />
      </Suspense>

      <Flex flexDirection="column" gap={8}>
        <Components.Tabs
          tabs={tabs}
          selectedId={selectedTab}
          onSelectionChange={id => {
            const next = id as DashboardTab
            setInternalTab(next)
            onEvent(componentEvents.CONTRACTOR_DASHBOARD_TAB_CHANGE, { tab: next })
          }}
          aria-label={t('tabsLabel')}
        />

        <Flex flexDirection="column" gap={24}>
          {selectedTab === 'details' && (
            <DetailsView contractorId={contractorId} onEvent={onEvent} />
          )}

          {selectedTab === 'pay' && <PayView contractorId={contractorId} onEvent={onEvent} />}

          {selectedTab === 'documents' && (
            <DocumentsCard
              contractorId={contractorId}
              onEvent={onEvent}
              LoaderComponent={LoaderComponent}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

function DashboardHeader({ contractorId }: { contractorId: string }) {
  const { t } = useTranslation('Contractor.Dashboard')
  const Components = useComponentContext()
  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })

  const isBusiness = contractor?.type === CONTRACTOR_TYPE.BUSINESS
  const legalName = contractor
    ? isBusiness
      ? contractor.businessName
      : firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
    : undefined

  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Heading as="h2">{legalName}</Components.Heading>
      <Components.Text variant="supporting">{t('contractorRoleLabel')}</Components.Text>
    </Flex>
  )
}

/**
 * Contractor management dashboard summarizing a single contractor's basic details, pay, and documents.
 *
 * @remarks
 * Renders a tabbed overview of the contractor, wrapped in the SDK's standard error and suspense
 * boundaries. The active tab may be controlled via `selectedTab` or left uncontrolled, in which
 * case it defaults to details. Each tab composes the read-only section cards listed below.
 *
 * @components
 * - {@link ProfileCard}
 * - {@link AddressCard}
 * - {@link PaymentMethodCard}
 * - {@link CompensationCard}
 * - {@link DocumentsCard}
 *
 * @param props - Component props. See {@link DashboardProps}.
 * @returns A React element rendering the contractor dashboard.
 * @public
 */
export function Dashboard({ FallbackComponent, LoaderComponent, ...props }: DashboardProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Dashboard"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <DashboardRoot LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}
