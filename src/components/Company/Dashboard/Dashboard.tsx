import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCompaniesGet } from '@gusto/embedded-api/react-query/companiesGet'
import { CompanyDetailsView } from './CompanyDetailsView'
import { PayView } from './PayView'
import { TaxesView } from './TaxesView'
import { DocumentsView } from './DocumentsView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

/**
 * Identifiers for the tabs rendered by {@link Dashboard}.
 *
 * @alpha
 */
export type DashboardTab = 'companyDetails' | 'pay' | 'taxes' | 'documents'

/**
 * Props for {@link Dashboard}.
 *
 * @alpha
 */
export interface DashboardProps extends BaseComponentInterface<'Company.Dashboard'> {
  /** The associated company identifier. */
  companyId: string
  /** The currently active tab. Defaults to `'companyDetails'` when uncontrolled. */
  selectedTab?: DashboardTab
}

function DashboardRoot({
  companyId,
  dictionary,
  onEvent,
  selectedTab: controlledTab,
  LoaderComponent,
  className,
}: DashboardProps) {
  useI18n('Company.Dashboard')
  useComponentDictionary('Company.Dashboard', dictionary)
  const { t } = useTranslation('Company.Dashboard')
  const Components = useComponentContext()
  const [internalTab, setInternalTab] = useState<DashboardTab>('companyDetails')
  const selectedTab = controlledTab ?? internalTab

  const tabs = [
    {
      id: 'companyDetails' as const,
      label: t('tabs.companyDetails'),
      content: null,
    },
    {
      id: 'pay' as const,
      label: t('tabs.pay'),
      content: null,
    },
    {
      id: 'taxes' as const,
      label: t('tabs.taxes'),
      content: null,
    },
    {
      id: 'documents' as const,
      label: t('tabs.documents'),
      content: null,
    },
  ]

  return (
    <Flex className={className} flexDirection="column" gap={32}>
      <DashboardHeader companyId={companyId} />

      <Flex flexDirection="column" gap={8}>
        <Components.Tabs
          tabs={tabs}
          selectedId={selectedTab}
          onSelectionChange={id => {
            const next = id as DashboardTab
            setInternalTab(next)
            onEvent(componentEvents.COMPANY_DASHBOARD_TAB_CHANGE, { tab: next })
          }}
          aria-label={t('tabsLabel')}
        />

        <Flex flexDirection="column" gap={24}>
          {selectedTab === 'companyDetails' && (
            <CompanyDetailsView
              companyId={companyId}
              onEvent={onEvent}
              LoaderComponent={LoaderComponent}
            />
          )}

          {selectedTab === 'pay' && (
            <PayView companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
          )}

          {selectedTab === 'taxes' && (
            <TaxesView companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
          )}

          {selectedTab === 'documents' && (
            <DocumentsView
              companyId={companyId}
              onEvent={onEvent}
              LoaderComponent={LoaderComponent}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

function DashboardHeader({ companyId }: { companyId: string }) {
  const { t } = useTranslation('Company.Dashboard')
  const Components = useComponentContext()
  const { data } = useCompaniesGet({ companyId })
  const companyName = data?.company?.tradeName || data?.company?.name

  if (!companyName) {
    return null
  }

  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Heading as="h2">{companyName}</Components.Heading>
      <Components.Text variant="supporting">{t('companySettingsLabel')}</Components.Text>
    </Flex>
  )
}

/**
 * Company settings dashboard summarizing a company's details, pay setup, taxes, and documents.
 *
 * @remarks
 * Renders a tabbed overview of the company, wrapped in the SDK's standard error and suspense
 * boundaries. The active tab may be controlled via `selectedTab` or left uncontrolled, in which
 * case it defaults to company details. Each tab composes the read-only section cards listed below.
 *
 * Every section card loads its own data and reports its own failures, so one card erroring leaves
 * the rest of the dashboard usable. The company name heading behaves the same way: if it cannot be
 * loaded the heading is omitted and the tabs and cards still render.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws. Two cards additionally require their own flag and are omitted when it is off: the Pay
 * tab's Pay schedules card requires `managePaySchedules`, and the Taxes tab's Tax payments card
 * requires `taxPayments`. Both tabs still render their remaining cards.
 *
 * @components
 * - {@link IndustryCard}
 * - {@link LocationsCard}
 * - {@link BankAccountCard}
 * - {@link PaySchedulesCard}
 * - {@link FederalTaxesCard}
 * - {@link StateTaxesCard}
 * - {@link TaxPaymentsCard}
 * - {@link SignatoryCard}
 *
 * @param props - Component props. See {@link DashboardProps}.
 * @returns A React element rendering the company settings dashboard.
 * @alpha
 */
export function Dashboard({ FallbackComponent, LoaderComponent, ...props }: DashboardProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  return (
    <BaseBoundaries
      componentName="Company.Dashboard"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <DashboardRoot {...props} LoaderComponent={LoaderComponent} />
    </BaseBoundaries>
  )
}
