import type { ReactNode } from 'react'
import { PolicyList } from '../PolicyList/PolicyList'
import { PolicyTypeSelector } from '../PolicyTypeSelector/PolicyTypeSelector'
import { PolicyConfigurationForm } from '../TimeOffManagement/PolicyConfigurationForm'
import { PolicySettings } from '../PolicySettings/PolicySettings'
import { AddEmployeesToPolicy } from '../AddEmployeesToPolicy/AddEmployeesToPolicy'
import { TimeOffPolicyDetail } from '../TimeOffPolicyDetail/TimeOffPolicyDetail'
import { HolidaySelectionForm } from '../HolidaySelectionForm/HolidaySelectionForm'
import { AddEmployeesHoliday } from '../AddEmployeesHoliday/AddEmployeesHoliday'
import { ViewHolidayEmployees } from '../ViewHolidayEmployees/ViewHolidayEmployees'
import { ViewHolidaySchedule } from '../ViewHolidaySchedule/ViewHolidaySchedule'
import { assertCreatablePolicyType, type TimeOffPolicyType } from './timeOffPolicyTypes'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { Flex } from '@/components/Common'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link TimeOffFlow}.
 *
 * @public
 */
export interface TimeOffFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
}

/** @internal */
export type TimeOffFlowAlert = {
  type: 'error' | 'info' | 'success'
  title: string
  content?: ReactNode
}

/** @internal */
export type AddEmployeesSource =
  'policySettings' | 'policyDetailsForm' | 'viewTimeOffPolicyDetail' | 'viewHolidayEmployees'

/** @internal */
export interface TimeOffFlowContextInterface extends FlowContextInterface {
  /** The associated company identifier. */
  companyId: string
  /** The currently selected policy type, if any. */
  policyType?: TimeOffPolicyType
  /** The currently selected policy identifier, if any. */
  policyId?: string
  /** Alerts to render at the top of the current step. */
  alerts?: TimeOffFlowAlert[]
  /** Which step launched the add-employees screen, used to route the back transition. */
  addEmployeesSource?: AddEmployeesSource
}

/** @internal */
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

/** @internal */
export function SelectPolicyTypeContextual() {
  const { onEvent, companyId, policyType, alerts } = useFlow<TimeOffFlowContextInterface>()
  const { Alert } = useComponentContext()

  const selectorDefault =
    policyType === 'sick' || policyType === 'vacation' || policyType === 'holiday'
      ? policyType
      : undefined

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <PolicyTypeSelector
        onEvent={onEvent}
        companyId={ensureRequired(companyId)}
        defaultPolicyType={selectorDefault}
      />
    </Flex>
  )
}

/** @internal */
export function PolicyDetailsFormContextual() {
  const { onEvent, companyId, policyType, policyId, alerts } =
    useFlow<TimeOffFlowContextInterface>()
  const { Alert } = useComponentContext()
  const requiredPolicyType = ensureRequired(policyType)
  assertCreatablePolicyType(requiredPolicyType)

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <PolicyConfigurationForm
        onEvent={onEvent}
        companyId={ensureRequired(companyId)}
        policyType={requiredPolicyType}
        policyId={policyId}
      />
    </Flex>
  )
}

/** @internal */
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
      <PolicySettings onEvent={onEvent} policyId={ensureRequired(policyId)} mode="create" />
    </Flex>
  )
}

/** @internal */
export function EditPolicySettingsContextual() {
  const { onEvent, policyId, alerts } = useFlow<TimeOffFlowContextInterface>()
  const { Alert } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <PolicySettings onEvent={onEvent} policyId={ensureRequired(policyId)} mode="edit" />
    </Flex>
  )
}

/** @internal */
export function AddEmployeesToPolicyContextual() {
  const { onEvent, companyId, policyId, policyType } = useFlow<TimeOffFlowContextInterface>()
  const requiredPolicyType = ensureRequired(policyType)
  assertCreatablePolicyType(requiredPolicyType)
  return (
    <AddEmployeesToPolicy
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      policyId={ensureRequired(policyId)}
      policyType={requiredPolicyType}
    />
  )
}

/** @internal */
export function TimeOffPolicyDetailContextual() {
  const { onEvent, policyId } = useFlow<TimeOffFlowContextInterface>()
  return <TimeOffPolicyDetail onEvent={onEvent} policyId={ensureRequired(policyId)} />
}

/** @internal */
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
      <HolidaySelectionForm onEvent={onEvent} companyId={ensureRequired(companyId)} mode="create" />
    </Flex>
  )
}

/** @internal */
export function EditHolidaySelectionFormContextual() {
  const { onEvent, companyId, alerts } = useFlow<TimeOffFlowContextInterface>()
  const { Alert } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <HolidaySelectionForm onEvent={onEvent} companyId={ensureRequired(companyId)} mode="edit" />
    </Flex>
  )
}

/** @internal */
export function AddEmployeesHolidayContextual() {
  const { onEvent, companyId } = useFlow<TimeOffFlowContextInterface>()
  return <AddEmployeesHoliday onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

/** @internal */
export function ViewHolidayEmployeesContextual() {
  const { onEvent, companyId } = useFlow<TimeOffFlowContextInterface>()
  return <ViewHolidayEmployees onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

/** @internal */
export function ViewHolidayScheduleContextual() {
  const { onEvent, companyId } = useFlow<TimeOffFlowContextInterface>()
  return <ViewHolidaySchedule onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
