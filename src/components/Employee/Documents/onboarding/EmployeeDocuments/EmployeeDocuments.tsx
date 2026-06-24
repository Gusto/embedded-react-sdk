import { useIsMutating } from '@tanstack/react-query'
import { useEmployeesGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesGet'
import {
  useEmployeesUpdateOnboardingDocumentsConfigMutation,
  mutationKeyEmployeesUpdateOnboardingDocumentsConfig,
} from '@gusto/embedded-api-v-2026-02-01/react-query/employeesUpdateOnboardingDocumentsConfig'
import {
  EmployeeDocumentsPresentation,
  type EmployeeDocumentsFormValues,
} from './EmployeeDocumentsPresentation'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n'
import {
  componentEvents,
  EmployeeSelfOnboardingStatuses,
  EmployeeOnboardingStatus,
} from '@/shared/constants'
import { useFlow } from '@/components/Flow/useFlow'
import type { OnboardingContextInterface } from '@/components/Employee/OnboardingFlow/OnboardingFlowComponents'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Props for {@link EmployeeDocuments}.
 *
 * @public
 */
export interface EmployeeDocumentsProps extends BaseComponentInterface<'Employee.EmployeeDocuments'> {
  /** The associated employee identifier. */
  employeeId: string
}

/**
 * Onboarding step for selecting which documents the employee must complete.
 *
 * @remarks
 * Shows the I-9 toggle when the employee is self-onboarding (so the employee
 * can choose whether their employer will collect I-9 verification) and a
 * summary otherwise. Persists the selection to the employee's onboarding
 * documents configuration and advances the parent flow.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/onboardingDocumentsConfig/updated` | Fired after the employee's documents configuration is saved | The updated documents configuration response |
 * | `employee/documents/done` | Fired when the step is complete and the parent flow can advance | — |
 *
 * @param props - Component props including `employeeId` and `onEvent`.
 * @returns The employee documents onboarding step.
 * @public
 */
export function EmployeeDocuments(props: EmployeeDocumentsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = ({ employeeId, dictionary }: EmployeeDocumentsProps) => {
  useComponentDictionary('Employee.EmployeeDocuments', dictionary)
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = useEmployeesGetSuspense({ employeeId })
  const employee = data.employee
  const currentI9Status = employee?.onboardingDocumentsConfig?.i9Document ?? false

  const isEmployeeSelfOnboarding = employee?.onboardingStatus
    ? // @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses
      EmployeeSelfOnboardingStatuses.has(employee.onboardingStatus) ||
      employee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
    : false

  const { mutateAsync: updateOnboardingDocumentsConfig } =
    useEmployeesUpdateOnboardingDocumentsConfigMutation()

  const isMutating = useIsMutating({
    mutationKey: mutationKeyEmployeesUpdateOnboardingDocumentsConfig(),
  })
  const isPending = isMutating > 0

  const onSubmit = async (formData: EmployeeDocumentsFormValues) => {
    await baseSubmitHandler(formData, async () => {
      const response = await updateOnboardingDocumentsConfig({
        request: {
          employeeId,
          employeeOnboardingDocumentsConfigRequest: {
            i9Document: formData.includeI9,
          },
        },
      })

      onEvent(componentEvents.EMPLOYEE_ONBOARDING_DOCUMENTS_CONFIG_UPDATED, response)
      onEvent(componentEvents.EMPLOYEE_DOCUMENTS_DONE)
    })
  }

  const handleDone = () => {
    onEvent(componentEvents.EMPLOYEE_DOCUMENTS_DONE)
  }

  return (
    <EmployeeDocumentsPresentation
      isEmployeeSelfOnboarding={isEmployeeSelfOnboarding}
      currentI9Status={currentI9Status}
      onSubmit={onSubmit}
      onDone={handleDone}
      isPending={isPending}
    />
  )
}

/** @internal */
export const EmployeeDocumentsContextual = () => {
  const { employeeId, onEvent } = useFlow<OnboardingContextInterface>()

  return <EmployeeDocuments employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
