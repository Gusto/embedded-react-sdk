import { usePayrollsSubmitMutation } from '@gusto/embedded-api/react-query/payrollsSubmit'
import { usePayrollsCancelMutation } from '@gusto/embedded-api/react-query/payrollsCancel'
import { usePayrollsGet } from '@gusto/embedded-api/react-query/payrollsGet'
import { keepPreviousData } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api/react-query/bankAccountsGet'
import { useWireInRequestsGet } from '@gusto/embedded-api/react-query/wireInRequestsGet'
import { useEffect, useMemo, useState } from 'react'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsGetPayStub } from '@gusto/embedded-api/funcs/payrollsGetPayStub'
import { useErrorBoundary } from 'react-error-boundary'
import type { GetV1CompaniesCompanyIdPayrollsPayrollIdRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
import type { PayrollSubmissionBlockerType } from '@gusto/embedded-api/models/components/payrollsubmissionblockertype'
import type {
  PayrollCreditBlockerType,
  PayrollCreditBlockerTypeUnblockOptions,
} from '@gusto/embedded-api/models/components/payrollcreditblockertype'
import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import {
  ConfirmWireDetails,
  type ConfirmWireDetailsComponentType,
} from '../ConfirmWireDetails/ConfirmWireDetails'
import { canCancelPayroll } from '../helpers'
import { PrintChecks } from '../PrintChecks/PrintChecks'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'
import { PayrollOverviewStatus } from './PayrollOverviewTypes'
import { useSubmissionPoll, type PayrollShow } from './useSubmissionPoll'
import { useCompanyPaymentSpeed } from '@/hooks/useCompanyPaymentSpeed'
import {
  componentEvents,
  payrollWireEvents,
  PAYROLL_PROCESSING_STATUS,
  PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES,
  type EventType,
} from '@/shared/constants'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { readableStreamToBlob } from '@/helpers/readableStreamToBlob'
import { openPdfInNewTab } from '@/helpers/openPdfInNewTab'
import { useNonce } from '@/contexts/NonceProvider'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { renderErrorList } from '@/helpers/apiErrorToList'
import { Flex, PayrollLoading } from '@/components/Common'
import { usePagination } from '@/hooks/usePagination/usePagination'

/**
 * Props for {@link PayrollOverview}.
 *
 * @public
 */
export interface PayrollOverviewProps extends BaseComponentInterface<'Payroll.PayrollOverview'> {
  /** Identifier of the company that owns the payroll. */
  companyId: string
  /** Identifier of the payroll being reviewed. The payroll must already be calculated. */
  payrollId: string
  /** Alert banners to display above the payroll summary. */
  alerts?: PayrollFlowAlert[]
  /** Whether reimbursement fields are shown in the totals and per-employee tables. Defaults to `true`. */
  withReimbursements?: boolean
  /** Custom component to replace the default wire details confirmation UI. */
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  /**
   * Hides the edit and cancel actions, leaving submit and receipt/paystub actions available.
   * Use for a deep link to a specific payroll where editing shouldn't be offered. Defaults to
   * `false`.
   */
  readOnly?: boolean
}

const findUnresolvedBlockersWithOptions = (
  blockers: PayrollSubmissionBlockerType[] = [],
): PayrollSubmissionBlockerType[] => {
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

/**
 * Final review screen for a calculated payroll before submission, with submit, cancel,
 * and edit controls. After submission, tracks processing status and surfaces the receipt
 * and per-employee paystub downloads once complete.
 *
 * @remarks
 * The payroll referenced by `payrollId` must already be calculated; rendering with an
 * uncalculated payroll throws. Unresolved submission blockers (e.g. fast-ACH threshold,
 * wire-in funding) are surfaced inline and the submit action stays disabled until each
 * blocker has a selected unblock option. While the payroll is processing, the component
 * polls until success or failure and emits the corresponding event. Pass `readOnly` to hide
 * the edit and cancel actions while keeping submit available.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/edit` | User chose to edit the payroll before submitting | — |
 * | `runPayroll/submitting` | Submit request was sent to the API | — |
 * | `runPayroll/submitted` | Payroll was successfully submitted | Submit payroll response |
 * | `runPayroll/processed` | Payroll finished processing successfully | `{ payPeriod, payrollUuid }` |
 * | `runPayroll/processingFailed` | Payroll processing failed | — |
 * | `runPayroll/cancelled` | Payroll was cancelled | Cancel payroll response |
 * | `runPayroll/receipt/get` | User requested the payroll receipt | `{ payrollId }` |
 * | `runPayroll/pdfPaystub/viewed` | User opened an employee's paystub PDF | `{ employeeId }` |
 * | `payroll/wire/form/done` | Wire-in details were confirmed via the embedded wire form | Submit wire-in response |
 * | `payroll/printChecks/start` | User opened the print-checks modal from the embedded print-checks banner | — |
 * | `payroll/printChecks/generate/start` | User submitted the print-checks form | — |
 * | `payroll/printChecks/generate/succeeded` | Printable checks finished generating | `{ documentUrl }` |
 * | `payroll/printChecks/generate/failed` | The print-checks request was rejected or generation failed | `{ errorMessage }` |
 * | `payroll/printChecks/retry` | User retried after a failed check generation | — |
 * | `payroll/printChecks/cancel` | User cancelled the print-checks form | — |
 * | `payroll/printChecks/close` | User closed the print-checks failure or summary screen | — |
 *
 * @param props - See {@link PayrollOverviewProps}.
 * @returns The payroll overview surface.
 * @public
 */
export function PayrollOverview(props: PayrollOverviewProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({
  companyId,
  payrollId,
  dictionary,
  onEvent,
  alerts,
  withReimbursements = true,
  ConfirmWireDetailsComponent = ConfirmWireDetails,
  readOnly = false,
}: PayrollOverviewProps) => {
  useComponentDictionary('Payroll.PayrollOverview', dictionary)
  useI18n('Payroll.PayrollOverview')
  const { baseSubmitHandler } = useBase()
  const { t } = useTranslation('Payroll.PayrollOverview')
  const [hasSubmittedInSession, setHasSubmittedInSession] = useState(false)
  const [internalAlerts, setInternalAlerts] = useState(alerts || [])
  const [selectedUnblockOptions, setSelectedUnblockOptions] = useState<Record<string, string>>({})
  const [showWireDetailsConfirmation, setShowWireDetailsConfirmation] = useState(false)
  const { showBoundary } = useErrorBoundary()
  const formatCurrency = useNumberFormatter('currency')
  const dateFormatter = useDateFormatter()
  const { Button, UnorderedList, Text } = useComponentContext()
  const [status, setStatus] = useState(PayrollOverviewStatus.Viewing)
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({
    defaultItemsPerPage: 25,
  })
  const gustoEmbedded = useGustoEmbeddedContext()

  const payrollRequest = useMemo<GetV1CompaniesCompanyIdPayrollsPayrollIdRequest>(
    () => ({
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions', 'totals', 'payroll_taxes'],
      page: currentPage,
      per: itemsPerPage,
      sortBy: 'last_name',
    }),
    [companyId, payrollId, currentPage, itemsPerPage],
  )

  const { data, isFetching } = usePayrollsGet(payrollRequest, {
    placeholderData: keepPreviousData,
  })
  const payrollData = data?.payrollShow
  const submissionBlockers = findUnresolvedBlockersWithOptions(payrollData?.submissionBlockers)
  const wireInId = findWireInRequestUuid(payrollData?.creditBlockers)

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

  const handleWireEvent = (type: EventType, data?: unknown) => {
    if (type === payrollWireEvents.PAYROLL_WIRE_FORM_DONE) {
      setShowWireDetailsConfirmation(true)
    }
    onEvent(type, data)
  }

  const wireInConfirmationRequest = wireInId && (
    <ConfirmWireDetailsComponent
      companyId={companyId}
      wireInId={wireInId}
      onEvent={handleWireEvent}
    />
  )

  const printChecksBanner = (
    <PrintChecks companyId={companyId} payrollId={payrollId} onEvent={onEvent} />
  )

  useEffect(() => {
    if (wireInRequest?.status === 'pending_review' && !showWireDetailsConfirmation) {
      setShowWireDetailsConfirmation(true)
    }
  }, [wireInRequest?.status, showWireDetailsConfirmation])

  const checkDate = payrollData?.checkDate
  useEffect(() => {
    if (checkDate && showWireDetailsConfirmation) {
      const formattedCheckDate = dateFormatter.formatShortWithYear(checkDate)

      setInternalAlerts([
        {
          type: 'success',
          title: t('alerts.wireDetailsSubmittedTitle'),
          content: (
            <Text>
              {t('alerts.wireDetailsSubmittedMessage', { checkDate: formattedCheckDate })}
            </Text>
          ),
          onDismiss: () => {
            setShowWireDetailsConfirmation(false)
          },
        },
      ])
    }
  }, [showWireDetailsConfirmation, checkDate, t, dateFormatter, Text])

  const emitProcessed = (payroll: PayrollShow | undefined) => {
    onEvent(componentEvents.RUN_PAYROLL_PROCESSED, {
      payPeriod: payroll?.payPeriod,
      payrollUuid: payrollId,
    })
    setInternalAlerts([
      {
        type: 'success',
        title: t('alerts.payrollProcessedTitle'),
        content: t('alerts.payrollProcessedMessage', {
          amount: formatCurrency(Number(payroll?.totals?.companyDebit)),
          date: dateFormatter.formatShortWithYear(
            payroll?.payrollStatusMeta?.expectedDebitTime ?? payroll?.payrollDeadline,
          ),
        }),
      },
    ])
    setShowWireDetailsConfirmation(false)
    setHasSubmittedInSession(false)
  }

  const emitProcessingFailed = (payroll: PayrollShow | undefined) => {
    onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
    setInternalAlerts([
      {
        type: 'error',
        title: t('alerts.payrollProcessingFailedTitle'),
        content: (
          <Flex flexDirection="column" gap={16}>
            <UnorderedList items={renderErrorList(payroll?.processingRequest?.errors ?? [])} />
            {!readOnly && (
              <Button variant="secondary" onClick={onEdit}>
                {t('alerts.payrollProcessingFailedCtaLabel')}
              </Button>
            )}
          </Flex>
        ),
      },
    ])
    setShowWireDetailsConfirmation(false)
    setHasSubmittedInSession(false)
  }

  const { start: startPayrollPoll, isPolling } = useSubmissionPoll({
    payrollRequest,
    onProcessed: emitProcessed,
    onProcessingFailed: emitProcessingFailed,
  })

  // Always poll from mount, not just after Submit: the initial read is a non-suspense query, so
  // if its notification never arrives (SDK-1291) the component is stuck on `!payrollData` forever
  // with no other render source. This also doubles as picking up a submission already in flight
  // (another tab, another admin) — the poll's own evaluate rules keep the loop going for as long
  // as it reads `submitting`, regardless of why the loop started.
  useEffect(() => {
    startPayrollPoll({ baseline: null, sawSubmitting: false })
  }, [startPayrollPoll])

  const { data: bankAccountData } = useBankAccountsGetSuspense({
    companyId,
  })
  const bankAccount = bankAccountData.companyBankAccounts?.[0]

  const { paymentSpeed } = useCompanyPaymentSpeed(companyId)

  const { mutateAsync: submitPayroll, isPending } = usePayrollsSubmitMutation()

  const { mutateAsync: cancelPayroll } = usePayrollsCancelMutation()

  const nonce = useNonce()

  const [downloadingEmployeeIds, setDownloadingEmployeeIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )

  if (!payrollData) {
    return <PayrollLoading title={t('dataLoadingTitle')} />
  }

  if (status === PayrollOverviewStatus.Viewing && !payrollData.calculatedAt) {
    throw new Error(t('alerts.payrollNotCalculated'))
  }

  const pagination = getPaginationProps(data.httpMeta.response.headers, isFetching)

  // Per-tax totals come from the payroll-level `payrollTaxes` aggregate so they stay
  // correct when `employeeCompensations` is paginated (only a single page is loaded).
  const taxes =
    payrollData.payrollTaxes?.reduce(
      (acc, tax) => {
        if (!tax.name) return acc
        const amount = tax.amount ?? 0
        acc[tax.name] = {
          employee: (acc[tax.name]?.employee ?? 0) + (tax.employer ? 0 : amount),
          employer: (acc[tax.name]?.employer ?? 0) + (tax.employer ? amount : 0),
        }
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
    const tab = openPdfInNewTab({ loadingMessage: t('downloadLoadingMessage'), nonce })
    setDownloadingEmployeeIds(prev => {
      const next = new Set(prev)
      next.add(employeeId)
      return next
    })
    try {
      const response = await payrollsGetPayStub(gustoEmbedded, { payrollId, employeeId })
      if (!response.value?.responseStream) {
        tab.close()
        throw new Error(t('alerts.paystubPdfError'))
      }
      const pdfBlob = await readableStreamToBlob(response.value.responseStream, 'application/pdf')
      tab.navigate(pdfBlob)
      onEvent(componentEvents.RUN_PAYROLL_PDF_PAYSTUB_VIEWED, { employeeId })
    } catch (err) {
      tab.close()
      showBoundary(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setDownloadingEmployeeIds(prev => {
        if (!prev.has(employeeId)) return prev
        const next = new Set(prev)
        next.delete(employeeId)
        return next
      })
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
      onEvent(componentEvents.RUN_PAYROLL_SUBMITTING)
      onEvent(componentEvents.RUN_PAYROLL_SUBMITTED, result)
      startPayrollPoll({
        baseline: {
          processed: payrollData.processed ?? false,
          status: payrollData.processingRequest?.status,
        },
        sawSubmitting: false,
      })
      setHasSubmittedInSession(true)
    })
  }

  const deadlineAlert: PayrollFlowAlert | undefined = (() => {
    if (hasSubmittedInSession || isPolling) return undefined
    if (
      payrollData.processed ||
      payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submit_success
    )
      return undefined

    if (payrollData.checkDate && payrollData.payrollDeadline) {
      return {
        type: 'info' as const,
        title: t('alerts.directDepositDeadline', {
          payDate: dateFormatter.formatShortWithWeekday(payrollData.checkDate),
          ...dateFormatter.formatWithTime(payrollData.payrollDeadline),
        }),
        content: t('alerts.directDepositDeadlineText'),
      }
    }
    return undefined
  })()

  const combinedAlerts = [...internalAlerts, ...(deadlineAlert ? [deadlineAlert] : [])]

  return (
    <PayrollOverviewPresentation
      onEdit={onEdit}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onPayrollReceipt={onPayrollReceipt}
      onPaystubDownload={onPaystubDownload}
      status={isPending || hasSubmittedInSession ? PayrollOverviewStatus.Submitting : status}
      isProcessed={
        payrollData.processed === true ||
        payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submit_success
      }
      canCancel={canCancelPayroll(payrollData) && !readOnly}
      canEdit={!readOnly}
      payrollData={payrollData}
      bankAccount={bankAccount}
      taxes={taxes}
      alerts={combinedAlerts}
      submissionBlockers={submissionBlockers}
      selectedUnblockOptions={selectedUnblockOptions}
      onUnblockOptionChange={(blockerType, value) => {
        setSelectedUnblockOptions(prev => ({ ...prev, [blockerType]: value }))
      }}
      wireInConfirmationRequest={wireInConfirmationRequest}
      printChecksBanner={printChecksBanner}
      withReimbursements={withReimbursements}
      paymentSpeed={paymentSpeed}
      pagination={pagination}
      downloadingEmployeeIds={downloadingEmployeeIds}
    />
  )
}
