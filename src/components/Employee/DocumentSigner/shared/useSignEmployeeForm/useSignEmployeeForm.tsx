import { useMemo, useCallback, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Form } from '@gusto/embedded-api/models/components/form'
import { useEmployeeFormsGet } from '@gusto/embedded-api/react-query/employeeFormsGet'
import { useEmployeeFormsGetPdf } from '@gusto/embedded-api/react-query/employeeFormsGetPdf'
import { useEmployeeFormsSignMutation } from '@gusto/embedded-api/react-query/employeeFormsSign'
import {
  createSignEmployeeFormSchema,
  MAX_PREPARERS,
  PREPARER_FIELDS_BY_INDEX,
  PREPARERS_BY_INDEX,
  type SignEmployeeFormData,
  type SignEmployeeFormOutputs,
} from './signEmployeeFormSchema'
import {
  SignatureField,
  ConfirmSignatureField,
  UsedPreparerField,
  Preparer1FirstName,
  Preparer1LastName,
  Preparer1Street1,
  Preparer1Street2,
  Preparer1City,
  Preparer1State,
  Preparer1Zip,
  Preparer1Signature,
  Preparer1ConfirmSignature,
  Preparer2FirstName,
  Preparer2LastName,
  Preparer2Street1,
  Preparer2Street2,
  Preparer2City,
  Preparer2State,
  Preparer2Zip,
  Preparer2Signature,
  Preparer2ConfirmSignature,
  Preparer3FirstName,
  Preparer3LastName,
  Preparer3Street1,
  Preparer3Street2,
  Preparer3City,
  Preparer3State,
  Preparer3Zip,
  Preparer3Signature,
  Preparer3ConfirmSignature,
  Preparer4FirstName,
  Preparer4LastName,
  Preparer4Street1,
  Preparer4Street2,
  Preparer4City,
  Preparer4State,
  Preparer4Zip,
  Preparer4Signature,
  Preparer4ConfirmSignature,
} from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { I9_FORM_NAME, STATES_ABBR } from '@/shared/constants'

const stateOptions = STATES_ABBR.map(abbr => ({ label: abbr, value: abbr }))

// ── Preparer field groups ──────────────────────────────────────────────

const preparer1Fields = {
  FirstName: Preparer1FirstName,
  LastName: Preparer1LastName,
  Street1: Preparer1Street1,
  Street2: Preparer1Street2,
  City: Preparer1City,
  State: Preparer1State,
  Zip: Preparer1Zip,
  Signature: Preparer1Signature,
  ConfirmSignature: Preparer1ConfirmSignature,
}

const preparer2Fields = {
  FirstName: Preparer2FirstName,
  LastName: Preparer2LastName,
  Street1: Preparer2Street1,
  Street2: Preparer2Street2,
  City: Preparer2City,
  State: Preparer2State,
  Zip: Preparer2Zip,
  Signature: Preparer2Signature,
  ConfirmSignature: Preparer2ConfirmSignature,
}

const preparer3Fields = {
  FirstName: Preparer3FirstName,
  LastName: Preparer3LastName,
  Street1: Preparer3Street1,
  Street2: Preparer3Street2,
  City: Preparer3City,
  State: Preparer3State,
  Zip: Preparer3Zip,
  Signature: Preparer3Signature,
  ConfirmSignature: Preparer3ConfirmSignature,
}

const preparer4Fields = {
  FirstName: Preparer4FirstName,
  LastName: Preparer4LastName,
  Street1: Preparer4Street1,
  Street2: Preparer4Street2,
  City: Preparer4City,
  State: Preparer4State,
  Zip: Preparer4Zip,
  Signature: Preparer4Signature,
  ConfirmSignature: Preparer4ConfirmSignature,
}

export type PreparerFieldGroup = typeof preparer1Fields

// ── Types ──────────────────────────────────────────────────────────────

export interface UseSignEmployeeFormProps {
  employeeId: string
  formId: string
}

export interface SignEmployeeFormFieldComponents {
  Signature: typeof SignatureField
  ConfirmSignature: typeof ConfirmSignatureField
  UsedPreparer: typeof UsedPreparerField | undefined
  Preparer1: PreparerFieldGroup | undefined
  Preparer2: PreparerFieldGroup | undefined
  Preparer3: PreparerFieldGroup | undefined
  Preparer4: PreparerFieldGroup | undefined
}

export interface UseSignEmployeeFormReady extends BaseFormHookReady<
  FieldsMetadata,
  SignEmployeeFormData,
  SignEmployeeFormFieldComponents
> {
  data: {
    form: Form
    pdfUrl: string | null | undefined
  }
  status: { isPending: boolean; mode: 'create' }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Form> | undefined>
    addPreparer?: () => void
    removePreparer?: () => void
  }
  form: BaseFormHookReady<
    FieldsMetadata,
    SignEmployeeFormData,
    SignEmployeeFormFieldComponents
  >['form'] & {
    preparers?: { count: number; canAdd: boolean; canRemove: boolean }
  }
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useSignEmployeeForm({
  employeeId,
  formId,
}: UseSignEmployeeFormProps): HookLoadingResult | UseSignEmployeeFormReady {
  const formQuery = useEmployeeFormsGet({ employeeId, formId })
  const pdfQuery = useEmployeeFormsGetPdf({ employeeId, formId })

  const form = formQuery.data?.form
  const pdfUrl = pdfQuery.data?.formPdf?.documentUrl
  const isI9 = form?.name === I9_FORM_NAME

  const [preparerCount, setPreparerCount] = useState(0)

  const [schema, metadataConfig] = useMemo(
    () => createSignEmployeeFormSchema({ isI9, preparerCount }),
    [isI9, preparerCount],
  )

  const formMethods = useForm<SignEmployeeFormData, unknown, SignEmployeeFormOutputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      signature: '',
      confirmSignature: false,
      usedPreparer: 'no',
    },
  })

  const { mutateAsync: signForm, isPending } = useEmployeeFormsSignMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('SignEmployeeForm')

  const queries = [formQuery, pdfQuery]
  const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)

  const fieldsMetadata = useMemo(
    () => ({
      ...baseMetadata,
      ...(isI9
        ? {
            usedPreparer: withOptions(baseMetadata.usedPreparer, [
              { label: 'No, I completed this myself', value: 'no' },
              { label: 'Yes, I used a preparer/translator', value: 'yes' },
            ]),
            preparerState: withOptions(baseMetadata.preparerState, stateOptions),
            preparer2State: withOptions(baseMetadata.preparer2State, stateOptions),
            preparer3State: withOptions(baseMetadata.preparer3State, stateOptions),
            preparer4State: withOptions(baseMetadata.preparer4State, stateOptions),
          }
        : {}),
    }),
    [baseMetadata, isI9],
  )

  const addPreparer = useCallback(() => {
    setPreparerCount(prev => Math.min(prev + 1, MAX_PREPARERS))
  }, [])

  const removePreparer = useCallback(() => {
    setPreparerCount(prev => {
      if (prev <= 0) return prev
      const preparerFields = PREPARER_FIELDS_BY_INDEX[prev - 1]
      if (!preparerFields) return prev
      for (const name of preparerFields) {
        formMethods.unregister(name)
      }
      return prev - 1
    })
  }, [formMethods.unregister])

  const usedPreparer = isI9 ? formMethods.watch('usedPreparer') : undefined

  useEffect(() => {
    if (!isI9) return
    if (usedPreparer === 'yes' && preparerCount === 0) {
      addPreparer()
    }
    if (usedPreparer === 'no' && preparerCount > 0) {
      for (let i = preparerCount; i > 0; i--) {
        removePreparer()
      }
    }
  }, [usedPreparer, isI9, preparerCount, addPreparer, removePreparer])

  const onSubmit = async (): Promise<HookSubmitResult<Form> | undefined> => {
    let submitResult: HookSubmitResult<Form> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: SignEmployeeFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const requestBody: Record<string, unknown> = {
              signatureText: payload.signature,
              agree: payload.confirmSignature,
            }

            if (isI9) {
              Object.assign(requestBody, buildPreparerPayload(payload, preparerCount))
            }

            const result = await signForm({
              request: {
                employeeId,
                formId: form!.uuid,
                requestBody: requestBody as {
                  signatureText: string
                  agree: boolean
                  signedByIpAddress: string
                },
              },
            })

            if (result.form) {
              submitResult = { mode: 'create', data: result.form }
            }
          })
          resolve()
        },
        () => {
          resolve()
        },
      )()
    })

    return submitResult
  }

  const isDataLoading = formQuery.isLoading || pdfQuery.isLoading

  if (isDataLoading || !form) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: { form, pdfUrl },
    status: { isPending, mode: 'create' as const },
    actions: {
      onSubmit,
      ...(isI9 ? { addPreparer, removePreparer } : {}),
    },
    errorHandling,
    form: {
      Fields: {
        Signature: SignatureField,
        ConfirmSignature: ConfirmSignatureField,
        UsedPreparer: isI9 ? UsedPreparerField : undefined,
        Preparer1: isI9 && preparerCount >= 1 ? preparer1Fields : undefined,
        Preparer2: isI9 && preparerCount >= 2 ? preparer2Fields : undefined,
        Preparer3: isI9 && preparerCount >= 3 ? preparer3Fields : undefined,
        Preparer4: isI9 && preparerCount >= 4 ? preparer4Fields : undefined,
      },
      fieldsMetadata,
      hookFormInternals: { formMethods },
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
      ...(isI9
        ? {
            preparers: {
              count: preparerCount,
              canAdd: preparerCount < MAX_PREPARERS,
              canRemove: preparerCount > 0,
            },
          }
        : {}),
    },
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function buildPreparerPayload(payload: SignEmployeeFormOutputs, count: number) {
  if (payload.usedPreparer !== 'yes' || count === 0) {
    return { preparer: false }
  }

  const result: Record<string, unknown> = { preparer: true }

  for (let index = 0; index < count; index++) {
    if (index > 0) {
      result[`preparer${String(index + 1)}`] = true
    }

    const preparer = PREPARERS_BY_INDEX[index]
    if (!preparer) continue

    result[preparer.firstName] = payload[preparer.firstName]
    result[preparer.lastName] = payload[preparer.lastName]
    result[preparer.street1] = payload[preparer.street1]
    if (payload[preparer.street2]) {
      result[preparer.street2] = payload[preparer.street2]
    }
    result[preparer.city] = payload[preparer.city]
    result[preparer.state] = payload[preparer.state]
    result[preparer.zip] = payload[preparer.zip]
    result[preparer.signature] = payload[preparer.signature]
    result[preparer.agree] = 'true'
  }

  return result
}

export type UseSignEmployeeFormResult = HookLoadingResult | UseSignEmployeeFormReady
export type SignEmployeeFormFieldsMetadata = UseSignEmployeeFormReady['form']['fieldsMetadata']
export type SignEmployeeFormFields = UseSignEmployeeFormReady['form']['Fields']
