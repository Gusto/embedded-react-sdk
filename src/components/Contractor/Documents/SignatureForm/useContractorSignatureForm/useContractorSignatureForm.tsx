import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Document } from '@gusto/embedded-api-v-2025-11-15/models/components/document'
import type { DocumentSigned } from '@gusto/embedded-api-v-2025-11-15/models/components/documentsigned'
import { useContractorDocumentsGet } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorDocumentsGet'
import { useContractorDocumentsGetPdf } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorDocumentsGetPdf'
import { useContractorDocumentsSignMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorDocumentsSign'
import {
  buildW9Defaults,
  buildW9FieldDescriptors,
  serializeW9Fields,
  TAX_CLASSIFICATION_OPTION_KEYS,
  LLC_CLASSIFICATION_CODES,
  LLC_CLASSIFICATION_FIELD,
  TAX_CLASSIFICATION_FIELD,
  type ContractorSignatureFormData,
  type W9FieldDescriptor,
  type W9Section,
} from './w9Fields'
import { createContractorSignatureFormSchema } from './contractorSignatureFormSchema'
import {
  AGREE_FIELD,
  buildContractorSignatureFields,
  type ContractorSignatureFields,
} from './fields'
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
}

/**
 * A section of the W-9 signing form along with the form-field names to render
 * within it, in order.
 *
 * @public
 */
export interface ContractorSignatureSection {
  /** The section identifier (e.g. `'address'`, `'tin'`). */
  section: W9Section
  /** Form-field names to render in this section, in order. */
  fieldNames: string[]
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
  ContractorSignatureFields
> {
  /** Loaded data — the document being signed and a preview PDF URL. */
  data: {
    /** The document entity fetched from the API. */
    document: Document
    /** URL to the document's PDF, or `null` when unavailable. */
    pdfUrl: string | null
    /** Ordered sections describing how to group fields when rendering. */
    sections: ContractorSignatureSection[]
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

const SECTION_ORDER: W9Section[] = [
  'classification',
  'exemptions',
  'address',
  'tin',
  'certification',
]

function buildSections(descriptors: W9FieldDescriptor[]): ContractorSignatureSection[] {
  const grouped = new Map<W9Section, string[]>()
  for (const descriptor of descriptors) {
    const names = grouped.get(descriptor.section) ?? []
    names.push(descriptor.name)
    grouped.set(descriptor.section, names)
  }
  return SECTION_ORDER.filter(section => grouped.has(section)).map(section => ({
    section,
    fieldNames: grouped.get(section)!,
  }))
}

function buildFieldsMetadata(descriptors: W9FieldDescriptor[]): FieldsMetadata {
  const metadata: FieldsMetadata = {
    [AGREE_FIELD]: { name: AGREE_FIELD, isRequired: true },
  }

  for (const descriptor of descriptors) {
    if (descriptor.name === TAX_CLASSIFICATION_FIELD) {
      metadata[descriptor.name] = {
        name: descriptor.name,
        isRequired: descriptor.isRequired,
        options: TAX_CLASSIFICATION_OPTION_KEYS.map(key => ({ value: key, label: key })),
        entries: [...TAX_CLASSIFICATION_OPTION_KEYS],
      }
      continue
    }
    if (descriptor.name === LLC_CLASSIFICATION_FIELD) {
      metadata[descriptor.name] = {
        name: descriptor.name,
        isRequired: true,
        options: LLC_CLASSIFICATION_CODES.map(code => ({ value: code, label: code })),
        entries: [...LLC_CLASSIFICATION_CODES],
      }
      continue
    }
    metadata[descriptor.name] = {
      name: descriptor.name,
      isRequired: descriptor.isRequired && !descriptor.hasRedactedValue,
      hasRedactedValue: descriptor.hasRedactedValue,
      placeholder: descriptor.placeholder,
    }
  }

  return metadata
}

/**
 * Headless hook for signing a contractor document — displays the document PDF
 * and collects the document's fields plus a typed signature and consent.
 *
 * @remarks
 * This hook implements the W-9 — the only signable contractor document the API
 * exposes today (`taxpayer_identification_form_w_9`). It applies a fixed W-9
 * layout to the fields the document returns: each field's input variant is
 * derived from its API `data_type`, the seven federal tax-classification
 * checkboxes are collapsed into a single required radio group with conditional
 * LLC-code and "Other" sub-fields, and on submit the selection is mapped back
 * to the W-9 wire format. Pre-filled values (name, address, TIN, etc.) are
 * editable inputs; the signing `date` is omitted so the API auto-fills it. A
 * document that returns no recognized W-9 fields renders as acknowledge-only
 * (`data.hasFields` is `false`). `data.sections` describes how to group
 * `form.Fields` under headings; consult `form.fieldsMetadata` for per-field
 * required flags and select/radio options.
 *
 * @param props - See {@link UseContractorSignatureFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseContractorSignatureFormReady} once loaded.
 * @public
 */
export function useContractorSignatureForm({
  documentUuid,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseContractorSignatureFormProps): UseContractorSignatureFormResult {
  const documentQuery = useContractorDocumentsGet({ documentUuid })
  // PDF failures are intentionally excluded from the page error surface; the
  // viewer degrades gracefully when the URL is unavailable.
  const pdfQuery = useContractorDocumentsGetPdf({ documentUuid })

  const document = documentQuery.data?.document

  const descriptors = useMemo(() => (document ? buildW9FieldDescriptors(document) : []), [document])
  const schema = useMemo(() => createContractorSignatureFormSchema(descriptors), [descriptors])
  const defaultValues = useMemo<ContractorSignatureFormData>(
    () => (document ? buildW9Defaults(document, descriptors) : { agree: false }),
    [document, descriptors],
  )
  const Fields = useMemo(() => buildContractorSignatureFields(descriptors), [descriptors])
  const fieldsMetadata = useMemo(() => buildFieldsMetadata(descriptors), [descriptors])
  const sections = useMemo(() => buildSections(descriptors), [descriptors])

  const formMethods = useForm<ContractorSignatureFormData, unknown, ContractorSignatureFormData>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues,
    values: defaultValues,
    resetOptions: { keepDirtyValues: true },
  })

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
        async (data: ContractorSignatureFormData) => {
          await baseSubmitHandler(data, async payload => {
            if (!document) {
              throw new SDKInternalError('Document must be loaded before signing')
            }

            const result = await signMutation.mutateAsync({
              request: {
                documentUuid,
                requestBody: {
                  fields: serializeW9Fields(document, descriptors, payload),
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
      sections,
      hasFields: descriptors.length > 0,
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
