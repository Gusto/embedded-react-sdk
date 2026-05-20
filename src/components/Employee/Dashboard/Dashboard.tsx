import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsGetPayStub } from '@gusto/embedded-api/funcs/payrollsGetPayStub'
import { useErrorBoundary } from 'react-error-boundary'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import {
  useEmployeeBasicDetails,
  useEmployeeCompensation,
  useEmployeeTaxes,
  useEmployeeForms,
} from './hooks'
import { BasicDetailsView } from './BasicDetailsView'
import { JobAndPayView } from './JobAndPayView'
import { TaxesView } from './TaxesView'
import { DocumentsView } from './DocumentsView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import { readableStreamToBlob } from '@/helpers/readableStreamToBlob'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

type DashboardTab = 'basicDetails' | 'jobAndPay' | 'taxes' | 'documents'

export interface DashboardProps extends BaseComponentInterface<'Employee.Dashboard'> {
  employeeId: string
}

function DashboardRoot({ employeeId, dictionary, onEvent }: DashboardProps) {
  useI18n('Employee.Dashboard')
  useComponentDictionary('Employee.Dashboard', dictionary)
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const gustoEmbedded = useGustoEmbeddedContext()
  const { showBoundary } = useErrorBoundary()
  const [selectedTab, setSelectedTab] = useState<DashboardTab>('basicDetails')
  const [downloadingPayrollUuids, setDownloadingPayrollUuids] = useState<ReadonlySet<string>>(
    () => new Set(),
  )

  const basicDetails = useEmployeeBasicDetails({ employeeId })
  const compensation = useEmployeeCompensation({ employeeId })
  const taxes = useEmployeeTaxes({ employeeId })
  const forms = useEmployeeForms({ employeeId })

  // Derive the inputs these callbacks depend on up here so all hooks are
  // declared before the early-return below (rules-of-hooks). The data fields
  // are only present on the non-loading variants of each hook result.
  const primaryJob = !compensation.isLoading ? compensation.data.primaryJob : undefined
  const employeeFederalTax = !taxes.isLoading ? taxes.data.employeeFederalTax : undefined

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

  const handleAddJob = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_JOB_ADD, { employeeId })
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

  const handlePaystubDownload = useCallback(
    async (payrollUuid: string) => {
      const newWindow = window.open('', '_blank')
      const loadingMessage = t('jobAndPay.paystubs.downloadLoadingMessage')
      if (newWindow) {
        // Avoid the user staring at about:blank while we fetch the PDF. The
        // navigation to the Blob URL below replaces this document.
        const doc = newWindow.document
        doc.title = loadingMessage
        const style = doc.createElement('style')
        style.textContent =
          'body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;' +
          'justify-content:center;height:100vh;margin:0;color:#444;gap:12px}' +
          '.spinner{width:20px;height:20px;border:2px solid #ccc;border-top-color:#444;' +
          'border-radius:50%;animation:spin .8s linear infinite}' +
          '@keyframes spin{to{transform:rotate(360deg)}}'
        doc.head.appendChild(style)
        const spinner = doc.createElement('div')
        spinner.className = 'spinner'
        spinner.setAttribute('aria-hidden', 'true')
        const label = doc.createElement('span')
        label.textContent = loadingMessage
        doc.body.replaceChildren(spinner, label)
      }
      setDownloadingPayrollUuids(prev => {
        const next = new Set(prev)
        next.add(payrollUuid)
        return next
      })
      try {
        const response = await payrollsGetPayStub(gustoEmbedded, {
          payrollId: payrollUuid,
          employeeId,
        })
        if (!response.value?.responseStream) {
          throw new Error(t('jobAndPay.paystubs.downloadError'))
        }
        const pdfBlob = await readableStreamToBlob(response.value.responseStream, 'application/pdf')
        const url = URL.createObjectURL(pdfBlob)
        if (newWindow) {
          newWindow.location.href = url
        }
        URL.revokeObjectURL(url)
      } catch (err) {
        if (newWindow) {
          newWindow.close()
        }
        showBoundary(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setDownloadingPayrollUuids(prev => {
          const next = new Set(prev)
          next.delete(payrollUuid)
          return next
        })
      }
    },
    [gustoEmbedded, employeeId, t, showBoundary],
  )

  const handleEditFederalTaxes = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_EDIT, {
      employeeId,
      federalTaxes: employeeFederalTax,
    })
  }, [onEvent, employeeId, employeeFederalTax])

  const handleEditStateTaxes = useCallback(() => {
    onEvent(componentEvents.EMPLOYEE_STATE_TAXES_EDIT, { employeeId })
  }, [onEvent, employeeId])

  const handleViewForm = useCallback(
    (formId: string) => {
      onEvent(componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, { employeeId, formId })
    },
    [onEvent, employeeId],
  )

  // Collect all errors from hooks
  const allErrors = [
    ...basicDetails.errorHandling.errors,
    ...compensation.errorHandling.errors,
    ...taxes.errorHandling.errors,
    ...forms.errorHandling.errors,
  ]

  // Show loading for initial data fetch
  if (basicDetails.isLoading || compensation.isLoading || taxes.isLoading || forms.isLoading) {
    return <BaseLayout isLoading error={allErrors} />
  }

  const { employee, currentHomeAddress, currentWorkAddress } = basicDetails.data
  const { payStubs } = compensation.data
  const { employeeStateTaxesList } = taxes.data
  const { formList } = forms.data

  // Pagination props
  const payStubsPagination = compensation.pagination.payStubs

  // Tab-specific loading states based on isPending
  const isLoadingBasicDetails = basicDetails.status.isPending
  const isLoadingJobAndPay = compensation.status.isPending
  const isLoadingTaxes = taxes.status.isPending
  const isLoadingDocuments = forms.status.isPending

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
    <BaseLayout error={allErrors}>
      <Flex flexDirection="column" gap={32}>
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
              employeeId={employeeId}
              job={primaryJob}
              payStubs={payStubs}
              payStubsPagination={payStubsPagination}
              isLoading={isLoadingJobAndPay}
              onEvent={onEvent}
              onEditCompensation={handleEditCompensation}
              onAddJob={handleAddJob}
              onAddDeduction={handleAddDeduction}
              onEditDeduction={handleEditDeduction}
              onPaystubDownload={handlePaystubDownload}
              downloadingPayrollUuids={downloadingPayrollUuids}
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
