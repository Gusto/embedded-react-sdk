import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { useSignatoriesInviteMutation } from '@gusto/embedded-api/react-query/signatoriesInvite'
import { useSignatoriesDeleteMutation } from '@gusto/embedded-api/react-query/signatoriesDelete'
import { type InviteSignatoryInputs, InviteSignatorySchema } from './InviteSignatoryForm'
import type { InviteSignatoryDefaultValues } from './useInviteSignatory'
import { useBase } from '@/components/Base'
import { companyEvents } from '@/shared/constants'

interface UseCompanyInviteSignatoryProps {
  companyId: string
  defaultValues?: InviteSignatoryDefaultValues
}

export function useCompanyInviteSignatory({
  companyId,
  defaultValues,
}: UseCompanyInviteSignatoryProps) {
  const { onEvent, baseSubmitHandler } = useBase()

  const {
    data: { signatoryList },
  } = useSignatoriesListSuspense({
    companyUuid: companyId,
  })
  const signatories = signatoryList!

  const inviteSignatoryMutation = useSignatoriesInviteMutation()
  const deleteSignatoryMutation = useSignatoriesDeleteMutation()

  const inviteSignatoryDefaultValues = {
    firstName: defaultValues?.firstName ?? '',
    lastName: defaultValues?.lastName ?? '',
    email: defaultValues?.email,
    confirmEmail: defaultValues?.confirmEmail,
    title: defaultValues?.title ?? '',
  }

  const formMethods = useForm<InviteSignatoryInputs>({
    resolver: zodResolver(InviteSignatorySchema),
    defaultValues: inviteSignatoryDefaultValues,
  })

  const onSubmit = async (data: InviteSignatoryInputs) => {
    await baseSubmitHandler(data, async payload => {
      const { confirmEmail, ...signatoryData } = payload
      if (signatories[0]?.uuid) {
        await deleteSignatoryMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            signatoryUuid: signatories[0].uuid,
          },
        })
      }

      const inviteSignatoryResponse = await inviteSignatoryMutation.mutateAsync({
        request: {
          companyUuid: companyId,
          requestBody: signatoryData,
        },
      })

      onEvent(companyEvents.COMPANY_SIGNATORY_INVITED, inviteSignatoryResponse.signatory)
      onEvent(companyEvents.COMPANY_INVITE_SIGNATORY_DONE)
    })
  }

  return {
    data: {},
    actions: {
      onSubmit,
    },
    meta: {
      isPending: inviteSignatoryMutation.isPending,
    },
    form: {
      formMethods,
    },
  }
}
