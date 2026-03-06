import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { useSignatoriesCreateMutation } from '@gusto/embedded-api/react-query/signatoriesCreate'
import { useSignatoriesUpdateMutation } from '@gusto/embedded-api/react-query/signatoriesUpdate'
import { useSignatoriesDeleteMutation } from '@gusto/embedded-api/react-query/signatoriesDelete'
import type { Signatory } from '@gusto/embedded-api/models/components/signatory'
import type { z } from 'zod'
import {
  generateSignatorySchema,
  signatoryErrorCodes,
  type SignatoryTitle,
  type StateAbbr,
} from './schema'
import { deriveFieldsFromSchema } from '@/helpers/deriveFieldsFromSchema'

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

  const schema = generateSignatorySchema(currentSignatory?.hasSsn)

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
    const {
      street1,
      street2,
      city,
      state,
      zip,
      birthday,
      email,
      ssn,
      firstName,
      middleInitial,
      lastName,
      title,
      phone,
    } = data

    const commonData = {
      firstName,
      middleInitial,
      lastName,
      title,
      phone,
      birthday,
      homeAddress: { street1, street2, city, state, zip },
    }

    if (mode === 'update' && currentSignatory) {
      const response = await updateMutation.mutateAsync({
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

      return { data: response.signatory! satisfies Signatory, mode: 'update' as const }
    }

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
          email,
          ssn: ssn || '',
          ...commonData,
        },
      },
    })

    return { data: response.signatory! satisfies Signatory, mode: 'create' as const }
  }

  return { schema, fields, defaultValues, onSubmit, isPending, errorCodes: signatoryErrorCodes }
}
