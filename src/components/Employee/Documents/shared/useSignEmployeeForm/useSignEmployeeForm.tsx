import type { ComponentType, JSX } from 'react'
import { useMemo, useCallback, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Form } from '@gusto/embedded-api-v-2026-02-01/models/components/form'
import { useEmployeeFormsGet } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeFormsGet'
import { useEmployeeFormsGetPdf } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeFormsGetPdf'
import { useEmployeeFormsSignMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeFormsSign'
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
  type SignatureFieldProps,
  type ConfirmSignatureFieldProps,
  type UsedPreparerFieldProps,
  type PreparerTextFieldProps,
  type PreparerSelectFieldProps,
  type PreparerCheckboxFieldProps,
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
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldMetadata,
  FieldMetadataWithOptions,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { I9_FORM_NAME, STATES_ABBR, type StateAbbreviation } from '@/shared/constants'

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
} satisfies PreparerFieldGroup

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
} satisfies PreparerFieldGroup

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
} satisfies PreparerFieldGroup

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
} satisfies PreparerFieldGroup

/**
 * Field group exposed for each I-9 preparer/translator on {@link useSignEmployeeForm}.
 *
 * @remarks
 * Each preparer (1–4) exposes the same nine sub-fields covering name,
 * address, signature, and consent. Render the sub-fields directly on the
 * group, e.g. `<Fields.Preparer1.FirstName />`.
 *
 * @public
 */
export type PreparerFieldGroup = {
  /** Preparer's first name. */
  FirstName: (props: PreparerTextFieldProps) => JSX.Element
  /** Preparer's last name. */
  LastName: (props: PreparerTextFieldProps) => JSX.Element
  /** Preparer's street address line 1. */
  Street1: (props: PreparerTextFieldProps) => JSX.Element
  /** Preparer's street address line 2. */
  Street2: (props: PreparerTextFieldProps) => JSX.Element
  /** Preparer's city. */
  City: (props: PreparerTextFieldProps) => JSX.Element
  /** Preparer's state. */
  State: (props: PreparerSelectFieldProps) => JSX.Element
  /** Preparer's ZIP code. */
  Zip: (props: PreparerTextFieldProps) => JSX.Element
  /** Preparer's typed signature. */
  Signature: (props: PreparerTextFieldProps) => JSX.Element
  /** Preparer's electronic-signature consent checkbox. */
  ConfirmSignature: (props: PreparerCheckboxFieldProps) => JSX.Element
}

// ── Types ──────────────────────────────────────────────────────────────

/**
 * Props for {@link useSignEmployeeForm}.
 *
 * @public
 */
export interface UseSignEmployeeFormProps {
  /** The associated employee identifier. */
  employeeId: string
  /** The UUID of the employee form to sign. */
  formId: string
}

/**
 * Field components exposed by {@link useSignEmployeeForm} on `form.Fields`.
 *
 * @remarks
 * `Signature` and `ConfirmSignature` are always present. `UsedPreparer` and
 * the `Preparer1`–`Preparer4` field groups are only defined when the form
 * being signed is an I-9 and the preparer count has reached that index —
 * always null-check before rendering.
 *
 * @public
 */
export interface SignEmployeeFormFields {
  /** Bound to `signature`. Text input for the employee's typed signature; always present. */
  Signature: ComponentType<SignatureFieldProps>
  /** Bound to `confirmSignature`. Checkbox for the employee's electronic-signature consent; always present. */
  ConfirmSignature: ComponentType<ConfirmSignatureFieldProps>
  /** Bound to `usedPreparer`. Radio group asking whether a preparer/translator assisted; defined only for I-9 forms. */
  UsedPreparer: ComponentType<UsedPreparerFieldProps> | undefined
  /** First preparer field group; defined only for I-9 forms when `preparers.count >= 1`. */
  Preparer1: PreparerFieldGroup | undefined
  /** Second preparer field group; defined only for I-9 forms when `preparers.count >= 2`. */
  Preparer2: PreparerFieldGroup | undefined
  /** Third preparer field group; defined only for I-9 forms when `preparers.count >= 3`. */
  Preparer3: PreparerFieldGroup | undefined
  /** Fourth preparer field group; defined only for I-9 forms when `preparers.count >= 4`. */
  Preparer4: PreparerFieldGroup | undefined
}

/**
 * Ready-state shape returned by {@link useSignEmployeeForm} once the form metadata and PDF have loaded.
 *
 * @public
 */
export interface UseSignEmployeeFormReady extends BaseFormHookReady<
  SignEmployeeFormFieldsMetadata,
  SignEmployeeFormData,
  SignEmployeeFormFields
> {
  /** Loaded data — the form entity and a preview PDF URL. */
  data: {
    /** The employee form entity fetched from the API (includes `uuid`, `name`, `title`). */
    form: Form
    /** URL to the form's signed PDF for preview, or `undefined` while it is still being generated. */
    pdfUrl: string | null | undefined
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
    /** Validates the form and submits the signature. Resolves with the signed form on success. */
    onSubmit: () => Promise<HookSubmitResult<Form> | undefined>
    /** Adds an additional preparer/translator section (up to 4). Defined only for I-9 forms. */
    addPreparer?: () => void
    /** Removes the last preparer/translator section and unregisters its fields. Defined only for I-9 forms. */
    removePreparer?: () => void
  }
  /** Form bindings — `Fields`, `fieldsMetadata`, and I-9 preparer state. */
  form: BaseFormHookReady<
    SignEmployeeFormFieldsMetadata,
    SignEmployeeFormData,
    SignEmployeeFormFields
  >['form'] & {
    /** Preparer-section state. Defined only for I-9 forms. */
    preparers?: {
      /** Current number of preparer sections, between 0 and 4. */
      count: number
      /** `true` when fewer than 4 preparers are active. */
      canAdd: boolean
      /** `true` when at least 1 preparer is active. */
      canRemove: boolean
    }
  }
}

/**
 * Field metadata for a standard (non-I-9) employee form — only the signature and
 * its confirmation are collected.
 *
 * @remarks
 * This is the {@link SignEmployeeFormFieldsMetadata} variant returned when the
 * form being signed is not an I-9. Every entry is a plain {@link FieldMetadata}.
 *
 * @public
 * @interface
 */
export type SignEmployeeBaseFieldsMetadata = {
  /** The typed-signature field. */
  signature: FieldMetadata
  /** The signature-confirmation field. */
  confirmSignature: FieldMetadata
}

/**
 * Field metadata for an I-9 employee form, which additionally collects
 * preparer/translator certification for up to four preparers.
 *
 * @remarks
 * A superset of {@link SignEmployeeBaseFieldsMetadata}. `usedPreparer` is a
 * yes/no radio and each `preparer{N}State` is a US-state select
 * ({@link StateAbbreviation}); every other preparer field is a plain text
 * {@link FieldMetadata}. Preparer entries beyond the active preparer count are
 * still typed here but only populated once that preparer section is added.
 *
 * @public
 * @interface
 */
export type SignEmployeeI9FieldsMetadata = Omit<
  Record<keyof SignEmployeeFormData, FieldMetadata>,
  'usedPreparer' | 'preparerState' | 'preparer2State' | 'preparer3State' | 'preparer4State'
> & {
  /** Yes/no radio: whether a preparer or translator assisted with the form. */
  usedPreparer: FieldMetadataWithOptions<boolean>
  /** US-state select for the first preparer's address. */
  preparerState: FieldMetadataWithOptions<StateAbbreviation>
  /** US-state select for the second preparer's address. */
  preparer2State: FieldMetadataWithOptions<StateAbbreviation>
  /** US-state select for the third preparer's address. */
  preparer3State: FieldMetadataWithOptions<StateAbbreviation>
  /** US-state select for the fourth preparer's address. */
  preparer4State: FieldMetadataWithOptions<StateAbbreviation>
}

/**
 * Shape of the `form.fieldsMetadata` object returned by {@link useSignEmployeeForm}.
 *
 * @remarks
 * A discriminated union keyed on whether the form is an I-9. Narrow with an `in`
 * check on a preparer field before reading the I-9 entries:
 *
 * ```ts
 * const { fieldsMetadata } = form
 * if ('usedPreparer' in fieldsMetadata) {
 *   // fieldsMetadata is SignEmployeeI9FieldsMetadata
 *   fieldsMetadata.preparerState.options
 * }
 * ```
 *
 * @public
 */
export type SignEmployeeFormFieldsMetadata =
  SignEmployeeBaseFieldsMetadata | SignEmployeeI9FieldsMetadata

function buildSignEmployeeFieldsMetadata(
  baseMetadata: Record<keyof SignEmployeeFormData, FieldMetadata>,
  isI9: boolean,
): SignEmployeeFormFieldsMetadata {
  if (!isI9) {
    return baseMetadata
  }

  return {
    ...baseMetadata,
    usedPreparer: withOptions(baseMetadata.usedPreparer, [
      { label: 'No, I completed this myself', value: 'no' },
      { label: 'Yes, I used a preparer/translator', value: 'yes' },
    ]),
    preparerState: withOptions(baseMetadata.preparerState, stateOptions, STATES_ABBR),
    preparer2State: withOptions(baseMetadata.preparer2State, stateOptions, STATES_ABBR),
    preparer3State: withOptions(baseMetadata.preparer3State, stateOptions, STATES_ABBR),
    preparer4State: withOptions(baseMetadata.preparer4State, stateOptions, STATES_ABBR),
  }
}
// ── Hook ───────────────────────────────────────────────────────────────

/**
 * Headless hook for signing an employee form — captures a typed signature, electronic consent, and (for I-9 forms) preparer/translator certification.
 *
 * @remarks
 * The hook fetches the form metadata and PDF, then exposes the
 * {@link BaseFormHookReady} contract with `Fields`, `fieldsMetadata`,
 * `onSubmit`, and error handling. The hook inspects the form's `name` to
 * detect I-9 forms; when the form is an I-9, `Fields.UsedPreparer` and the
 * `Fields.Preparer1`–`Preparer4` field groups become defined, along with
 * `actions.addPreparer` / `actions.removePreparer` and `form.preparers`
 * state. Selecting `usedPreparer: 'yes'` automatically reveals the first
 * preparer section; switching back to `'no'` removes all preparer sections
 * and unregisters their fields.
 *
 * Unlike the CRUD-oriented form hooks (`useEmployeeDetailsForm`,
 * `useCompensationForm`, `useWorkAddressForm`), this hook does not accept
 * `defaultValues`, `requiredFields`, or `validationMode` — the form shape is
 * fixed and all fields except preparer street-2 are required.
 *
 * @param props - See {@link UseSignEmployeeFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseSignEmployeeFormReady} once the form is loaded.
 * @public
 *
 * @example
 * ```tsx
 * import { useSignEmployeeForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function SignFormPage({ employeeId, formId }: { employeeId: string; formId: string }) {
 *   const signForm = useSignEmployeeForm({ employeeId, formId })
 *
 *   if (signForm.isLoading) return <div>Loading...</div>
 *
 *   const { Fields } = signForm.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={signForm}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void signForm.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.Signature
 *           label="Signature"
 *           description="Type your full, legal name."
 *           validationMessages={{ REQUIRED: 'Signature is required' }}
 *         />
 *         <Fields.ConfirmSignature
 *           label="I agree to sign electronically"
 *           validationMessages={{ REQUIRED: 'You must agree to sign electronically' }}
 *         />
 *         <button type="submit" disabled={signForm.status.isPending}>
 *           Sign form
 *         </button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
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

  // The signed PDF is a preview convenience: `pdfUrl` is optional and both the
  // viewer and the download link already degrade gracefully when it's absent.
  // A failed — or not-yet-ready — PDF fetch must NOT surface as a page-level
  // signing error. In particular the global post-mutation invalidation forces a
  // `getPdf` refetch the instant a sign succeeds, which races backend generation
  // of the signed PDF; surfacing that transient failure as "there was a problem
  // with your submission" is misleading when the signature actually went through
  // (SDK-947). Only the form query feeds the error surface.
  const queries = [formQuery]
  const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)

  const fieldsMetadata = useMemo(
    () => buildSignEmployeeFieldsMetadata(baseMetadata, isI9),
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

  const hookFormInternals = useHookFormInternals(formMethods)

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
      hookFormInternals,
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

/**
 * Result of {@link useSignEmployeeForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UseSignEmployeeFormResult = HookLoadingResult | UseSignEmployeeFormReady
