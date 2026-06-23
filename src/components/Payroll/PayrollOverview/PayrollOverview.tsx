import { usePayrollsSubmitMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsSubmit'
import { usePayrollsCancelMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsCancel'
import { usePayrollsGet } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsGet'
import { keepPreviousData } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/bankAccountsGet'
import { useWireInRequestsGet } from '@gusto/embedded-api-v-2026-02-01/react-query/wireInRequestsGet'
import { useEffect, useState } from 'react'
import { useGustoEmbeddedContext } from '@gusto/embedded-api-v-2026-02-01/react-query/_context'
import { payrollsGetPayStub } from '@gusto/embedded-api-v-2026-02-01/funcs/payrollsGetPayStub'
import { useErrorBoundary } from 'react-error-boundary'
import type { PayrollSubmissionBlockerType } from '@gusto/embedded-api-v-2026-02-01/models/components/payrollsubmissionblockertype'
import type {
  PayrollCreditBlockerType,
  PayrollCreditBlockerTypeUnblockOptions,
} from '@gusto/embedded-api-v-2026-02-01/models/components/payrollcreditblockertype'
import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import {
  ConfirmWireDetails,
  type ConfirmWireDetailsComponentType,
} from '../ConfirmWireDetails/ConfirmWireDetails'
import { canCancelPayroll } from '../helpers'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'
import { PayrollOverviewStatus } from './PayrollOverviewTypes'
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
 * polls until success or failure and emits the corresponding event.
 *
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
}: PayrollOverviewProps) => {
  useComponentDictionary('Payroll.PayrollOverview', dictionary)
  useI18n('Payroll.PayrollOverview')
  const { baseSubmitHandler } = useBase()
  const { t } = useTranslation('Payroll.PayrollOverview')
  const [isPolling, setIsPolling] = useState(false)
  const [internalAlerts, setInternalAlerts] = useState(alerts || [])
  const [selectedUnblockOptions, setSelectedUnblockOptions] = useState<Record<string, string>>({})
  const [showWireDetailsConfirmation, setShowWireDetailsConfirmation] = useState(false)
  const { showBoundary } = useErrorBoundary()
  const formatCurrency = useNumberFormatter('currency')
  const dateFormatter = useDateFormatter()
  const { Button, UnorderedList, Text } = useComponentContext()
  const [status, setStatus] = useState(PayrollOverviewStatus.Viewing)
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({
    defaultItemsPerPage: 10,
  })
  const { data, isFetching } = usePayrollsGet(
    {
      companyId,
      payrollId: payrollId,
      include: ['taxes', 'benefits', 'deductions', 'totals', 'payroll_taxes'],
      page: currentPage,
      per: itemsPerPage,
    },
    {
      refetchInterval: isPolling ? 5_000 : false,
      placeholderData: keepPreviousData,
    },
  )
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

  useEffect(() => {
    if (!payrollData) return
    // Start polling when payroll is submitting and not already polling
    if (
      payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submitting &&
      !isPolling
    ) {
      setIsPolling(true)
    }
    if (
      isPolling &&
      (payrollData.processed === true ||
        payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submit_success)
    ) {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSED, {
        payPeriod: payrollData.payPeriod,
        payrollUuid: payrollId,
      })
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
    // If we are polling and payroll is in failed state, stop polling, and emit failure event
    if (
      isPolling &&
      payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.processing_failed
    ) {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
      setInternalAlerts([
        {
          type: 'error',
          title: t('alerts.payrollProcessingFailedTitle'),
          content: (
            <Flex flexDirection="column" gap={16}>
              <UnorderedList items={renderErrorList(payrollData.processingRequest.errors ?? [])} />
              <Button variant="secondary" onClick={onEdit}>
                {t('alerts.payrollProcessingFailedCtaLabel')}
              </Button>
            </Flex>
          ),
        },
      ])
      setShowWireDetailsConfirmation(false)
      setIsPolling(false)
    }
  }, [
    payrollData?.processingRequest?.status,
    payrollData?.processed,
    isPolling,
    onEvent,
    t,
    dateFormatter,
    formatCurrency,
    payrollData?.totals?.companyDebit,
    payrollData?.payrollStatusMeta?.expectedDebitTime,
    payrollData?.payrollDeadline,
  ])

  const { data: bankAccountData } = useBankAccountsGetSuspense({
    companyId,
  })
  const bankAccount = bankAccountData.companyBankAccounts?.[0]

  const { paymentSpeed } = useCompanyPaymentSpeed(companyId)

  const { mutateAsync: submitPayroll, isPending } = usePayrollsSubmitMutation()

  const { mutateAsync: cancelPayroll } = usePayrollsCancelMutation()

  const gustoEmbedded = useGustoEmbeddedContext()

  if (!payrollData) {
    return <PayrollLoading title={t('loadingTitle')} description={t('loadingDescription')} />
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
      onEvent(componentEvents.RUN_PAYROLL_SUBMITTING)
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
      status={isPending || isPolling ? PayrollOverviewStatus.Submitting : status}
      isProcessed={
        payrollData.processed === true ||
        payrollData.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submit_success
      }
      canCancel={canCancelPayroll(payrollData)}
      payrollData={payrollData}
      bankAccount={bankAccount}
      taxes={taxes}
      alerts={internalAlerts}
      submissionBlockers={submissionBlockers}
      selectedUnblockOptions={selectedUnblockOptions}
      onUnblockOptionChange={(blockerType, value) => {
        setSelectedUnblockOptions(prev => ({ ...prev, [blockerType]: value }))
      }}
      wireInConfirmationRequest={wireInConfirmationRequest}
      withReimbursements={withReimbursements}
      paymentSpeed={paymentSpeed}
      pagination={pagination}
    />
  )
}
