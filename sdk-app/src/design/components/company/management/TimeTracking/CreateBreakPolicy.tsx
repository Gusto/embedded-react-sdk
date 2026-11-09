import { FormProvider } from 'react-hook-form'
import type { TimeTrackingPerson } from './types'
import { BreakPolicyFields } from './BreakPolicyForm'
import { type BreakPolicyFormValues, useBreakPolicyForm } from './useBreakPolicyForm'
import { ActionsLayout, Flex } from '@/components/Common'
import { DetailViewLayout } from '@/components/Common/DetailViewLayout/DetailViewLayout'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface CreateBreakPolicyProps {
  people: TimeTrackingPerson[]
  policyNames: Record<string, string>
  serverErrors?: string[]
  isSubmitting?: boolean
  onSubmit: (values: BreakPolicyFormValues) => void
  onCancel: () => void
}

export function CreateBreakPolicy({
  people,
  policyNames,
  serverErrors,
  isSubmitting,
  onSubmit,
  onCancel,
}: CreateBreakPolicyProps) {
  const Components = useComponentContext()
  const { formMethods, jurisdiction, submit } = useBreakPolicyForm({
    policyNames,
    onSubmit,
  })

  return (
    <DetailViewLayout title="Create a break policy" onBack={onCancel} backLabel="Time tracking">
      <FormProvider {...formMethods}>
        <Flex flexDirection="column" gap={20} alignItems="stretch">
          <BreakPolicyFields
            jurisdiction={jurisdiction}
            people={people}
            policyNames={policyNames}
            serverErrors={serverErrors}
          />
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onCancel} isDisabled={isSubmitting}>
              Cancel
            </Components.Button>
            <Components.Button isLoading={isSubmitting} onClick={submit}>
              Create policy
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </FormProvider>
    </DetailViewLayout>
  )
}
