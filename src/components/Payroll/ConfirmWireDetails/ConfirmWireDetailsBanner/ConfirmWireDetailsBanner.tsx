import { useTranslation } from 'react-i18next'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { useState, useEffect } from 'react'
import type { ConfirmationAlert } from '../types'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface ConfirmWireDetailsBannerProps
  extends BaseComponentInterface<'Payroll.ConfirmWireDetailsBanner'> {
  wireInId?: string
  companyId: string
  confirmationAlert?: ConfirmationAlert
  onStartWireTransfer: () => void
}

export function ConfirmWireDetailsBanner(props: ConfirmWireDetailsBannerProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({
  wireInId,
  companyId,
  dictionary,
  confirmationAlert,
  onStartWireTransfer,
}: ConfirmWireDetailsBannerProps) => {
  useComponentDictionary('Payroll.ConfirmWireDetailsBanner', dictionary)
  useI18n('Payroll.ConfirmWireDetailsBanner')
  const { t } = useTranslation('Payroll.ConfirmWireDetailsBanner')
  const { Alert, Banner, Button, UnorderedList, Text } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const [isConfirmationAlertDismissed, setIsConfirmationAlertDismissed] = useState<boolean>(false)

  useEffect(() => {
    if (confirmationAlert) {
      setIsConfirmationAlertDismissed(false)
    }
  }, [confirmationAlert])

  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: companyId,
  })

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processed: true,
  })

  const activeWireInRequests = (wireInRequestsData.wireInRequestList || []).filter(
    request => request.status === 'awaiting_funds',
  )
  const wireInRequests = wireInId
    ? activeWireInRequests.filter(request => request.uuid === wireInId)
    : activeWireInRequests

  const payrolls = payrollsData.payrollList || []

  const wireInRequestsWithPayrolls = wireInRequests.map(wireInRequest => {
    const payroll = payrolls.find(p => p.payrollUuid === wireInRequest.paymentUuid)
    const payrollRange = payroll?.payPeriod
      ? dateFormatter.formatPayPeriodRange(payroll.payPeriod.startDate, payroll.payPeriod.endDate)
      : ''
    return {
      wireInRequest,
      payroll,
      payrollRange,
    }
  })

  const shouldShowBanner =
    wireInRequestsWithPayrolls.length > 0 &&
    (wireInRequestsWithPayrolls.length > 1 || wireInRequestsWithPayrolls[0]?.wireInRequest)

  const shouldShowConfirmationAlert = !isConfirmationAlertDismissed && confirmationAlert

  if (!shouldShowBanner && !shouldShowConfirmationAlert) {
    return null
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)

    const timeRaw = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: date.getMinutes() === 0 ? undefined : '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'short',
    })

    const time = timeRaw.replace(/\s?(AM|PM)/i, match => match.trim().toLowerCase())

    const dateString = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Los_Angeles',
    })

    return { time, date: dateString }
  }

  const getBannerTitle = () => {
    const isSingleWireInRequest = wireInRequestsWithPayrolls.length === 1
    const { wireInRequest, payrollRange } = wireInRequestsWithPayrolls[0] || {}

    if (isSingleWireInRequest) {
      if (wireInId && wireInRequest?.wireInDeadline) {
        const { time, date } = formatDeadline(wireInRequest.wireInDeadline)
        return t('banner.title', { time, date })
      }
      return t('banner.titleWithPayroll', { payrollRange })
    }
    return t('banner.titleMultiple', { count: wireInRequestsWithPayrolls.length })
  }

  return (
    <Flex flexDirection="column" gap={16}>
      {shouldShowConfirmationAlert && (
        <Alert
          status="success"
          label={confirmationAlert.title}
          onDismiss={() => {
            setIsConfirmationAlertDismissed(true)
          }}
        >
          {confirmationAlert.content}
        </Alert>
      )}
      {shouldShowBanner && (
        <Banner status="warning" title={getBannerTitle()}>
          <Flex flexDirection="column" gap={16} alignItems="flex-start">
            <div>{t('banner.description')}</div>
            {wireInRequestsWithPayrolls.length > 1 && (
              <UnorderedList
                items={wireInRequestsWithPayrolls.map(({ payrollRange }, index) => (
                  <Text key={index}>{payrollRange}</Text>
                ))}
              />
            )}
            <Button variant="secondary" onClick={onStartWireTransfer}>
              {t('cta.startWireTransfer')}
            </Button>
          </Flex>
        </Banner>
      )}
    </Flex>
  )
}
