import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDashboard } from './useDashboard'
import { BasicDetailsView } from './BasicDetailsView'
import { JobAndPayView } from './JobAndPayView'
import { TaxesView } from './TaxesView'
import { DocumentsView } from './DocumentsView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

type DashboardTab = 'basicDetails' | 'jobAndPay' | 'taxes' | 'documents'

export interface DashboardProps extends BaseComponentInterface<'Employee.Dashboard'> {
  companyId: string
  employeeId: string
}

function DashboardRoot({ companyId, employeeId, dictionary, onEvent }: DashboardProps) {
  useI18n('Employee.Dashboard')
  useComponentDictionary('Employee.Dashboard', dictionary)
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const [selectedTab, setSelectedTab] = useState<DashboardTab>('basicDetails')

  const dashboard = useDashboard({ employeeId })

  if (dashboard.isLoading) {
    return <BaseLayout isLoading />
  }

  const {
    employee,
    currentHomeAddress,
    currentWorkAddress,
    primaryJob,
    employeePaymentMethod,
    bankAccounts,
    garnishmentList,
    payStubs,
    employeeFederalTax,
    employeeStateTaxesList,
    formList,
  } = dashboard.data

  const {
    isLoadingBasicDetails,
    isLoadingJobAndPay,
    isLoadingTaxes,
    isLoadingDocuments,
  } = dashboard.status

  const handleEditBasicDetails = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId })
  }, [onEvent, employeeId])

  const handleManageHomeAddress = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS, { employeeId })
  }, [onEvent, employeeId])

  const handleManageWorkAddress = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS, { employeeId })
  }, [onEvent, employeeId])

  const handleEditCompensation = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_COMPENSATION_UPDATE, { employeeId, job: primaryJob })
  }, [onEvent, employeeId, primaryJob])

  const handleAddBankAccount = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE, { employeeId })
  }, [onEvent, employeeId])

  const handleAddDeduction = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_ADD, { employeeId })
  }, [onEvent, employeeId])

  const handleEditFederalTaxes = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, {
      employeeId,
      federalTaxes: employeeFederalTax,
    })
  }, [onEvent, employeeId, employeeFederalTax])

  const handleEditStateTaxes = useCallback(
    (state: string) => {
      onEvent(componentEvents.EMPLOYEE_STATE_TAXES_UPDATED, { employeeId, state })
    },
    [onEvent, employeeId],
  )

  const handleViewForm = useCallback(
    (formUuid: string) => {
      onEvent(componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, { employeeId, formUuid })
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
    <BaseLayout>
      <Flex flexDirection="column" gap={32}>
        <Components.Heading as="h2">{t('title')}</Components.Heading>

        <Components.Tabs
          tabs={tabs}
          selectedId={selectedTab}
          onSelectionChange={id => {
            setSelectedTab(id as DashboardTab)
          }}
          aria-label={t('tabsLabel')}
        />

        <Flex flexDirection="column" gap={24}>
          {selectedTab === 'basicDetails' && (
            <BasicDetailsView
              employee={employee}
              currentHomeAddress={currentHomeAddress}
              currentWorkAddress={currentWorkAddress}
              isLoading={isLoadingBasicDetails}
              onEditBasicDetails={handleEditBasicDetails}
              onManageHomeAddress={handleManageHomeAddress}
              onManageWorkAddress={handleManageWorkAddress}
            />
          )}

                {selectedTab === 'jobAndPay' && (
                  <JobAndPayView
                    job={primaryJob}
                    paymentMethod={employeePaymentMethod}
                    bankAccounts={bankAccounts}
                    garnishments={garnishmentList}
                    payStubs={payStubs}
                    isLoading={isLoadingJobAndPay}
                    onEditCompensation={handleEditCompensation}
                    onAddBankAccount={handleAddBankAccount}
                    onAddDeduction={handleAddDeduction}
                  />
                )}

          {selectedTab === 'taxes' && (
            <TaxesView
              federalTaxes={employeeFederalTax}
              stateTaxes={employeeStateTaxesList}
              isLoading={isLoadingTaxes}
              onEditFederalTaxes={handleEditFederalTaxes}
              onEditStateTaxes={handleEditStateTaxes}
            />
          )}

                {selectedTab === 'documents' && (
                  <DocumentsView
                    forms={formList}
                    isLoading={isLoadingDocuments}
                    onViewForm={handleViewForm}
                  />
                )}
        </Flex>
      </Flex>
    </BaseLayout>
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
