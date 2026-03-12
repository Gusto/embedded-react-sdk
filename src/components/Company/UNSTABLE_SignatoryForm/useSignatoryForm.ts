import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { useSignatoriesCreateMutation } from '@gusto/embedded-api/react-query/signatoriesCreate'
import { useSignatoriesUpdateMutation } from '@gusto/embedded-api/react-query/signatoriesUpdate'
import { useSignatoriesDeleteMutation } from '@gusto/embedded-api/react-query/signatoriesDelete'
import type { z } from 'zod'
import {
  generateSignatorySchema,
  signatoryErrorCodes,
  SIGNATORY_CREATE_REQUIRED_FIELDS,
  type SignatoryTitle,
  type StateAbbr,
} from './schema'
import { assertResponseData } from '@/helpers/assertResponseData'
import { assertRequiredFields } from '@/helpers/assertRequiredFields'
import { deriveFieldsFromSchema } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

interface UseSignatoryFormParams {
  companyId: string
  signatoryId?: string
}

export function useSignatoryForm({ companyId, signatoryId }: UseSignatoryFormParams) {
  const {
    data: { signatoryList },
  } = useSignatoriesListSuspense({ companyUuid: companyId })

  const currentSignatory = signatoryList?.find(s => s.uuid === signatoryId)
  const mode = currentSignatory ? 'update' : 'create'
  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const schema = generateSignatorySchema({ mode, hasSsn: currentSignatory?.hasSsn })

  const baseFields = deriveFieldsFromSchema(schema)
  const fields = {
    ...baseFields,
    ssn: { ...baseFields.ssn, hasRedactedValue: Boolean(currentSignatory?.hasSsn) },
  }

  const defaultValues = {
    firstName: currentSignatory?.firstName ?? '',
    middleInitial: '',
    lastName: currentSignatory?.lastName ?? '',
    email: currentSignatory?.email ?? '',
    title: currentSignatory?.title as SignatoryTitle | undefined,
    phone: currentSignatory?.phone ?? '',
    ssn: '',
    birthday: currentSignatory?.birthday ?? '',
    street1: currentSignatory?.homeAddress?.street1 ?? '',
    street2: currentSignatory?.homeAddress?.street2 ?? '',
    city: currentSignatory?.homeAddress?.city ?? '',
    state: currentSignatory?.homeAddress?.state as StateAbbr | undefined,
    zip: currentSignatory?.homeAddress?.zip ?? '',
  }

  const createMutation = useSignatoriesCreateMutation()
  const updateMutation = useSignatoriesUpdateMutation()
  const deleteMutation = useSignatoriesDeleteMutation()

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const onSubmit = async (data: z.infer<typeof schema>) => {
    return baseSubmitHandler(data, async payload => {
      const { street2, ssn, middleInitial } = payload

      if (mode === 'update' && currentSignatory) {
        const response = await updateMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            signatoryUuid: currentSignatory.uuid,
            requestBody: {
              version: currentSignatory.version,
              ...(ssn ? { ssn } : {}),
              firstName: payload.firstName,
              middleInitial,
              lastName: payload.lastName,
              title: payload.title,
              phone: payload.phone,
              birthday: payload.birthday,
              homeAddress: {
                street1: payload.street1,
                street2,
                city: payload.city,
                state: payload.state,
                zip: payload.zip,
              },
            },
          },
        })

        assertResponseData(response.signatory, 'signatory')
        return { data: response.signatory, mode: 'update' as const }
      }

      assertRequiredFields(payload, [...SIGNATORY_CREATE_REQUIRED_FIELDS])

      if (signatoryList?.[0]?.uuid) {
        await deleteMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            signatoryUuid: signatoryList[0].uuid,
          },
        })
      }

      const response = await createMutation.mutateAsync({
        request: {
          companyUuid: companyId,
          requestBody: {
            email: payload.email,
            ssn: ssn || '',
            firstName: payload.firstName,
            middleInitial,
            lastName: payload.lastName,
            title: payload.title,
            phone: payload.phone,
            birthday: payload.birthday,
            homeAddress: {
              street1: payload.street1,
              street2,
              city: payload.city,
              state: payload.state,
              zip: payload.zip,
            },
          },
        },
      })

      assertResponseData(response.signatory, 'signatory')
      return { data: response.signatory, mode: 'create' as const }
    })
  }

  return {
    data: { signatoryList, currentSignatory, mode },
    schema,
    fields,
    defaultValues,
    onSubmit,
    isPending,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: signatoryErrorCodes,
  }
}
