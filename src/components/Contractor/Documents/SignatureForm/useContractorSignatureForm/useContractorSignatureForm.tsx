import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Document } from '@gusto/embedded-api-v-2025-11-15/models/components/document'
import type { DocumentSigned } from '@gusto/embedded-api-v-2025-11-15/models/components/documentsigned'
import { useContractorDocumentsGet } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorDocumentsGet'
import { useContractorDocumentsGetPdf } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorDocumentsGetPdf'
import { useContractorDocumentsSignMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorDocumentsSign'
import {
  buildW9Defaults,
  getPresentFieldNames,
  getRedactionState,
  serializeW9Fields,
  EMPTY_W9_DEFAULTS,
  TAX_CLASSIFICATION_OPTION_KEYS,
  LLC_CLASSIFICATION_CODES,
  LLC_CLASSIFICATION_OPTION,
  OTHER_CLASSIFICATION_OPTION,
  type W9RedactionState,
} from './w9Fields'
import {
  createContractorSignatureFormSchema,
  type ContractorSignatureFormData,
  type ContractorSignatureFormOutputs,
  type ContractorSignatureOptionalFieldsToRequire,
} from './contractorSignatureFormSchema'
import {
  NameField,
  TaxClassificationField,
  HomeAddressStreet1Field,
  HomeAddressCityField,
  HomeAddressStateField,
  HomeAddressZipField,
  SsnField,
  EinField,
  SignatureTextField,
  AgreeField,
  BusinessNameField,
  LlcClassificationCodeField,
  OtherTextField,
  ForeignPartnersField,
  ExemptPayeeCodeField,
  ExemptionFromFatcaField,
  HomeAddressStreet2Field,
  AccountNumberField,
  CompanyNameField,
  type ContractorSignatureFormFieldComponents,
} from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
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

/**
 * Props for {@link useContractorSignatureForm}.
 *
 * @public
 */
export interface UseContractorSignatureFormProps {
  /** UUID of the contractor document to sign. */
  documentUuid: string
  /** When validation runs. Passed through to react-hook-form; defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Defaults to `true`; set to `false` when using `composeSubmitHandler`. */
  shouldFocusError?: boolean
  /** Promote optional W-9 fields to required (e.g. `{ create: ['businessName'] }`). */
  optionalFieldsToRequire?: ContractorSignatureOptionalFieldsToRequire
}

/**
 * Ready-state shape returned by {@link useContractorSignatureForm} once the
 * document metadata has loaded.
 *
 * @public
 */
export interface UseContractorSignatureFormReady extends BaseFormHookReady<
  FieldsMetadata,
  ContractorSignatureFormData,
  ContractorSignatureFormFieldComponents
> {
  /** Loaded data — the document being signed and a downloadable PDF URL. */
  data: {
    /** The document entity fetched from the API. */
    document: Document
    /** URL to the document's PDF, or `null` when unavailable. */
    pdfUrl: string | null
    /** Whether the document carries signable fields (vs. acknowledge-only). */
    hasFields: boolean
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
    /** Validates the form and submits the signature. Resolves with the signed document on success, or `undefined` on validation or API failure. */
    onSubmit: () => Promise<HookSubmitResult<DocumentSigned> | undefined>
  }
}

/**
 * Result of {@link useContractorSignatureForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UseContractorSignatureFormResult = HookLoadingResult | UseContractorSignatureFormReady

function buildFields(
  presentFieldNames: Set<string>,
  classification: string,
): ContractorSignatureFormFieldComponents {
  return {
    // Every field is presence-gated to guard against the document API diverging
    // (dropping or renaming a field) — only `Agree` is synthesized and always on.
    Name: presentFieldNames.has('name') ? NameField : undefined,
    TaxClassification: presentFieldNames.has('taxClassification')
      ? TaxClassificationField
      : undefined,
    HomeAddressStreet1: presentFieldNames.has('homeAddressStreet1')
      ? HomeAddressStreet1Field
      : undefined,
    HomeAddressCity: presentFieldNames.has('homeAddressCity') ? HomeAddressCityField : undefined,
    HomeAddressState: presentFieldNames.has('homeAddressState') ? HomeAddressStateField : undefined,
    HomeAddressZip: presentFieldNames.has('homeAddressZip') ? HomeAddressZipField : undefined,
    Ssn: presentFieldNames.has('ssn') ? SsnField : undefined,
    Ein: presentFieldNames.has('ein') ? EinField : undefined,
    SignatureText: presentFieldNames.has('signatureText') ? SignatureTextField : undefined,
    Agree: AgreeField,
    BusinessName: presentFieldNames.has('businessName') ? BusinessNameField : undefined,
    // Revealed only while the LLC classification is selected (and the document
    // carries classification checkboxes).
    LlcClassificationCode:
      presentFieldNames.has('llcClassificationCode') && classification === LLC_CLASSIFICATION_OPTION
        ? LlcClassificationCodeField
        : undefined,
    // Revealed only while the "Other" classification is selected.
    OtherText:
      presentFieldNames.has('otherText') && classification === OTHER_CLASSIFICATION_OPTION
        ? OtherTextField
        : undefined,
    ForeignPartners: presentFieldNames.has('foreignPartners') ? ForeignPartnersField : undefined,
    ExemptPayeeCode: presentFieldNames.has('exemptPayeeCode') ? ExemptPayeeCodeField : undefined,
    ExemptionFromFatca: presentFieldNames.has('exemptionFromFatca')
      ? ExemptionFromFatcaField
      : undefined,
    HomeAddressStreet2: presentFieldNames.has('homeAddressStreet2')
      ? HomeAddressStreet2Field
      : undefined,
    AccountNumber: presentFieldNames.has('accountNumber') ? AccountNumberField : undefined,
    CompanyName: presentFieldNames.has('companyName') ? CompanyNameField : undefined,
  }
}

/**
 * Headless hook for signing a contractor document — collects the document's
 * fields plus a typed signature and consent.
 *
 * @remarks
 * This hook implements the W-9 — the only signable contractor document the API
 * exposes today (`taxpayer_identification_form_w_9`). The field surface is
 * declared statically (`form.Fields`), like the other SDK form hooks: core
 * fields are always present, while variable fields are exposed only when the API
 * returns them (otherwise `undefined`) — a presence-based safety check, so a
 * field the API drops is skipped rather than rendered as an orphan. The seven
 * federal tax-classification checkboxes are collapsed into a single required
 * radio group with conditional LLC-code and "Other" sub-fields, and on submit
 * the selection is mapped back to the W-9 wire format. Pre-filled values (name,
 * address, TIN, etc.) are editable inputs; the signing `date` is omitted so the
 * API auto-fills it. A document that returns no recognized W-9 fields renders
 * as acknowledge-only (`data.hasFields` is `false`). Consult
 * `form.fieldsMetadata` for per-field required flags and select/radio options.
 *
 * @param props - See {@link UseContractorSignatureFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseContractorSignatureFormReady} once loaded.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   useContractorSignatureForm,
 *   SDKFormProvider,
 *   type UseContractorSignatureFormReady,
 * } from '@gusto/embedded-react-sdk'
 *
 * function SignDocumentPage({ documentId }: { documentId: string }) {
 *   const signatureForm = useContractorSignatureForm({ documentId })
 *
 *   if (signatureForm.isLoading) return <div>Loading...</div>
 *
 *   return <SignDocumentReady signatureForm={signatureForm} />
 * }
 *
 * function SignDocumentReady({
 *   signatureForm,
 * }: {
 *   signatureForm: UseContractorSignatureFormReady
 * }) {
 *   const { Fields } = signatureForm.form
 *
 *   const handleSubmit = async () => {
 *     await signatureForm.actions.onSubmit()
 *   }
 *
 *   return (
 *     <SDKFormProvider {...signatureForm.form.methods}>
 *       {Fields.Name ? <Fields.Name /> : null}
 *       {Fields.SignatureText ? <Fields.SignatureText /> : null}
 *       <Fields.Agree />
 *       <button onClick={handleSubmit}>Sign</button>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useContractorSignatureForm({
  documentUuid,
  validationMode = 'onSubmit',
  shouldFocusError = true,
  optionalFieldsToRequire,
}: UseContractorSignatureFormProps): UseContractorSignatureFormResult {
  const documentQuery = useContractorDocumentsGet({ documentUuid })
  // PDF failures are intentionally excluded from the page error surface; the
  // download link is simply hidden when the URL is unavailable.
  const pdfQuery = useContractorDocumentsGetPdf({ documentUuid })

  const document = documentQuery.data?.document

  const presentFieldNames = useMemo(
    () => (document ? getPresentFieldNames(document) : new Set<string>()),
    [document],
  )
  const redaction = useMemo<W9RedactionState>(
    () => (document ? getRedactionState(document) : { ssnRedacted: false, einRedacted: false }),
    [document],
  )

  const [schema, metadataConfig] = useMemo(
    () =>
      createContractorSignatureFormSchema({
        optionalFieldsToRequire,
        ssnRedacted: redaction.ssnRedacted,
        einRedacted: redaction.einRedacted,
      }),
    [optionalFieldsToRequire, redaction.ssnRedacted, redaction.einRedacted],
  )

  const defaultValues = useMemo<ContractorSignatureFormData>(
    () => (document ? buildW9Defaults(document) : EMPTY_W9_DEFAULTS),
    [document],
  )

  const formMethods = useForm<ContractorSignatureFormData, unknown, ContractorSignatureFormOutputs>(
    {
      resolver: zodResolver(schema),
      mode: validationMode,
      shouldFocusError,
      defaultValues,
      values: defaultValues,
      resetOptions: { keepDirtyValues: true },
    },
  )

  const watchedClassification = useWatch({
    control: formMethods.control,
    name: 'taxClassification',
  })
  const Fields = useMemo(
    () => buildFields(presentFieldNames, watchedClassification),
    [presentFieldNames, watchedClassification],
  )

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)

  const fieldsMetadata = useMemo<FieldsMetadata>(() => {
    const taxClassificationOptions = TAX_CLASSIFICATION_OPTION_KEYS.map(key => ({
      value: key,
      label: key,
    }))
    const llcClassificationOptions = LLC_CLASSIFICATION_CODES.map(code => ({
      value: code,
      label: code,
    }))

    return {
      ...baseMetadata,
      taxClassification: withOptions(baseMetadata.taxClassification, taxClassificationOptions, [
        ...TAX_CLASSIFICATION_OPTION_KEYS,
      ]),
      llcClassificationCode: withOptions(
        baseMetadata.llcClassificationCode,
        llcClassificationOptions,
        [...LLC_CLASSIFICATION_CODES],
      ),
      // The masked value drives the redacted SSN/EIN placeholder. `buildFormSchema`
      // already set `hasRedactedValue` and exempted the field from required validation.
      ...(redaction.ssnPlaceholder
        ? { ssn: { ...baseMetadata.ssn, placeholder: redaction.ssnPlaceholder } }
        : {}),
      ...(redaction.einPlaceholder
        ? { ein: { ...baseMetadata.ein, placeholder: redaction.einPlaceholder } }
        : {}),
    }
  }, [baseMetadata, redaction])

  const signMutation = useContractorDocumentsSignMutation()
  const isPending = signMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('ContractorSignatureForm')

  const errorHandling = composeErrorHandler([documentQuery], { submitError, setSubmitError })

  const onSubmit = async (): Promise<HookSubmitResult<DocumentSigned> | undefined> => {
    let submitResult: HookSubmitResult<DocumentSigned> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ContractorSignatureFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            if (!document) {
              throw new SDKInternalError('Document must be loaded before signing')
            }

            const result = await signMutation.mutateAsync({
              request: {
                documentUuid,
                requestBody: {
                  fields: serializeW9Fields(document, payload, redaction),
                  agree: payload.agree,
                  // The signing IP is supplied by the partner proxy via the
                  // `x-gusto-client-ip` header; send an empty body value to
                  // match the employee/company sign flows.
                  signedByIpAddress: '',
                },
              },
            })

            const signedDocument = result.documentSigned

            if (!signedDocument) {
              throw new SDKInternalError('Contractor document signing failed')
            }

            submitResult = { mode: 'create', data: signedDocument }
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

  if (documentQuery.isLoading || !document) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: {
      document,
      pdfUrl: pdfQuery.data?.documentPdf?.documentUrl ?? null,
      hasFields: presentFieldNames.size > 0,
    },
    status: { isPending, mode: 'create' },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields,
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}
