import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Form } from '@gusto/embedded-api/models/components/form'
import { useCompanyFormsGet } from '@gusto/embedded-api/react-query/companyFormsGet'
import { useCompanyFormsGetPdf } from '@gusto/embedded-api/react-query/companyFormsGetPdf'
import { useCompanyFormsSignMutation } from '@gusto/embedded-api/react-query/companyFormsSign'
import {
  createSignCompanyFormSchema,
  type SignCompanyFormOptionalFieldsToRequire,
  type SignCompanyFormData,
  type SignCompanyFormOutputs,
} from './signCompanyFormSchema'
import { SignatureField, ConfirmSignatureField } from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'

export type { SignCompanyFormOptionalFieldsToRequire } from './signCompanyFormSchema'

export interface SignCompanyFormSubmitCallbacks {
  onFormSigned?: (form: Form) => void
}

export interface UseSignCompanyFormProps {
  formId: string
  optionalFieldsToRequire?: SignCompanyFormOptionalFieldsToRequire
  defaultValues?: Partial<SignCompanyFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export interface SignCompanyFormFields {
  Signature: typeof SignatureField
  ConfirmSignature: typeof ConfirmSignatureField
}

export interface UseSignCompanyFormReady extends BaseFormHookReady<
  FieldsMetadata,
  SignCompanyFormData,
  SignCompanyFormFields
> {
  data: {
    companyForm: Form
    pdfUrl: string | null
  }
  status: { isPending: boolean; mode: 'create' }
  actions: {
    onSubmit: (
      callbacks?: SignCompanyFormSubmitCallbacks,
    ) => Promise<HookSubmitResult<Form> | undefined>
  }
}

const HARDCODED_DEFAULTS: SignCompanyFormData = {
  signature: '',
  confirmSignature: false,
}

export function useSignCompanyForm({
  formId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseSignCompanyFormProps): HookLoadingResult | UseSignCompanyFormReady {
  const formQuery = useCompanyFormsGet({ formId })
  const pdfQuery = useCompanyFormsGetPdf({ formId })

  const companyForm = formQuery.data?.form
  const formPdf = pdfQuery.data?.formPdf

  const [schema, metadataConfig] = useMemo(
    () => createSignCompanyFormSchema({ optionalFieldsToRequire }),
    [optionalFieldsToRequire],
  )

  const resolvedDefaults: SignCompanyFormData = {
    signature: partnerDefaults?.signature ?? HARDCODED_DEFAULTS.signature,
    confirmSignature: partnerDefaults?.confirmSignature ?? HARDCODED_DEFAULTS.confirmSignature,
  }

  const formMethods = useForm<SignCompanyFormData, unknown, SignCompanyFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const signFormMutation = useCompanyFormsSignMutation()
  const isPending = signFormMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('SignCompanyForm')

  const queries = [formQuery, pdfQuery]
  const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    signature: baseMetadata.signature,
    confirmSignature: baseMetadata.confirmSignature,
  }

  const onSubmit = async (
    callbacks?: SignCompanyFormSubmitCallbacks,
  ): Promise<HookSubmitResult<Form> | undefined> => {
    let submitResult: HookSubmitResult<Form> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: SignCompanyFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            if (!formId) {
              throw new SDKInternalError('formId is required to sign a company form')
            }

            const result = await signFormMutation.mutateAsync({
              request: {
                formId,
                requestBody: {
                  signatureText: payload.signature,
                  agree: payload.confirmSignature,
                  signedByIpAddress: '',
                },
              },
            })

            const signedForm = result.form

            if (!signedForm) {
              throw new SDKInternalError('Company form signing failed')
            }

            callbacks?.onFormSigned?.(signedForm)

            submitResult = {
              mode: 'create',
              data: signedForm,
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

  if (isDataLoading || !companyForm || !formPdf) {
    return { isLoading: true as const, errorHandling }
  }

  const pdfUrl = formPdf.documentUrl ?? null

  return {
    isLoading: false as const,
    data: {
      companyForm,
      pdfUrl,
    },
    status: {
      isPending,
      mode: 'create' as const,
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Signature: SignatureField,
        ConfirmSignature: ConfirmSignatureField,
      },
      fieldsMetadata,
      hookFormInternals: { formMethods },
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UseSignCompanyFormResult = HookLoadingResult | UseSignCompanyFormReady
export type SignCompanyFormFieldsMetadata = UseSignCompanyFormReady['form']['fieldsMetadata']
