import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AssignSignatoryDefaultValues } from './useAssignSignatory'
import { SignatoryAssignmentMode } from './useAssignSignatory'
import { useBase, type BaseComponentInterface } from '@/components/Base'
import { companyEvents } from '@/shared/constants'

const AssignSignatorySelectionSchema = z.object({
  signatoryAssignmentMode: z.union([
    z.literal(SignatoryAssignmentMode.createSignatory),
    z.literal(SignatoryAssignmentMode.inviteSignatory),
  ]),
})

type AssignSignatorySelectionInputs = z.infer<typeof AssignSignatorySelectionSchema>

interface UseCompanyAssignSignatoryProps {
  companyId: string
  signatoryId?: string
  defaultValues?: AssignSignatoryDefaultValues
}

export function useCompanyAssignSignatory({
  companyId,
  signatoryId,
  defaultValues,
}: UseCompanyAssignSignatoryProps) {
  const { onEvent } = useBase()

  const formMethods = useForm<AssignSignatorySelectionInputs>({
    resolver: zodResolver(AssignSignatorySelectionSchema),
    defaultValues: {
      signatoryAssignmentMode: SignatoryAssignmentMode.createSignatory,
    },
  })

  const onSignatoryAssignmentModeChange = (mode: string) => {
    onEvent(companyEvents.COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED, mode)
  }

  const onSignatoryFormEvent: BaseComponentInterface['onEvent'] = (event, data) => {
    if (event === companyEvents.COMPANY_CREATE_SIGNATORY_DONE) {
      onEvent(companyEvents.COMPANY_ASSIGN_SIGNATORY_DONE)
    } else if (event === companyEvents.COMPANY_INVITE_SIGNATORY_DONE) {
      onEvent(companyEvents.COMPANY_ASSIGN_SIGNATORY_DONE)
    } else {
      onEvent(event, data)
    }
  }

  return {
    data: {
      companyId,
      signatoryId,
      defaultValues,
    },
    actions: {
      onSignatoryAssignmentModeChange,
      onSignatoryFormEvent,
    },
    meta: {},
    form: {
      formMethods,
    },
  }
}
