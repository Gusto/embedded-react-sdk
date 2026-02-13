import { usePayrollsSubmitMutation } from '@gusto/embedded-api/react-query/payrollsSubmit'
import { usePayrollsCancelMutation } from '@gusto/embedded-api/react-query/payrollsCancel'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { useTranslation } from 'react-i18next'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api/react-query/bankAccountsGet'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { useWireInRequestsGet } from '@gusto/embedded-api/react-query/wireInRequestsGet'
import { useEffect, useState } from 'react'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsGetPayStub } from '@gusto/embedded-api/funcs/payrollsGetPayStub'
import { useErrorBoundary } from 'react-error-boundary'
import type { PayrollSubmissionBlockerType } from '@gusto/embedded-api/models/components/payrollsubmissionblockertype'
import type {
  PayrollCreditBlockerType,
  PayrollCreditBlockerTypeUnblockOptions,
} from '@gusto/embedded-api/models/components/payrollcreditblockertype'
import type { PayrollShow } from '@gusto/embedded-api/models/components/payroll'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import { canCancelPayroll } from '../helpers'
import { PayrollOverviewStatus } from './PayrollOverviewTypes'
import {
  componentEvents,
  payrollWireEvents,
  PAYROLL_PROCESSING_STATUS,
  PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES,
  type EventType,
} from '@/shared/constants'
import { useBase } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { readableStreamToBlob } from '@/helpers/readableStreamToBlob'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useDateFormatter } from '@/hooks/useDateFormatter'

const findUnresolvedBlockersWithOptions = (blockers: PayrollSubmissionBlockerType[] = []) => {
  return blockers.filter(
    blocker =>
      blocker.status === 'unresolved' &&
      blocker.unblockOptions &&
      blocker.unblockOptions.length > 0,
  )
}

const findWireInRequestUuid = (
  creditBlockers: PayrollCreditBlockerType[] = [],
): string | undefined => {
  const unresolvedCreditBlocker = creditBlockers.find(blocker => blocker.status === 'unresolved')

  if (!unresolvedCreditBlocker?.unblockOptions) {
    return undefined
  }

  const wireUnblockOption = unresolvedCreditBlocker.unblockOptions.find(
    (option: PayrollCreditBlockerTypeUnblockOptions) => option.unblockType === 'submit_wire',
  )

  return wireUnblockOption?.metadata.wireInRequestUuid
}

export interface UsePayrollOverviewParams {
  companyId: string
  payrollId: string
  onEvent: OnEventType<EventType, unknown>
  alerts?: PayrollFlowAlert[]
  withReimbursements?: boolean
}

export interface UsePayrollOverviewReturn {
  payrollData: PayrollShow
  bankAccount?: CompanyBankAccount
  employeeDetails: Employee[]
  taxes: Record<string, { employee: number; employer: number }>
  status: PayrollOverviewStatus
  isProcessed: boolean
  canCancel: boolean
  alerts: PayrollFlowAlert[]
  submissionBlockers: PayrollSubmissionBlockerType[]
  selectedUnblockOptions: Record<string, string>
  wireInId?: string
  showWireDetailsConfirmation: boolean
  processingErrors?: string[]
  withReimbursements: boolean
  onEdit: () => void
  onSubmit: () => Promise<void>
  onCancel: () => Promise<void>
  onPayrollReceipt: () => void
  onPaystubDownload: (employeeId: string) => Promise<void>
  onUnblockOptionChange: (blockerType: string, value: string) => void
  handleWireEvent: OnEventType<EventType, unknown>
}

export function usePayrollOverview({
  companyId,
  payrollId,
  onEvent,
  alerts: externalAlerts,
  withReimbursements = true,
}: UsePayrollOverviewParams): UsePayrollOverviewReturn {
  useI18n('Payroll.PayrollOverview')
  const { baseSubmitHandler } = useBase()
  const { t } = useTranslation('Payroll.PayrollOverview')
  const [isPolling, setIsPolling] = useState(false)
  const [internalAlerts, setInternalAlerts] = useState<PayrollFlowAlert[]>(externalAlerts || [])
  const [selectedUnblockOptions, setSelectedUnblockOptions] = useState<Record<string, string>>({})
  const [showWireDetailsConfirmation, setShowWireDetailsConfirmation] = useState(false)
  const { showBoundary } = useErrorBoundary()
  const formatCurrency = useNumberFormatter('currency')
  const dateFormatter = useDateFormatter()
  const [status, setStatus] = useState<PayrollOverviewStatus>(PayrollOverviewStatus.Viewing)

  const { data } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions'],
    },
    { refetchInterval: isPolling ? 5_000 : false },
  )
  const payrollData = data.payrollShow!
  const submissionBlockers = findUnresolvedBlockersWithOptions(payrollData.submissionBlockers)
  const wireInId = findWireInRequestUuid(payrollData.creditBlockers)

  const { data: wireInRequestData } = useWireInRequestsGet(
    {
      wireInRequestUuid: wireInId || '',
    },
    { enabled: !!wireInId },
  )
  const wireInRequest = wireInRequestData?.wireInRequest

  const onEdit = () => {
    onEvent(componentEvents.RUN_PAYROLL_EDIT)
  }

  const handleWireEvent: OnEventType<EventType, unknown> = (type, wireData?) => {
    if (type === payrollWireEvents.PAYROLL_WIRE_FORM_DONE) {
      setShowWireDetailsConfirmation(true)
    }
    onEvent(type, wireData)
  }

  useEffect(() => {
    if (wireInRequest?.status === 'pending_review' && !showWireDetailsConfirmation) {
      setShowWireDetailsConfirmation(true)
    }
  }, [wireInRequest?.status, showWireDetailsConfirmation])

  useEffect(() => {
    if (showWireDetailsConfirmation) {
      const checkDate = dateFormatter.formatShortWithYear(payrollData.checkDate)

      setInternalAlerts([
        {
          type: 'success',
          title: t('alerts.wireDetailsSubmittedTitle'),
          content: t('alerts.wireDetailsSubmittedMessage', { checkDate }),
          onDismiss: () => {
            setShowWireDetailsConfirmation(false)
          },
        },
      ])
    }
  }, [showWireDetailsConfirmation, payrollData.checkDate, t, dateFormatter])

  useEffect(() => {
    if (
      payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submitting &&
      !isPolling
    ) {
      setIsPolling(true)
    }
    if (
      isPolling &&
      payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submit_success
    ) {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSED)
      setInternalAlerts([
        {
          type: 'success',
          title: t('alerts.payrollProcessedTitle'),
          content: t('alerts.payrollProcessedMessage', {
            amount: formatCurrency(Number(payrollData.totals?.companyDebit)),
            date: dateFormatter.formatShortWithYear(
              payrollData.payrollStatusMeta?.expectedDebitTime ?? payrollData.payrollDeadline,
            ),
          }),
        },
      ])
      setShowWireDetailsConfirmation(false)
      setIsPolling(false)
    }
    if (
      isPolling &&
      payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.processing_failed
    ) {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
      setInternalAlerts([
        {
          type: 'error',
          title: t('alerts.payrollProcessingFailedTitle'),
        },
      ])
      setShowWireDetailsConfirmation(false)
      setIsPolling(false)
    }
  }, [
    payrollData.processingRequest?.status,
    isPolling,
    onEvent,
    t,
    dateFormatter,
    formatCurrency,
    payrollData.totals?.netPayDebit,
    payrollData.payrollStatusMeta?.expectedDebitTime,
    payrollData.payrollDeadline,
  ])

  const { data: bankAccountData } = useBankAccountsGetSuspense({
    companyId,
  })
  const bankAccount = bankAccountData.companyBankAccounts?.[0]

  const { data: employeeData } = useEmployeesListSuspense({
    companyId,
  })

  const { mutateAsync: submitPayroll, isPending } = usePayrollsSubmitMutation()

  const { mutateAsync: cancelPayroll } = usePayrollsCancelMutation()

  if (status === PayrollOverviewStatus.Viewing && !payrollData.calculatedAt) {
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

  const onCancel = async () => {
    setStatus(PayrollOverviewStatus.Cancelling)
    await baseSubmitHandler(data, async () => {
      try {
        const result = await cancelPayroll({
          request: {
            companyId,
            payrollId,
          },
        })
        setStatus(PayrollOverviewStatus.Cancelled)
        onEvent(componentEvents.RUN_PAYROLL_CANCELLED, result)
      } catch (error) {
        setStatus(PayrollOverviewStatus.Viewing)
        throw error
      }
    })
  }

  const onPayrollReceipt = () => {
    onEvent(componentEvents.RUN_PAYROLL_RECEIPT_GET, { payrollId })
  }

  const onPaystubDownload = async (employeeId: string) => {
    const newWindow = window.open('', '_blank')

    try {
      const response = await payrollsGetPayStub(gustoEmbedded, { payrollId, employeeId })
      if (!response.value?.responseStream) {
        throw new Error(t('alerts.paystubPdfError'))
      }
      const pdfBlob = await readableStreamToBlob(response.value.responseStream, 'application/pdf')

      const url = URL.createObjectURL(pdfBlob)

      if (newWindow) {
        newWindow.location.href = url
      }
      onEvent(componentEvents.RUN_PAYROLL_PDF_PAYSTUB_VIEWED, { employeeId })
      URL.revokeObjectURL(url)
    } catch (err) {
      if (newWindow) {
        newWindow.close()
      }
      showBoundary(err instanceof Error ? err : new Error(String(err)))
    }
  }

  const onSubmit = async () => {
    await baseSubmitHandler(data, async () => {
      const result = await submitPayroll({
        request: {
          companyId,
          payrollId,
          requestBody: {
            submissionBlockers: Object.entries(selectedUnblockOptions)
              .filter(([blockerType]) =>
                PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES.includes(blockerType),
              )
              .map(([blockerType, selectedOption]) => ({
                blockerType,
                selectedOption,
              })),
          },
        },
      })
      onEvent(componentEvents.RUN_PAYROLL_SUBMITTED, result)
      setIsPolling(true)
    })
  }

  const onUnblockOptionChange = (blockerType: string, value: string) => {
    setSelectedUnblockOptions(prev => ({ ...prev, [blockerType]: value }))
  }

  return {
    payrollData,
    bankAccount,
    employeeDetails: employeeData.showEmployees || [],
    taxes,
    status: isPending || isPolling ? PayrollOverviewStatus.Submitting : status,
    isProcessed: payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submit_success,
    canCancel: canCancelPayroll(payrollData),
    alerts: internalAlerts,
    submissionBlockers,
    selectedUnblockOptions,
    wireInId,
    showWireDetailsConfirmation,
    processingErrors: payrollData.processingRequest?.errors?.map(e =>
      typeof e === 'string' ? e : (e.message ?? JSON.stringify(e)),
    ),
    withReimbursements,
    onEdit,
    onSubmit,
    onCancel,
    onPayrollReceipt,
    onPaystubDownload,
    onUnblockOptionChange,
    handleWireEvent,
  }
}
