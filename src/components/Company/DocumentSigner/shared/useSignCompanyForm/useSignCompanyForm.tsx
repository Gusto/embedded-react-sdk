import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Form } from '@gusto/embedded-api-v-2026-06-15/models/components/form'
import { useCompanyFormsGet } from '@gusto/embedded-api-v-2026-06-15/react-query/companyFormsGet'
import { useCompanyFormsGetPdf } from '@gusto/embedded-api-v-2026-06-15/react-query/companyFormsGetPdf'
import { useCompanyFormsSignMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/companyFormsSign'
import {
  createSignCompanyFormSchema,
  type SignCompanyFormOptionalFieldsToRequire,
  type SignCompanyFormData,
  type SignCompanyFormOutputs,
} from './signCompanyFormSchema'
import { SignatureField, ConfirmSignatureField } from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
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

/**
 * Props for {@link useSignCompanyForm}.
 *
 * @public
 */
export interface UseSignCompanyFormProps {
  /** UUID of the company form to sign. */
  formId: string
  /** Promote optional fields to required. Both fields are already required by default, so this is typically unnecessary. */
  optionalFieldsToRequire?: SignCompanyFormOptionalFieldsToRequire
  /** Pre-fill form values (for example, pre-populate the signature field). */
  defaultValues?: Partial<SignCompanyFormData>
  /** When validation runs. Passed through to react-hook-form; defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Defaults to `true`; set to `false` when using `composeSubmitHandler`. */
  shouldFocusError?: boolean
}

/**
 * Field components exposed by {@link useSignCompanyForm} on `form.Fields`.
 *
 * @public
 */
export interface SignCompanyFormFields {
  /** Text input for the signer's typed name; always required. */
  Signature: typeof SignatureField
  /** Checkbox for confirming the signature and agreeing to the form's terms; always required. */
  ConfirmSignature: typeof ConfirmSignatureField
}

/**
 * Ready-state shape returned by {@link useSignCompanyForm} once the form metadata and PDF have loaded.
 *
 * @public
 */
export interface UseSignCompanyFormReady extends BaseFormHookReady<
  FieldsMetadata,
  SignCompanyFormData,
  SignCompanyFormFields
> {
  /** Loaded data — the company form entity and a preview PDF URL. */
  data: {
    /** The company form entity fetched from the API (includes `uuid`, `title`, `description`). */
    companyForm: Form
    /** URL to the form's PDF document, or `null` when the document URL is not available. */
    pdfUrl: string | null
  }
  /** Submit-state flags. */
  status: {
    /** `true` while the sign mutation is in flight. */
    isPending: boolean
    /** Always `'create'`; the hook always submits as a signing operation. */
    mode: 'create'
  }
  /** Imperative actions exposed by the hook. */
  actions: {
    /** Validates the form and submits the signature. Resolves with the signed form on success, or `undefined` on validation or API failure. */
    onSubmit: () => Promise<HookSubmitResult<Form> | undefined>
  }
}

const HARDCODED_DEFAULTS: SignCompanyFormData = {
  signature: '',
  confirmSignature: false,
}

/**
 * Headless hook for signing a company form — displays the form PDF and collects a typed signature with confirmation checkbox.
 *
 * @remarks
 * The hook fetches the company form metadata and PDF, then exposes the
 * {@link BaseFormHookReady} contract with `Fields`, `fieldsMetadata`,
 * `onSubmit`, and error handling. Use `data.companyForm` to display the
 * form's title and description, and `data.pdfUrl` to render the document for
 * review before signing. Both `signature` and `confirmSignature` are always
 * required.
 *
 * @param props - See {@link UseSignCompanyFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseSignCompanyFormReady} once the form is loaded.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   useSignCompanyForm,
 *   SDKFormProvider,
 *   type UseSignCompanyFormReady,
 * } from '@gusto/embedded-react-sdk'
 *
 * function SignFormPage({ formId }: { formId: string }) {
 *   const signForm = useSignCompanyForm({ formId })
 *
 *   if (signForm.isLoading) return <div>Loading...</div>
 *
 *   return <SignFormReady signForm={signForm} />
 * }
 *
 * function SignFormReady({ signForm }: { signForm: UseSignCompanyFormReady }) {
 *   const { Fields } = signForm.form
 *
 *   const handleSubmit = async () => {
 *     const result = await signForm.actions.onSubmit()
 *     if (result) {
 *       console.log('Signed form:', result.data.uuid)
 *     }
 *   }
 *
 *   return (
 *     <SDKFormProvider formHookResult={signForm}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void handleSubmit()
 *         }}
 *       >
 *         <h2>{signForm.data.companyForm.title}</h2>
 *         {signForm.data.pdfUrl && (
 *           <iframe src={signForm.data.pdfUrl} title="Form document" width="100%" height="600" />
 *         )}
 *         <Fields.Signature
 *           label="Signature"
 *           description="Type your full legal name"
 *           validationMessages={{ REQUIRED: 'Signature is required' }}
 *         />
 *         <Fields.ConfirmSignature
 *           label="I agree to the terms above"
 *           validationMessages={{ REQUIRED: 'You must confirm to sign this form' }}
 *         />
 *         <button type="submit" disabled={signForm.status.isPending}>
 *           {signForm.status.isPending ? 'Signing...' : 'Sign form'}
 *         </button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
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

  const onSubmit = async (): Promise<HookSubmitResult<Form> | undefined> => {
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

  const hookFormInternals = useHookFormInternals(formMethods)

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
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Result of {@link useSignCompanyForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UseSignCompanyFormResult = HookLoadingResult | UseSignCompanyFormReady
/**
 * Shape of the `form.fieldsMetadata` object returned by {@link useSignCompanyForm}.
 *
 * @public
 */
export type SignCompanyFormFieldsMetadata = UseSignCompanyFormReady['form']['fieldsMetadata']
