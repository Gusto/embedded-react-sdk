import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import type { OvertimePolicy, TimeTrackingPerson } from './types'
import { OvertimePolicyFields } from './OvertimePolicyForm'
import { type OvertimePolicyFormValues, useOvertimePolicyForm } from './useOvertimePolicyForm'
import { formatLongDate } from './formatters'
import { ModalFooterWithDelete } from './ModalFooterWithDelete'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface OvertimePolicyModalProps {
  policy: OvertimePolicy
  people: TimeTrackingPerson[]
  policyNames: Record<string, string>
  workweekStartedOn: string | null
  serverErrors?: string[]
  isSubmitting?: boolean
  isDeleting?: boolean
  onSubmit: (values: OvertimePolicyFormValues) => void
  onDelete?: () => void
  onClose: () => void
}

export function OvertimePolicyModal({
  policy,
  people,
  policyNames,
  workweekStartedOn,
  serverErrors,
  isSubmitting,
  isDeleting,
  onSubmit,
  onDelete,
  onClose,
}: OvertimePolicyModalProps) {
  const Components = useComponentContext()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const { formMethods, submit } = useOvertimePolicyForm({ policy, policyNames, onSubmit })
  const canDelete = policy.employeeUuids.length === 0 && onDelete

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
          canDelete ? (
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
            <Components.Heading as="h3">Edit overtime policy</Components.Heading>

            {workweekStartedOn ? (
              <Components.Alert
                status="info"
                label="When changes take effect"
                disableScrollIntoView
              >
                <Components.Text>
                  {`Any changes will become effective in the current workweek, which began on ${formatLongDate(workweekStartedOn)}. If you’ve run a payroll that includes any part of this workweek, you may need to run a correction payroll to adjust for any differences in overtime.`}
                </Components.Text>
              </Components.Alert>
            ) : null}

            <OvertimePolicyFields
              policy={policy}
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
        This action cannot be undone.
      </Components.Dialog>
    </>
  )
}
