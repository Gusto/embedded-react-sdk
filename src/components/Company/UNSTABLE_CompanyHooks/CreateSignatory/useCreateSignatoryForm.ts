import type { Signatory } from '@gusto/embedded-api/models/components/signatory'
import { useMemo, useCallback } from 'react'
import { useSignatoriesList } from '@gusto/embedded-api/react-query/signatoriesList'
import { useSignatoriesCreateMutation } from '@gusto/embedded-api/react-query/signatoriesCreate'
import { useSignatoriesUpdateMutation } from '@gusto/embedded-api/react-query/signatoriesUpdate'
import { useSignatoriesDeleteMutation } from '@gusto/embedded-api/react-query/signatoriesDelete'
import { generateCreateSignatorySchema, type CreateSignatoryFormData } from './schema'
import { createSignatoryFields } from './fields'
import { SubmitOperation, type SubmitResult } from '@/hooks/UNSTABLE/types'
import { useHookSubmit } from '@/hooks/UNSTABLE/useHookSubmit'
import { useHookError } from '@/hooks/UNSTABLE/useHookError'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { commonMasks, formatWithMask } from '@/helpers/mask'

export interface CreateSignatoryData {
  signatories: Signatory[]
  currentSignatory: Signatory | undefined
}

interface UseCreateSignatoryFormProps {
  companyId: string
  signatoryId?: string
}

export function useCreateSignatoryForm({ companyId, signatoryId }: UseCreateSignatoryFormProps) {
  const {
    data: signatoryListData,
    isLoading,
    error: queryError,
    refetch,
  } = useSignatoriesList({ companyUuid: companyId })

  const createMutation = useSignatoriesCreateMutation()
  const updateMutation = useSignatoriesUpdateMutation()
  const deleteMutation = useSignatoriesDeleteMutation()

  const {
    submitHandler,
    error: submitError,
    fieldErrors,
    setError: clearSubmitError,
  } = useHookSubmit()

  const signatories = signatoryListData?.signatoryList ?? []
  const currentSignatory = signatories.find(s => s.uuid === signatoryId)

  const schema = useMemo(
    () => generateCreateSignatorySchema(currentSignatory?.hasSsn),
    [currentSignatory?.hasSsn],
  )

  const defaultBirthday = currentSignatory?.birthday
  const defaultValues: CreateSignatoryFormData = {
    firstName: currentSignatory?.firstName ?? '',
    lastName: currentSignatory?.lastName ?? '',
    email: currentSignatory?.email ?? '',
    title: currentSignatory?.title ?? '',
    phone: formatWithMask(currentSignatory?.phone ?? '', commonMasks.phoneMask),
    ssn: currentSignatory?.hasSsn ? '' : '',
    birthday: defaultBirthday ? new Date(defaultBirthday) : new Date(),
    street1: currentSignatory?.homeAddress?.street1 ?? '',
    street2: currentSignatory?.homeAddress?.street2 ?? '',
    city: currentSignatory?.homeAddress?.city ?? '',
    state: currentSignatory?.homeAddress?.state ?? '',
    zip: currentSignatory?.homeAddress?.zip ?? '',
  }

  const ssnRequired = !currentSignatory?.hasSsn
  const fields = {
    ...createSignatoryFields,
    ssn: {
      ...createSignatoryFields.ssn,
      required: ssnRequired,
    },
  }

  type SignatorySubmitResult = SubmitResult<{
    [SubmitOperation.Created]: Signatory | undefined
    [SubmitOperation.Updated]: Signatory | undefined
  }>

  const onSubmit = async (data: CreateSignatoryFormData): Promise<SignatorySubmitResult | null> => {
    return submitHandler(data, async payload => {
      const { street1, street2, city, state, zip, birthday, email, ssn, ...signatoryData } = payload

      const commonData = {
        ...signatoryData,
        birthday: formatDateToStringDate(birthday) || '',
        homeAddress: { street1, street2, city, state, zip },
      }

      if (currentSignatory) {
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
        return { operation: SubmitOperation.Updated, data: response.signatory }
      }

      if (signatories[0]?.uuid) {
        await deleteMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            signatoryUuid: signatories[0].uuid,
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
      return { operation: SubmitOperation.Created, data: response.signatory }
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const error = useHookError(submitError, fieldErrors, queryError)

  const retry = useCallback(() => {
    clearSubmitError(null)
    void refetch()
  }, [clearSubmitError, refetch])

  const data: CreateSignatoryData = {
    signatories,
    currentSignatory,
  }

  return {
    data,
    schema,
    fields,
    defaultValues,
    onSubmit,
    isLoading,
    isPending,
    error,
    retry,
  }
}
