import { useState, useCallback } from 'react'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { useRecoveryCasesGetSuspense } from '@gusto/embedded-api/react-query/recoveryCasesGet'
import { useInformationRequestsGetInformationRequestsSuspense } from '@gusto/embedded-api/react-query/informationRequestsGetInformationRequests'
import { InformationRequestStatus } from '@gusto/embedded-api/models/components/informationrequest'
import { recoveryCasesEvents, informationRequestEvents, type EventType } from '@/shared/constants'

type ResponseAlertType = 'recoveryCaseResubmitted' | 'informationRequestResponded'

interface ResponseAlert {
  id: number
  type: ResponseAlertType
}

interface ResponseAlertState {
  id: number
  alerts: ResponseAlert[]
}

interface UsePayrollBlockerListProps {
  companyId: string
  onEvent: (type: EventType, data?: unknown) => void
}

export function usePayrollBlockerList({ companyId, onEvent }: UsePayrollBlockerListProps) {
  const [alertState, setAlertState] = useState<ResponseAlertState>({
    id: 0,
    alerts: [],
  })

  const handleDismissAlert = useCallback((alertId: number) => {
    setAlertState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId),
    }))
  }, [])

  const addAlert = useCallback((alertType: ResponseAlertType) => {
    setAlertState(prev => ({
      id: prev.id + 1,
      alerts: [{ id: prev.id, type: alertType }, ...prev.alerts],
    }))
  }, [])

  const handleEvent = useCallback(
    (type: EventType, data?: unknown) => {
      if (type === recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE) {
        addAlert('recoveryCaseResubmitted')
      }

      if (type === informationRequestEvents.INFORMATION_REQUEST_FORM_DONE) {
        addAlert('informationRequestResponded')
      }

      onEvent(type, data)
    },
    [onEvent, addAlert],
  )

  const { data: blockersData } = usePayrollsGetBlockersSuspense({
    companyUuid: companyId,
  })

  const { data: recoveryCasesData } = useRecoveryCasesGetSuspense({
    companyUuid: companyId,
  })

  const { data: informationRequestsData } = useInformationRequestsGetInformationRequestsSuspense({
    companyUuid: companyId,
  })

  const payrollBlockerList = blockersData.payrollBlockerList ?? []
  const recoveryCases = recoveryCasesData.recoveryCaseList ?? []
  const informationRequests = informationRequestsData.informationRequestList ?? []

  const hasUnrecoveredCases = recoveryCases.some(
    recoveryCase => recoveryCase.status !== 'recovered',
  )

  const hasBlockingInformationRequests = informationRequests.some(
    request => request.blockingPayroll && request.status !== InformationRequestStatus.Approved,
  )

  const hasBlockers = payrollBlockerList.length > 0
  const hasAnyContent = hasBlockers || hasUnrecoveredCases || hasBlockingInformationRequests

  return {
    data: {
      payrollBlockerList,
      recoveryCases,
      informationRequests,
      alertState,
    },
    actions: {
      handleEvent,
      handleDismissAlert,
    },
    meta: {
      hasBlockers,
      hasUnrecoveredCases,
      hasBlockingInformationRequests,
      hasAnyContent,
    },
  }
}
