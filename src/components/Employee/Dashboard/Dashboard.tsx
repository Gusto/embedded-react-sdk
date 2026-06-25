import { Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEmployeesGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
import { BasicDetailsView } from './BasicDetailsView'
import { JobAndPayView } from './JobAndPayView'
import { TaxesViewWithData } from './TaxesView'
import { DocumentsCard } from '@/components/Employee/Documents/management/DocumentsCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

/** @public */
export type DashboardTab = 'basicDetails' | 'jobAndPay' | 'taxes' | 'documents'

/** @public */
export interface DashboardProps extends BaseComponentInterface<'Employee.Dashboard'> {
  /** The associated employee identifier. */
  employeeId: string
  /** The currently active tab. Defaults to `'basicDetails'` when uncontrolled. */
  selectedTab?: DashboardTab
}

function DashboardRoot({
  employeeId,
  dictionary,
  onEvent,
  selectedTab: controlledTab,
}: DashboardProps) {
  useI18n('Employee.Dashboard')
  useComponentDictionary('Employee.Dashboard', dictionary)
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const [internalTab, setInternalTab] = useState<DashboardTab>('basicDetails')
  const selectedTab = controlledTab ?? internalTab

  const tabs = [
    {
      id: 'basicDetails' as const,
      label: t('tabs.basicDetails'),
      content: null,
    },
    {
      id: 'jobAndPay' as const,
      label: t('tabs.jobAndPay'),
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
    <Flex flexDirection="column" gap={32}>
      <Suspense fallback={null}>
        <DashboardHeader employeeId={employeeId} />
      </Suspense>

      <Flex flexDirection="column" gap={8}>
        <Components.Tabs
          tabs={tabs}
          selectedId={selectedTab}
          onSelectionChange={id => {
            const next = id as DashboardTab
            setInternalTab(next)
            onEvent(componentEvents.EMPLOYEE_DASHBOARD_TAB_CHANGE, { tab: next })
          }}
          aria-label={t('tabsLabel')}
        />

        <Flex flexDirection="column" gap={24}>
          {selectedTab === 'basicDetails' && (
            <BasicDetailsView employeeId={employeeId} onEvent={onEvent} />
          )}

          {selectedTab === 'jobAndPay' && (
            <JobAndPayView employeeId={employeeId} onEvent={onEvent} />
          )}

          {selectedTab === 'taxes' && (
            <TaxesViewWithData employeeId={employeeId} onEvent={onEvent} />
          )}

          {selectedTab === 'documents' && (
            <DocumentsCard employeeId={employeeId} onEvent={onEvent} />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

function DashboardHeader({ employeeId }: { employeeId: string }) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })

  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Heading as="h2">
        {firstLastName({ first_name: employee?.firstName, last_name: employee?.lastName })}
      </Components.Heading>
      <Components.Text variant="supporting">{t('employeeRoleLabel')}</Components.Text>
    </Flex>
  )
}

/**
 * Employee self-service dashboard summarizing a single employee's basic details, job and pay, taxes, and documents.
 *
 * @remarks
 * Renders a tabbed overview of the employee, wrapped in the SDK's standard error and suspense
 * boundaries. The active tab may be controlled via `selectedTab` or left uncontrolled, in which
 * case it defaults to basic details. Each tab composes the read-only section cards listed below.
 *
 * @components
 * - {@link ProfileCard}
 * - {@link HomeAddressCard}
 * - {@link WorkAddressCard}
 * - {@link CompensationCard}
 * - {@link PaymentMethodCard}
 * - {@link DeductionsCard}
 * - {@link PaystubsCard}
 * - {@link FederalTaxesCard}
 * - {@link StateTaxesCard}
 * - {@link DocumentsCard}
 *
 * @param props - Component props. See {@link DashboardProps}.
 * @returns A React element rendering the employee dashboard.
 * @public
 */
export function Dashboard({ FallbackComponent, ...props }: DashboardProps) {
  return (
    <BaseBoundaries componentName="Employee.Dashboard" FallbackComponent={FallbackComponent}>
      <DashboardRoot {...props} />
    </BaseBoundaries>
  )
}
