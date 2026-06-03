import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  onboardingExecutionMachine,
  INITIAL_COMPONENT_MAP,
  type OnboardingExecutionInitialState,
} from './onboardingExecutionStateMachine'
import {
  type OnboardingContextInterface,
  type OnboardingDefaultValues,
} from './OnboardingExecutionFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType, EmployeeOnboardingStatus } from '@/shared/constants'

export interface OnboardingExecutionFlowProps {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
  initialState?: OnboardingExecutionInitialState
  initialEmployeeId?: string
  initialOnboardingStatus?: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
  defaultValues?: OnboardingDefaultValues
  isAdmin?: boolean
  isSelfOnboardingEnabled?: boolean
  withEmployeeI9?: boolean
}

export function OnboardingExecutionFlow({
  companyId,
  onEvent,
  initialState = 'employeeProfile',
  initialEmployeeId,
  initialOnboardingStatus,
  defaultValues,
  isAdmin = true,
  isSelfOnboardingEnabled = true,
  withEmployeeI9 = false,
}: OnboardingExecutionFlowProps) {
  const machine = useMemo(
    () =>
      createMachine(
        initialState,
        onboardingExecutionMachine,
        (initialContext: OnboardingContextInterface) => ({
          ...initialContext,
          component: INITIAL_COMPONENT_MAP[initialState],
          companyId,
          employeeId: initialEmployeeId,
          onboardingStatus: initialOnboardingStatus,
          defaultValues,
          isAdmin,
          isSelfOnboardingEnabled,
          withEmployeeI9,
        }),
      ),
    [
      companyId,
      initialState,
      initialEmployeeId,
      initialOnboardingStatus,
      defaultValues,
      isAdmin,
      isSelfOnboardingEnabled,
      withEmployeeI9,
    ],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
