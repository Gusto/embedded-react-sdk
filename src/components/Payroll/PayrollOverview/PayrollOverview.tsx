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
import type { PayrollSubmissionBlockersType } from '@gusto/embedded-api/models/components/payrollsubmissionblockerstype'
import type { PayrollCreditBlockersType } from '@gusto/embedded-api/models/components/payrollcreditblockerstype'
import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import {
  ConfirmWireDetails,
  type ConfirmWireDetailsComponentType,
} from '../ConfirmWireDetails/ConfirmWireDetails'
import { canCancelPayroll } from '../helpers'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'
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
import { Flex } from '@/components/Common'

interface PayrollOverviewProps extends BaseComponentInterface<'Payroll.PayrollOverview'> {
  companyId: string
  payrollId: string
  alerts?: PayrollFlowAlert[]
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
}

const findUnresolvedBlockersWithOptions = (blockers: PayrollSubmissionBlockersType[] = []) => {
  return blockers.filter(
    blocker =>
      blocker.status === 'unresolved' &&
      blocker.unblockOptions &&
      blocker.unblockOptions.length > 0,
  )
}

const findWireInRequestUuid = (
  creditBlockers: PayrollCreditBlockersType[] = [],
): string | undefined => {
  const unresolvedCreditBlocker = creditBlockers.find(blocker => blocker.status === 'unresolved')

  if (!unresolvedCreditBlocker?.unblockOptions) {
    return undefined
  }

  const wireUnblockOption = unresolvedCreditBlocker.unblockOptions.find(
    option => option.unblockType === 'submit_wire',
  )

  return wireUnblockOption?.metadata.wireInRequestUuid
}

export function PayrollOverview(props: PayrollOverviewProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({
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
  const [internalAlerts, setInternalAlerts] = useState<PayrollFlowAlert[]>(alerts || [])
  const [selectedUnblockOptions, setSelectedUnblockOptions] = useState<Record<string, string>>({})
  const [showWireDetailsConfirmation, setShowWireDetailsConfirmation] = useState(false)
  const { showBoundary } = useErrorBoundary()
  const formatCurrency = useNumberFormatter('currency')
  const dateFormatter = useDateFormatter()
  const { Button, UnorderedList, Text } = useComponentContext()
  const { data } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId: payrollId,
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

  useEffect(() => {
    if (showWireDetailsConfirmation) {
      const checkDate = dateFormatter.formatShortWithYear(payrollData.checkDate)

      setInternalAlerts([
        {
          type: 'success',
          title: t('alerts.wireDetailsSubmittedTitle'),
          content: <Text>{t('alerts.wireDetailsSubmittedMessage', { checkDate })}</Text>,
          onDismiss: () => {
            setShowWireDetailsConfirmation(false)
          },
        },
      ])
    }
  }, [showWireDetailsConfirmation, payrollData.checkDate, t, dateFormatter, Text])

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

  const onCancel = async () => {
    await baseSubmitHandler(data, async () => {
      const result = await cancelPayroll({
        request: {
          companyId,
          payrollId,
        },
      })
      onEvent(componentEvents.RUN_PAYROLL_CANCELLED, result)
      setInternalAlerts([])
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
      canCancel={canCancelPayroll(payrollData)}
      payrollData={payrollData}
      bankAccount={bankAccount}
      employeeDetails={employeeData.showEmployees || []}
      taxes={taxes}
      alerts={internalAlerts}
      submissionBlockers={submissionBlockers}
      selectedUnblockOptions={selectedUnblockOptions}
      onUnblockOptionChange={(blockerType, value) => {
        setSelectedUnblockOptions(prev => ({ ...prev, [blockerType]: value }))
      }}
      wireInConfirmationRequest={wireInConfirmationRequest}
      withReimbursements={withReimbursements}
    />
  )
}
