import { usePayrollsSubmitMutation } from '@gusto/embedded-api/react-query/payrollsSubmit'
import { usePayrollsCancelMutation } from '@gusto/embedded-api/react-query/payrollsCancel'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { useTranslation } from 'react-i18next'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api/react-query/bankAccountsGet'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { useEffect, useState } from 'react'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsGetPayStub } from '@gusto/embedded-api/funcs/payrollsGetPayStub'
import { useErrorBoundary } from 'react-error-boundary'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'
import { componentEvents, PAYROLL_PROCESSING_STATUS } from '@/shared/constants'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { readableStreamToBlob } from '@/helpers/readableStreamToBlob'

interface PayrollOverviewProps extends BaseComponentInterface<'Payroll.PayrollOverview'> {
  companyId: string
  payrollId: string
}

export function PayrollOverview(props: PayrollOverviewProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, payrollId, dictionary, onEvent }: PayrollOverviewProps) => {
  useComponentDictionary('Payroll.PayrollOverview', dictionary)
  useI18n('Payroll.PayrollOverview')
  const { baseSubmitHandler } = useBase()
  const { t } = useTranslation('Payroll.PayrollOverview')
  const [isPolling, setIsPolling] = useState(false)
  const { showBoundary } = useErrorBoundary()

  const { data } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId: payrollId,
      include: ['taxes', 'benefits', 'deductions'],
    },
    { refetchInterval: isPolling ? 5_000 : false },
  )
  const payrollData = data.payrollShow!

  useEffect(() => {
    // Start polling when payroll is submitting and not already polling
    if (
      payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submitting &&
      !isPolling
    ) {
      setIsPolling(true)
    }
    // Stop polling and emit event when payroll is processed successfully
    if (
      isPolling &&
      payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submit_success
    ) {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSED)
      setIsPolling(false)
    }
    // If we are polling and payroll is in failed state, stop polling, and emit failure event
    if (
      isPolling &&
      payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.processing_failed
    ) {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
      setIsPolling(false)
    }
  }, [payrollData.processingRequest?.status, isPolling, onEvent])

  const { data: bankAccountData } = useBankAccountsGetSuspense({
    companyId,
  })
  const bankAccount = bankAccountData.companyBankAccounts?.[0]

  const { data: employeeData } = useEmployeesListSuspense({
    companyId,
  })

  const { mutateAsync: submitPayroll, isPending } = usePayrollsSubmitMutation()

  const { mutateAsync: cancelPayroll, isPending: isPendingCancel } = usePayrollsCancelMutation()

  if (!payrollData.calculatedAt) {
    throw new Error(t('alerts.payrollNotCalculated'))
  }
  const gustoEmbedded = useGustoEmbeddedContext()

  const taxes =
    payrollData.employeeCompensations?.reduce(
      (acc, compensation) => {
        compensation.taxes?.forEach(tax => {
          acc[tax.name] = {
            employee: (acc[tax.name]?.employee ?? 0) + (tax.employer ? 0 : tax.amount),
            employer: (acc[tax.name]?.employer ?? 0) + (tax.employer ? tax.amount : 0),
          }
        })

        return acc
      },
      {} as Record<string, { employee: number; employer: number }>,
    ) || {}

  const onEdit = () => {
    onEvent(componentEvents.RUN_PAYROLL_EDITED)
  }
  const onCancel = async () => {
    await baseSubmitHandler(data, async () => {
      const result = await cancelPayroll({
        request: {
          companyId,
          payrollId,
        },
      })
      onEvent(componentEvents.RUN_PAYROLL_CANCELLED, result)
    })
  }
  const onPayrollReceipt = () => {
    // onEvent(componentEvents.RUN_PAYROLL_RECEIPT)
  }

  const onPaystubDownload = async (employeeId: string) => {
    // Open a blank window *synchronously* with the click
    const newWindow = window.open('', '_blank')

    try {
      // Fetch the PDF from your API
      const response = await payrollsGetPayStub(gustoEmbedded, { payrollId, employeeId })
      if (!response.value?.responseStream) {
        throw new Error(t('alerts.paystubPdfError'))
      }
      const pdfBlob = await readableStreamToBlob(response.value.responseStream, 'application/pdf')

      const url = URL.createObjectURL(pdfBlob)

      // Load the PDF into the new window
      if (newWindow) {
        newWindow.location.href = url
      }
      onEvent(componentEvents.RUN_PAYROLL_PDF_PAYSTUB_VIEWED, { employeeId })
      URL.revokeObjectURL(url) // Clean up the URL object after use
    } catch (err) {
      if (newWindow) {
        newWindow.close()
      }
      showBoundary(err)
    }
  }
  const onSubmit = async () => {
    await baseSubmitHandler(data, async () => {
      const result = await submitPayroll({
        request: {
          companyId,
          payrollId,
          requestBody: {
            submissionBlockers: [],
          },
        },
      })
      onEvent(componentEvents.RUN_PAYROLL_SUBMITTED, result)
      setIsPolling(true)
    })
  }
  return (
    <PayrollOverviewPresentation
      onEdit={onEdit}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onPayrollReceipt={onPayrollReceipt}
      onPaystubDownload={onPaystubDownload}
      isSubmitting={isPending || isPolling || isPendingCancel}
      isProcessed={
        payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submit_success
      }
      payrollData={payrollData}
      bankAccount={bankAccount}
      employeeDetails={employeeData.showEmployees || []}
      taxes={taxes}
    />
  )
}
