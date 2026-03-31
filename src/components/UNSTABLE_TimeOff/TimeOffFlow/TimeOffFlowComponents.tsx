import type { ReactNode } from 'react'
import { PolicyList } from '../PolicyList/PolicyList'
import { PolicyTypeSelector } from '../PolicyTypeSelector/PolicyTypeSelector'
import { PolicyDetailsForm } from '../PolicyDetailsForm/PolicyDetailsForm'
import { PolicySettings } from '../PolicySettings/PolicySettings'
import { AddEmployeesToPolicy } from '../AddEmployeesToPolicy/AddEmployeesToPolicy'
import { ViewPolicyDetails } from '../ViewPolicyDetails/ViewPolicyDetails'
import { ViewPolicyEmployees } from '../ViewPolicyEmployees/ViewPolicyEmployees'
import { HolidaySelectionForm } from '../HolidaySelectionForm/HolidaySelectionForm'
import { AddEmployeesHoliday } from '../AddEmployeesHoliday/AddEmployeesHoliday'
import { ViewHolidayEmployees } from '../ViewHolidayEmployees/ViewHolidayEmployees'
import { ViewHolidaySchedule } from '../ViewHolidaySchedule/ViewHolidaySchedule'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { Flex } from '@/components/Common'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface TimeOffFlowProps extends BaseComponentInterface {
  companyId: string
}

export type TimeOffFlowAlert = {
  type: 'error' | 'info' | 'success'
  title: string
  content?: ReactNode
}

export type TimeOffPolicyType = 'sick' | 'vacation' | 'holiday'

export interface TimeOffFlowContextInterface extends FlowContextInterface {
  companyId: string
  policyType?: TimeOffPolicyType
  policyId?: string
  alerts?: TimeOffFlowAlert[]
}

export function PolicyListContextual() {
  const { onEvent, companyId, alerts } = useFlow<TimeOffFlowContextInterface>()
  const { Alert } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <PolicyList onEvent={onEvent} companyId={ensureRequired(companyId)} />
    </Flex>
  )
}

export function PolicyTypeSelectorContextual() {
  const { onEvent, companyId, alerts } = useFlow<TimeOffFlowContextInterface>()
  const { Alert } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <PolicyTypeSelector onEvent={onEvent} companyId={ensureRequired(companyId)} />
    </Flex>
  )
}

export function PolicyDetailsFormContextual() {
  const { onEvent, companyId, policyType, alerts } = useFlow<TimeOffFlowContextInterface>()
  const { Alert } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <PolicyDetailsForm
        onEvent={onEvent}
        companyId={ensureRequired(companyId)}
        policyType={ensureRequired(policyType) as 'sick' | 'vacation'}
      />
    </Flex>
  )
}

export function PolicySettingsContextual() {
  const { onEvent, policyId, alerts } = useFlow<TimeOffFlowContextInterface>()
  const { Alert } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <PolicySettings onEvent={onEvent} policyId={ensureRequired(policyId)} />
    </Flex>
  )
}

export function AddEmployeesToPolicyContextual() {
  const { onEvent, policyId } = useFlow<TimeOffFlowContextInterface>()
  return <AddEmployeesToPolicy onEvent={onEvent} policyId={ensureRequired(policyId)} />
}

export function ViewPolicyDetailsContextual() {
  const { onEvent, policyId } = useFlow<TimeOffFlowContextInterface>()
  return <ViewPolicyDetails onEvent={onEvent} policyId={ensureRequired(policyId)} />
}

export function ViewPolicyEmployeesContextual() {
  const { onEvent, policyId } = useFlow<TimeOffFlowContextInterface>()
  return <ViewPolicyEmployees onEvent={onEvent} policyId={ensureRequired(policyId)} />
}

export function HolidaySelectionFormContextual() {
  const { onEvent, companyId, alerts } = useFlow<TimeOffFlowContextInterface>()
  const { Alert } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <HolidaySelectionForm onEvent={onEvent} companyId={ensureRequired(companyId)} />
    </Flex>
  )
}

export function AddEmployeesHolidayContextual() {
  const { onEvent, companyId } = useFlow<TimeOffFlowContextInterface>()
  return <AddEmployeesHoliday onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function ViewHolidayEmployeesContextual() {
  const { onEvent, companyId } = useFlow<TimeOffFlowContextInterface>()
  return <ViewHolidayEmployees onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function ViewHolidayScheduleContextual() {
  const { onEvent, companyId } = useFlow<TimeOffFlowContextInterface>()
  return <ViewHolidaySchedule onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
