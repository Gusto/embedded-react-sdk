import { useIsMutating } from '@tanstack/react-query'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import {
  useEmployeesUpdateOnboardingDocumentsConfigMutation,
  mutationKeyEmployeesUpdateOnboardingDocumentsConfig,
} from '@gusto/embedded-api/react-query/employeesUpdateOnboardingDocumentsConfig'
import { useTranslation } from 'react-i18next'
import {
  EmployeeDocumentsPresentation,
  type EmployeeDocumentsFormValues,
} from './EmployeeDocumentsPresentation'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentDictionary } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import { useFlow } from '@/components/Flow/useFlow'
import type { OnboardingContextInterface } from '@/components/Employee/OnboardingFlow/OnboardingFlowComponents'
import { ensureRequired } from '@/helpers/ensureRequired'

interface EmployeeDocumentsProps extends BaseComponentInterface<'Employee.EmployeeDocuments'> {
  employeeId: string
  isSelfOnboarding: boolean
  onEvent: OnEventType<EventType, unknown>
}

export function EmployeeDocuments(props: EmployeeDocumentsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = ({ employeeId, isSelfOnboarding, dictionary }: EmployeeDocumentsProps) => {
  useComponentDictionary('Employee.EmployeeDocuments', dictionary)
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = useEmployeesGetSuspense({ employeeId })
  const employee = data.employee
  const currentI9Status = employee?.onboardingDocumentsConfig?.i9Document ?? false

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
          requestBody: {
            i9Document: formData.includeI9,
          },
        },
      })

      onEvent(componentEvents.EMPLOYEE_ONBOARDING_DOCUMENTS_CONFIG_UPDATED, response)
    })
  }

  const handleContinue = () => {
    onEvent(componentEvents.EMPLOYEE_DOCUMENTS_CONTINUE)
  }

  return (
    <EmployeeDocumentsPresentation
      isSelfOnboarding={isSelfOnboarding}
      currentI9Status={currentI9Status}
      onSubmit={onSubmit}
      onContinue={handleContinue}
      isPending={isPending}
    />
  )
}

export const EmployeeDocumentsContextual = () => {
  const { employeeId, onEvent, isSelfOnboardingEnabled } = useFlow<OnboardingContextInterface>()

  return (
    <EmployeeDocuments
      employeeId={ensureRequired(employeeId)}
      isSelfOnboarding={isSelfOnboardingEnabled ?? false}
      onEvent={onEvent}
    />
  )
}
