import { Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCompaniesGetSuspense } from '@gusto/embedded-api/react-query/companiesGet'
import { CompanyDetailsView } from './CompanyDetailsView'
import { PayView } from './PayView'
import { FederalTaxesCard } from '@/components/Company/FederalTaxes/management/FederalTaxesCard'
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
export type DashboardTab = 'companyDetails' | 'pay' | 'taxes'

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
  ]

  return (
    <Flex className={className} flexDirection="column" gap={32}>
      <Suspense fallback={null}>
        <DashboardHeader companyId={companyId} />
      </Suspense>

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
            <FederalTaxesCard
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
  const {
    data: { company },
  } = useCompaniesGetSuspense({ companyId })

  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Heading as="h2">{company?.tradeName || company?.name}</Components.Heading>
      <Components.Text variant="supporting">{t('companySettingsLabel')}</Components.Text>
    </Flex>
  )
}

/**
 * Company settings dashboard summarizing a company's details, pay setup, and taxes.
 *
 * @remarks
 * Renders a tabbed overview of the company, wrapped in the SDK's standard error and suspense
 * boundaries. The active tab may be controlled via `selectedTab` or left uncontrolled, in which
 * case it defaults to company details. Each tab composes the read-only section cards listed below.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @components
 * - {@link IndustryCard}
 * - {@link LocationsCard}
 * - {@link BankAccountCard}
 * - {@link FederalTaxesCard}
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
