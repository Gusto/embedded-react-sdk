import { useFormContext } from 'react-hook-form'
import { SignatoryAssignmentMode, useAssignSignatory } from './useAssignSignatory'
import { CreateSignatory } from './CreateSignatory'
import { InviteSignatory } from './InviteSignatory'

export const SignatoryForm = () => {
  const { companyId, signatoryId, onSignatoryFormEvent, defaultValues } = useAssignSignatory()

  const { watch } = useFormContext()

  const signatoryAssignmentMode = watch('signatoryAssignmentMode')

  return (
    <>
      {signatoryAssignmentMode === SignatoryAssignmentMode.createSignatory ? (
        <CreateSignatory
          companyId={companyId}
          signatoryId={signatoryId}
          onEvent={onSignatoryFormEvent}
          defaultValues={defaultValues?.create}
        />
      ) : (
        <InviteSignatory
          companyId={companyId}
          onEvent={onSignatoryFormEvent}
          defaultValues={defaultValues?.invite}
        />
      )}
    </>
  )
}
