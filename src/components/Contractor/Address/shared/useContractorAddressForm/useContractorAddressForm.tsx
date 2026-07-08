import { useMemo } from 'react'
import type { ComponentType } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Contractor, ContractorType } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorAddress } from '@gusto/embedded-api/models/components/contractoraddress'
import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddress } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import {
  createContractorAddressSchema,
  type ContractorAddressOptionalFieldsToRequire,
  type ContractorAddressFormData,
  type ContractorAddressFormOutputs,
} from './contractorAddressSchema'
import { Street1Field, Street2Field, CityField, StateField, ZipField } from './fields'
import type {
  Street1FieldProps,
  Street2FieldProps,
  CityFieldProps,
  StateFieldProps,
  ZipFieldProps,
} from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldMetadata,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { STATES_ABBR } from '@/shared/constants'

export type { ContractorAddressOptionalFieldsToRequire } from './contractorAddressSchema'

/**
 * Optional overrides passed to {@link UseContractorAddressFormReady.actions.onSubmit | onSubmit}.
 *
 * @public
 */
export interface ContractorAddressSubmitOptions {
  /** Override the contractor identifier supplied to the hook. */
  contractorId?: string
}

/**
 * Configuration options for {@link useContractorAddressForm}.
 *
 * @public
 */
export interface UseContractorAddressFormProps {
  /** UUID of the contractor whose address is being edited. */
  contractorId: string
  /** Override fields that are optional by default to be required. See `ContractorAddressOptionalFieldsToRequire`. */
  optionalFieldsToRequire?: ContractorAddressOptionalFieldsToRequire
  /** Pre-fill form values. Server data takes precedence. */
  defaultValues?: Partial<ContractorAddressFormData>
  /** Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler` so submit-time focus is coordinated across multiple forms. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Field components exposed by {@link useContractorAddressForm} on `form.Fields`.
 *
 * @public
 */
export interface ContractorAddressFormFields {
  /** Bound to `street1`. Text input for the first street address line. Required. */
  Street1: ComponentType<Street1FieldProps>
  /** Bound to `street2`. Text input for the second street address line. Optional. */
  Street2: ComponentType<Street2FieldProps>
  /** Bound to `city`. Text input for the city. Required. */
  City: ComponentType<CityFieldProps>
  /**
   * Bound to `state`. Select whose options are the standard two-letter US state
   * abbreviations. Supply `getOptionLabel` to localize the option labels. Required.
   */
  State: ComponentType<StateFieldProps>
  /**
   * Bound to `zip`. Text input for the ZIP code. Required; also validates ZIP
   * format and emits `INVALID_ZIP` when the value does not match.
   */
  Zip: ComponentType<ZipFieldProps>
}

/**
 * Ready-state shape returned by {@link useContractorAddressForm} once data has loaded.
 *
 * @remarks
 * Discriminated by `isLoading: false`. Extends {@link BaseFormHookReady} with
 * the contractor-address-specific `data`, `status`, `actions`, and `form.Fields` shape.
 *
 * @public
 */
export interface UseContractorAddressFormReady extends BaseFormHookReady<
  ContractorAddressFieldsMetadata,
  ContractorAddressFormData,
  ContractorAddressFormFields
> {
  /** Static entity data resolved from the API. */
  data: {
    /** The contractor address row loaded for update. */
    contractorAddress: ContractorAddress
    /** The full contractor entity loaded alongside the address. */
    contractor: Contractor
    /** The contractor's type — drives whether the address is labelled "home" (Individual) or "business" (Business). */
    contractorType: ContractorType | undefined
  }
  /** Reactive status flags. */
  status: { isPending: boolean; mode: 'update' }
  /** Available actions. */
  actions: {
    onSubmit: (
      options?: ContractorAddressSubmitOptions,
    ) => Promise<HookSubmitResult<ContractorAddress> | undefined>
  }
}

/** @internal */
function buildContractorAddressFieldsMetadata(
  base: Record<keyof ContractorAddressFormData, FieldMetadata>,
) {
  const stateOptions = STATES_ABBR.map(abbr => ({
    value: abbr,
    label: abbr,
  }))
  return {
    street1: base.street1,
    street2: base.street2,
    city: base.city,
    state: withOptions(base.state, stateOptions, STATES_ABBR),
    zip: base.zip,
  } satisfies FieldsMetadata
}

/**
 * Form hook for editing a contractor's address.
 *
 * @remarks
 * A contractor always has exactly one address (created with the contractor),
 * so this hook operates only in update mode and issues a PUT on submit. The
 * same address is labelled a "home" address for Individual contractors and a
 * "business" address for Business contractors; the hook exposes `contractorType`
 * so the consuming component can choose the appropriate copy.
 *
 * @param props - See {@link UseContractorAddressFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseContractorAddressFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   useContractorAddressForm,
 *   SDKFormProvider,
 *   type UseContractorAddressFormReady,
 * } from '@gusto/embedded-react-sdk'
 *
 * function ContractorAddressPage({ contractorId }: { contractorId: string }) {
 *   const contractorAddress = useContractorAddressForm({ contractorId })
 *
 *   if (contractorAddress.isLoading) return <div>Loading...</div>
 *
 *   return <ContractorAddressReady contractorAddress={contractorAddress} />
 * }
 *
 * function ContractorAddressReady({
 *   contractorAddress,
 * }: {
 *   contractorAddress: UseContractorAddressFormReady
 * }) {
 *   const { Fields } = contractorAddress.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={contractorAddress}>
 *       <form onSubmit={e => { e.preventDefault(); void contractorAddress.actions.onSubmit() }}>
 *         <Fields.Street1 label="Street address" />
 *         <Fields.Street2 label="Apt, suite, etc. (optional)" />
 *         <Fields.City label="City" />
 *         <Fields.State label="State" />
 *         <Fields.Zip label="ZIP code" />
 *         <button type="submit" disabled={contractorAddress.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useContractorAddressForm({
  contractorId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseContractorAddressFormProps): HookLoadingResult | UseContractorAddressFormReady {
  const contractorQuery = useContractorsGet(
    { contractorUuid: contractorId },
    { enabled: !!contractorId },
  )
  const addressQuery = useContractorsGetAddress(
    { contractorUuid: contractorId },
    { enabled: !!contractorId },
  )

  const contractor = contractorQuery.data?.contractor
  const contractorType = contractor?.type
  const fetchedAddress = addressQuery.data?.contractorAddress

  const [schema, metadataConfig] = useMemo(
    () => createContractorAddressSchema({ optionalFieldsToRequire }),
    [optionalFieldsToRequire],
  )

  const resolvedDefaults: ContractorAddressFormData = useMemo(
    () => ({
      street1: fetchedAddress?.street1 ?? partnerDefaults?.street1 ?? '',
      street2: fetchedAddress?.street2 ?? partnerDefaults?.street2 ?? '',
      city: fetchedAddress?.city ?? partnerDefaults?.city ?? '',
      state: fetchedAddress?.state ?? partnerDefaults?.state ?? '',
      zip: fetchedAddress?.zip ?? partnerDefaults?.zip ?? '',
    }),
    [fetchedAddress, partnerDefaults],
  )

  const formMethods = useForm<ContractorAddressFormData, unknown, ContractorAddressFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const updateAddressMutation = useContractorsUpdateAddressMutation()

  const isPending = updateAddressMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('ContractorAddressForm')

  const errorHandling = composeErrorHandler([contractorQuery, addressQuery], {
    submitError,
    setSubmitError,
  })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = buildContractorAddressFieldsMetadata(baseMetadata)

  const onSubmit = async (
    options?: ContractorAddressSubmitOptions,
  ): Promise<HookSubmitResult<ContractorAddress> | undefined> => {
    let submitResult: HookSubmitResult<ContractorAddress> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ContractorAddressFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const resolvedContractorId = options?.contractorId ?? contractorId

            if (!fetchedAddress?.version) {
              throw new SDKInternalError(
                'Cannot update contractor address: no matching address on file',
              )
            }

            const result = await updateAddressMutation.mutateAsync({
              request: {
                contractorUuid: resolvedContractorId,
                contractorAddressUpdateBody: {
                  version: fetchedAddress.version,
                  street1: payload.street1,
                  street2: payload.street2 || undefined,
                  city: payload.city,
                  state: payload.state,
                  zip: payload.zip,
                },
              },
            })

            if (!result.contractorAddress) {
              throw new SDKInternalError('Contractor address update failed')
            }

            submitResult = {
              mode: 'update',
              data: result.contractorAddress,
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

  if (!contractor || !fetchedAddress) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      contractorAddress: fetchedAddress,
      contractor,
      contractorType,
    },
    status: {
      isPending,
      mode: 'update' as const,
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Street1: Street1Field,
        Street2: Street2Field,
        City: CityField,
        State: StateField,
        Zip: ZipField,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Discriminated union returned by {@link useContractorAddressForm}.
 *
 * @public
 */
export type UseContractorAddressFormResult = HookLoadingResult | UseContractorAddressFormReady
/**
 * Type of `form.fieldsMetadata` returned by {@link useContractorAddressForm}.
 *
 * @public
 */
export type ContractorAddressFieldsMetadata = ReturnType<
  typeof buildContractorAddressFieldsMetadata
>
