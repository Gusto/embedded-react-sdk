import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { useSignatoriesCreateMutation } from '@gusto/embedded-api/react-query/signatoriesCreate'
import { useSignatoriesUpdateMutation } from '@gusto/embedded-api/react-query/signatoriesUpdate'
import { useSignatoriesDeleteMutation } from '@gusto/embedded-api/react-query/signatoriesDelete'
import { type CreateSignatoryInputs } from './CreateSignatoryForm'
import type { CreateSignatoryDefaultValues } from './useCreateSignatory'
import { generateCreateSignatorySchema } from './Schema'
import { useBase } from '@/components/Base'
import { companyEvents } from '@/shared/constants'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { commonMasks, useMaskedTransform } from '@/helpers/mask'

interface UseCompanyCreateSignatoryProps {
  companyId: string
  signatoryId?: string
  defaultValues?: CreateSignatoryDefaultValues
}

export function useCompanyCreateSignatory({
  companyId,
  signatoryId,
  defaultValues,
}: UseCompanyCreateSignatoryProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const transformPhone = useMaskedTransform(commonMasks.phoneMask)

  const {
    data: { signatoryList },
  } = useSignatoriesListSuspense({
    companyUuid: companyId,
  })
  const signatories = signatoryList!

  const currentSignatory = signatories.find(signatory => signatory.uuid === signatoryId)

  const createSignatoryMutation = useSignatoriesCreateMutation()
  const updateSignatoryMutation = useSignatoriesUpdateMutation()
  const deleteSignatoryMutation = useSignatoriesDeleteMutation()

  const defaultBirthday = currentSignatory?.birthday ?? defaultValues?.birthday

  const createSignatoryDefaultValues = {
    firstName: currentSignatory?.firstName ?? defaultValues?.firstName ?? '',
    lastName: currentSignatory?.lastName ?? defaultValues?.lastName ?? '',
    email: currentSignatory?.email ?? defaultValues?.email ?? '',
    title: currentSignatory?.title ?? defaultValues?.title ?? '',
    phone: transformPhone(currentSignatory?.phone ?? defaultValues?.phone ?? ''),
    ssn: currentSignatory?.hasSsn ? '' : defaultValues?.ssn,
    street1: currentSignatory?.homeAddress?.street1 ?? defaultValues?.street1,
    street2: currentSignatory?.homeAddress?.street2 ?? defaultValues?.street2,
    city: currentSignatory?.homeAddress?.city ?? defaultValues?.city,
    state: currentSignatory?.homeAddress?.state ?? defaultValues?.state,
    zip: currentSignatory?.homeAddress?.zip ?? defaultValues?.zip,
    ...(defaultBirthday ? { birthday: new Date(defaultBirthday) } : {}),
  }

  const formMethods = useForm<CreateSignatoryInputs>({
    resolver: zodResolver(generateCreateSignatorySchema(currentSignatory?.hasSsn)),
    defaultValues: createSignatoryDefaultValues,
  })

  const onSubmit = async (data: CreateSignatoryInputs) => {
    await baseSubmitHandler(data, async payload => {
      const { street1, street2, city, state, zip, birthday, email, ssn, ...signatoryData } = payload

      const commonData = {
        ...signatoryData,
        birthday: formatDateToStringDate(birthday) || '',
        homeAddress: {
          street1,
          street2,
          city,
          state,
          zip,
        },
      }

      if (currentSignatory) {
        const updateSignatoryResponse = await updateSignatoryMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            signatoryUuid: currentSignatory.uuid,
            requestBody: {
              version: currentSignatory.version,
              ...(ssn ? { ssn } : {}),
              ...commonData,
            },
          },
        })

        onEvent(companyEvents.COMPANY_SIGNATORY_UPDATED, updateSignatoryResponse.signatory)
      } else {
        if (signatories[0]?.uuid) {
          await deleteSignatoryMutation.mutateAsync({
            request: {
              companyUuid: companyId,
              signatoryUuid: signatories[0].uuid,
            },
          })
        }
        const createSignatoryResponse = await createSignatoryMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            requestBody: {
              email,
              ssn: ssn || '',
              ...commonData,
            },
          },
        })
        onEvent(companyEvents.COMPANY_SIGNATORY_CREATED, createSignatoryResponse.signatory)
      }
      onEvent(companyEvents.COMPANY_CREATE_SIGNATORY_DONE)
    })
  }

  return {
    data: {
      currentSignatory,
    },
    actions: {
      onSubmit,
    },
    meta: {
      isPending:
        createSignatoryMutation.isPending ||
        deleteSignatoryMutation.isPending ||
        updateSignatoryMutation.isPending,
    },
    form: {
      formMethods,
    },
  }
}
