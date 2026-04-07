import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeeAddressesGetSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeePaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import { usePayrollsGetPayStubsSuspense } from '@gusto/embedded-api/react-query/payrollsGetPayStubs'
import { BasicDetailsView } from './BasicDetailsView'
import { JobAndPayView } from './JobAndPayView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

type DashboardTab = 'basicDetails' | 'jobAndPay' | 'taxes' | 'documents'

export interface DashboardViewProps extends BaseComponentInterface {
  companyId: string
  employeeId: string
}

export function DashboardView({ companyId, employeeId, dictionary, onEvent }: DashboardViewProps) {
  useI18n('Employee.Dashboard')
  useComponentDictionary('Employee.Dashboard', dictionary)
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const [selectedTab, setSelectedTab] = useState<DashboardTab>('basicDetails')

  const {
    data: { employee },
    isFetching: isFetchingEmployee,
  } = useEmployeesGetSuspense({ employeeId })

  const {
    data: { employeeAddressList },
    isFetching: isFetchingAddresses,
  } = useEmployeeAddressesGetSuspense({ employeeId })

  const {
    data: { employeeWorkAddressesList },
    isFetching: isFetchingWorkAddresses,
  } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })

  const {
    data: { employeePaymentMethod },
    isFetching: isFetchingPaymentMethod,
  } = useEmployeePaymentMethodGetSuspense({ employeeId })

  const { data: bankAccountsList, isFetching: isFetchingBankAccounts } =
    useEmployeePaymentMethodsGetBankAccountsSuspense({ employeeId })

  const {
    data: { garnishmentList },
    isFetching: isFetchingGarnishments,
  } = useGarnishmentsListSuspense({ employeeId })

  const { data: payStubData, isFetching: isFetchingPayStubs } = usePayrollsGetPayStubsSuspense({
    employeeId,
  })

  const isLoadingBasicDetails = isFetchingEmployee || isFetchingAddresses || isFetchingWorkAddresses
  const isLoadingJobAndPay =
    isFetchingEmployee ||
    isFetchingPaymentMethod ||
    isFetchingBankAccounts ||
    isFetchingGarnishments ||
    isFetchingPayStubs

  const currentHomeAddress = employeeAddressList?.find(address => address.active)
  const currentWorkAddress = employeeWorkAddressesList?.find(address => address.active)
  const primaryJob = employee?.jobs?.[0]
  const bankAccounts = bankAccountsList.employeeBankAccountList || []
  const payStubs = payStubData.employeePayStubsList || []

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
    onEvent(componentEvents.EMPLOYEE_COMPENSATION_UPDATE, { employeeId })
  }, [onEvent, employeeId])

  const handleAddBankAccount = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE, { employeeId })
  }, [onEvent, employeeId])

  const handleAddDeduction = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_ADD, { employeeId })
  }, [onEvent, employeeId])

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

  const renderTabContent = useMemo(() => {
    switch (selectedTab) {
      case 'basicDetails':
        return (
          <BasicDetailsView
            employee={employee}
            currentHomeAddress={currentHomeAddress}
            currentWorkAddress={currentWorkAddress}
            isLoading={isLoadingBasicDetails}
            onEditBasicDetails={handleEditBasicDetails}
            onManageHomeAddress={handleManageHomeAddress}
            onManageWorkAddress={handleManageWorkAddress}
          />
        )
      case 'jobAndPay':
        return (
          <JobAndPayView
            job={primaryJob}
            paymentMethod={employeePaymentMethod}
            bankAccounts={bankAccounts}
            garnishments={garnishmentList}
            payStubs={payStubs}
            isFetchingGarnishments={isFetchingGarnishments}
            isFetchingPayStubs={isFetchingPayStubs}
            isLoading={isLoadingJobAndPay}
            onEditCompensation={handleEditCompensation}
            onAddBankAccount={handleAddBankAccount}
            onAddDeduction={handleAddDeduction}
          />
        )
      case 'taxes':
        return (
          <Components.Text>{t('placeholders.taxes', { companyId, employeeId })}</Components.Text>
        )
      case 'documents':
        return (
          <Components.Text>
            {t('placeholders.documents', { companyId, employeeId })}
          </Components.Text>
        )
      default:
        return null
    }
  }, [
    selectedTab,
    employee,
    currentHomeAddress,
    currentWorkAddress,
    primaryJob,
    employeePaymentMethod,
    bankAccounts,
    garnishmentList,
    payStubs,
    isFetchingGarnishments,
    isFetchingPayStubs,
    isLoadingBasicDetails,
    isLoadingJobAndPay,
    handleEditBasicDetails,
    handleManageHomeAddress,
    handleManageWorkAddress,
    handleEditCompensation,
    handleAddBankAccount,
    handleAddDeduction,
    t,
    companyId,
    employeeId,
    Components,
  ])

  return (
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
        {renderTabContent}
      </Flex>
    </Flex>
  )
}
