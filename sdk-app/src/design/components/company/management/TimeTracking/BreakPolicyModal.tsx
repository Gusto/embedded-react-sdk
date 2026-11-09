import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import type { BreakPolicy, TimeTrackingPerson } from './types'
import { BreakPolicyFields } from './BreakPolicyForm'
import { type BreakPolicyFormValues, useBreakPolicyForm } from './useBreakPolicyForm'
import { useStateName } from './useStateName'
import { ModalFooterWithDelete } from './ModalFooterWithDelete'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface BreakPolicyModalProps {
  policy: BreakPolicy
  people: TimeTrackingPerson[]
  policyNames: Record<string, string>
  serverErrors?: string[]
  isSubmitting?: boolean
  isDeleting?: boolean
  onSubmit: (values: BreakPolicyFormValues) => void
  onDelete?: () => void
  onClose: () => void
}

export function BreakPolicyModal({
  policy,
  people,
  policyNames,
  serverErrors,
  isSubmitting,
  isDeleting,
  onSubmit,
  onDelete,
  onClose,
}: BreakPolicyModalProps) {
  const Components = useComponentContext()
  const stateName = useStateName()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const { formMethods, jurisdiction, submit } = useBreakPolicyForm({
    policy,
    policyNames,
    onSubmit,
  })

  const actionButtons = [
    <Components.Button key="cancel" variant="secondary" onClick={onClose} isDisabled={isSubmitting}>
      Cancel
    </Components.Button>,
    <Components.Button key="save" isLoading={isSubmitting} onClick={submit}>
      Save changes
    </Components.Button>,
  ]
  const actions = <ActionsLayout>{actionButtons}</ActionsLayout>

  return (
    <>
      <Components.Modal
        isOpen
        onClose={onClose}
        footer={
          onDelete ? (
            <ModalFooterWithDelete
              deleteAction={
                <Components.Button
                  variant="error"
                  isLoading={isDeleting}
                  onClick={() => {
                    setIsConfirmingDelete(true)
                  }}
                >
                  Delete policy
                </Components.Button>
              }
            >
              {actionButtons}
            </ModalFooterWithDelete>
          ) : (
            actions
          )
        }
      >
        <FormProvider {...formMethods}>
          <Flex flexDirection="column" gap={20} alignItems="stretch">
            <Flex flexDirection="column" gap={4}>
              <Components.Heading as="h3">Edit break policy</Components.Heading>
              {jurisdiction ? (
                <Components.Text variant="supporting">
                  {`${stateName(jurisdiction)} · The state can’t be changed after a policy is created.`}
                </Components.Text>
              ) : null}
            </Flex>
            <BreakPolicyFields
              policy={policy}
              jurisdiction={jurisdiction}
              people={people}
              policyNames={policyNames}
              serverErrors={serverErrors}
            />
          </Flex>
        </FormProvider>
      </Components.Modal>

      <Components.Dialog
        isOpen={isConfirmingDelete}
        title={`Delete “${policy.name}”?`}
        primaryActionLabel="Delete policy"
        closeActionLabel="Cancel"
        isDestructive
        isPrimaryActionLoading={isDeleting}
        onClose={() => {
          setIsConfirmingDelete(false)
        }}
        onPrimaryActionClick={() => {
          setIsConfirmingDelete(false)
          onDelete?.()
        }}
      >
        {`${policy.employeeUuids.length > 0 ? `${policy.employeeUuids.length} team members are assigned to this policy. ` : ''}You can only delete a break policy if an employee on the policy has not already taken a break today. This action cannot be undone.`}
      </Components.Dialog>
    </>
  )
}
