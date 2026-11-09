import { FormProvider } from 'react-hook-form'
import type { TimeTrackingPerson } from './types'
import { OvertimePolicyFields } from './OvertimePolicyForm'
import { type OvertimePolicyFormValues, useOvertimePolicyForm } from './useOvertimePolicyForm'
import { ActionsLayout, Flex } from '@/components/Common'
import { DetailViewLayout } from '@/components/Common/DetailViewLayout/DetailViewLayout'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface CreateOvertimePolicyProps {
  people: TimeTrackingPerson[]
  policyNames: Record<string, string>
  serverErrors?: string[]
  isSubmitting?: boolean
  onSubmit: (values: OvertimePolicyFormValues) => void
  onCancel: () => void
}

export function CreateOvertimePolicy({
  people,
  policyNames,
  serverErrors,
  isSubmitting,
  onSubmit,
  onCancel,
}: CreateOvertimePolicyProps) {
  const Components = useComponentContext()
  const { formMethods, submit } = useOvertimePolicyForm({ policyNames, onSubmit })

  return (
    <DetailViewLayout title="Create an overtime policy" onBack={onCancel} backLabel="Time tracking">
      <FormProvider {...formMethods}>
        <Flex flexDirection="column" gap={20} alignItems="stretch">
          <OvertimePolicyFields
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
