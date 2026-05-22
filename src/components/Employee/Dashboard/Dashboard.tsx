import { Suspense, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidfederaltaxes'
import { BasicDetailsViewWithData } from './BasicDetailsView'
import { JobAndPayView } from './JobAndPayView'
import { TaxesViewWithData } from './TaxesView'
import { DocumentsViewWithData } from './DocumentsView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

type EmployeeFederalTax = NonNullable<
  GetV1EmployeesEmployeeIdFederalTaxesResponse['employeeFederalTax']
>

export type DashboardTab = 'basicDetails' | 'jobAndPay' | 'taxes' | 'documents'

export interface DashboardProps extends BaseComponentInterface<'Employee.Dashboard'> {
  employeeId: string
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

  const handleEditBasicDetails = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId })
  }, [onEvent, employeeId])

  const handleManageHomeAddress = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS, { employeeId })
  }, [onEvent, employeeId])

  const handleManageWorkAddress = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS, { employeeId })
  }, [onEvent, employeeId])

  const handleEditCompensation = useCallback(
    (job: Job) => {
      onEvent(componentEvents.EMPLOYEE_COMPENSATION_CREATE, { employeeId, job })
    },
    [onEvent, employeeId],
  )

  const handleAddJob = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_JOB_ADD, { employeeId })
  }, [onEvent, employeeId])

  const handleAddAnotherJob = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_JOB_ADD_ANOTHER, { employeeId })
  }, [onEvent, employeeId])

  const handleAddDeduction = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_ADD, { employeeId })
  }, [onEvent, employeeId])

  const handleEditDeduction = useCallback(
    (deduction: Garnishment) => {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_EDIT, deduction)
    },
    [onEvent],
  )

  const handleEditFederalTaxes = useCallback(
    (federalTaxes: EmployeeFederalTax | undefined) => {
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_EDIT, { employeeId, federalTaxes })
    },
    [onEvent, employeeId],
  )

  const handleEditStateTaxes = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_STATE_TAXES_EDIT, { employeeId })
  }, [onEvent, employeeId])

  const handleViewForm = useCallback(
    (formId: string) => {
      onEvent(componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, { employeeId, formId })
    },
    [onEvent, employeeId],
  )

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
          <Suspense fallback={<BaseLayout isLoading />}>
            <BasicDetailsViewWithData
              employeeId={employeeId}
              onEditBasicDetails={handleEditBasicDetails}
              onManageHomeAddress={handleManageHomeAddress}
              onManageWorkAddress={handleManageWorkAddress}
            />
          </Suspense>
        )}

        {selectedTab === 'jobAndPay' && (
          <Suspense fallback={<BaseLayout isLoading />}>
            <JobAndPayView
              employeeId={employeeId}
              onEvent={onEvent}
              onEditCompensation={handleEditCompensation}
              onAddJob={handleAddJob}
              onAddAnotherJob={handleAddAnotherJob}
              onAddDeduction={handleAddDeduction}
              onEditDeduction={handleEditDeduction}
            />
          </Suspense>
        )}

        {selectedTab === 'taxes' && (
          <Suspense fallback={<BaseLayout isLoading />}>
            <TaxesViewWithData
              employeeId={employeeId}
              onEditFederalTaxes={handleEditFederalTaxes}
              onEditStateTaxes={handleEditStateTaxes}
            />
          </Suspense>
        )}

        {selectedTab === 'documents' && (
          <Suspense fallback={<BaseLayout isLoading />}>
            <DocumentsViewWithData employeeId={employeeId} onViewForm={handleViewForm} />
          </Suspense>
        )}
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
      <Components.Text>{t('employeeRoleLabel')}</Components.Text>
    </Flex>
  )
}

export function Dashboard({
  FallbackComponent,
  ...props
}: DashboardProps & BaseComponentInterface) {
  return (
    <BaseBoundaries componentName="Employee.Dashboard" FallbackComponent={FallbackComponent}>
      <DashboardRoot {...props} />
    </BaseBoundaries>
  )
}
