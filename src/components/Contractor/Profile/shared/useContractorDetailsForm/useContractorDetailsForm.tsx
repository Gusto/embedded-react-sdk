import { useMemo } from 'react'
import type { ComponentType } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorCreateRequestBody } from '@gusto/embedded-api/models/components/contractorcreaterequestbody'
import type { ContractorUpdateRequestBody } from '@gusto/embedded-api/models/components/contractorupdaterequestbody'
import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsCreateMutation } from '@gusto/embedded-api/react-query/contractorsCreate'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import {
  ContractorType,
  WageType,
  createContractorDetailsSchema,
  type ContractorDetailsOptionalFieldsToRequire,
  type ContractorDetailsFormData,
  type ContractorDetailsFormOutputs,
} from './contractorDetailsSchema'
import {
  TypeField,
  WageTypeField,
  StartDateField,
  HourlyRateField,
  SelfOnboardingField,
  FileNewHireReportField,
  EmailField,
  FirstNameField,
  LastNameField,
  MiddleInitialField,
  BusinessNameField,
  SsnField,
  EinField,
  WorkStateField,
} from './fields'
import type {
  TypeFieldProps,
  WageTypeFieldProps,
  StartDateFieldProps,
  HourlyRateFieldProps,
  SelfOnboardingFieldProps,
  FileNewHireReportFieldProps,
  EmailFieldProps,
  FirstNameFieldProps,
  LastNameFieldProps,
  MiddleInitialFieldProps,
  BusinessNameFieldProps,
  SsnFieldProps,
  EinFieldProps,
  WorkStateFieldProps,
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
import {
  ContractorSelfOnboardingStatuses,
  ContractorOnboardingStatus,
  STATES_ABBR,
} from '@/shared/constants'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { removeNonDigits } from '@/helpers/formattedStrings'

export type { ContractorDetailsOptionalFieldsToRequire } from './contractorDetailsSchema'

/**
 * Optional overrides passed to {@link UseContractorDetailsFormReady.actions.onSubmit | onSubmit}.
 *
 * @public
 */
export interface ContractorDetailsSubmitOptions {
  /** Override the company identifier supplied to the hook (e.g. after creating the company in the same flow). Only used in create mode. */
  companyId?: string
}

/**
 * Shared options merged into both branches of {@link UseContractorDetailsFormProps}.
 *
 * @public
 */
export type UseContractorDetailsFormSharedProps = {
  /** Whether to expose the self-onboarding toggle as `form.Fields.SelfOnboarding`. Defaults to `true`. */
  withSelfOnboardingField?: boolean
  /** Fields that are optional by default but should be promoted to required for this form instance. */
  optionalFieldsToRequire?: ContractorDetailsOptionalFieldsToRequire
  /** Initial values applied before any contractor data loads. */
  defaultValues?: Partial<ContractorDetailsFormData>
  /** When validation runs. Forwarded to react-hook-form's `mode`. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Whether react-hook-form should focus the first error on validation failure. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Options for {@link useContractorDetailsForm}.
 *
 * @remarks
 * Discriminated by mode: in create mode supply `companyId` and omit
 * `contractorId`; in update mode supply `contractorId` (and optionally
 * `companyId`).
 *
 * @public
 */
export type UseContractorDetailsFormProps =
  | (UseContractorDetailsFormSharedProps & { companyId: string; contractorId?: never })
  | (UseContractorDetailsFormSharedProps & { contractorId: string; companyId?: string })

/**
 * The Field components exposed by {@link useContractorDetailsForm} as `form.Fields`.
 *
 * @remarks
 * Conditionally-visible fields are `undefined` when they do not apply to the
 * current `type`, `wageType`, or self-onboarding selection. Always null-check
 * before rendering.
 *
 * @public
 */
export interface ContractorDetailsFormFields {
  /** Radio group bound to `type`. Always available. */
  Type: ComponentType<TypeFieldProps>
  /** Radio group bound to `wageType`. Always available. */
  WageType: ComponentType<WageTypeFieldProps>
  /** Date picker bound to `startDate`. Always available. */
  StartDate: ComponentType<StartDateFieldProps>
  /** Number input bound to `hourlyRate`; available only when `wageType` is `Hourly`. */
  HourlyRate: ComponentType<HourlyRateFieldProps> | undefined
  /** Switch bound to `selfOnboarding`; available only when toggleable. */
  SelfOnboarding: ComponentType<SelfOnboardingFieldProps> | undefined
  /** Switch bound to `fileNewHireReport`; available only for individual contractors. */
  FileNewHireReport: ComponentType<FileNewHireReportFieldProps> | undefined
  /** Text input bound to `email`; available only when self-onboarding is enabled. */
  Email: ComponentType<EmailFieldProps> | undefined
  /** Text input bound to `firstName`; available only for individual contractors. */
  FirstName: ComponentType<FirstNameFieldProps> | undefined
  /** Text input bound to `lastName`; available only for individual contractors. */
  LastName: ComponentType<LastNameFieldProps> | undefined
  /** Text input bound to `middleInitial`; available only for individual contractors. */
  MiddleInitial: ComponentType<MiddleInitialFieldProps> | undefined
  /** Text input bound to `businessName`; available only for business contractors. */
  BusinessName: ComponentType<BusinessNameFieldProps> | undefined
  /**
   * Text input bound to `ssn`; available only for individual contractors.
   * Auto-formats as `XXX-XX-XXXX`. When an SSN is already on file the field
   * shows a masked placeholder and the required rule is waived.
   */
  Ssn: ComponentType<SsnFieldProps> | undefined
  /**
   * Text input bound to `ein`; available only for business contractors.
   * Auto-formats as `XX-XXXXXXX`. When an EIN is already on file the field
   * shows a masked placeholder and the required rule is waived.
   */
  Ein: ComponentType<EinFieldProps> | undefined
  /** Select bound to `workState`; available only for individual contractors filing a new-hire report. */
  WorkState: ComponentType<WorkStateFieldProps> | undefined
}

/**
 * The ready-state result returned by {@link useContractorDetailsForm} once data has loaded.
 *
 * @public
 */
export interface UseContractorDetailsFormReady extends BaseFormHookReady<
  ContractorDetailsFieldsMetadata,
  ContractorDetailsFormData,
  ContractorDetailsFormFields
> {
  /** The loaded contractor data, or `null` in create mode. */
  data: {
    /** The contractor being edited, or `null` in create mode. */
    contractor: Contractor | null
  }
  /** Submit status and form mode. */
  status: {
    /** `true` while the create or update mutation is in flight. */
    isPending: boolean
    /** `'create'` when no `contractorId` was supplied, `'update'` otherwise. */
    mode: 'create' | 'update'
  }
  /** Submit and related actions. */
  actions: {
    /** Validates the form and submits the changes. Returns the created or updated contractor, or `undefined` when validation fails. */
    onSubmit: (
      options?: ContractorDetailsSubmitOptions,
    ) => Promise<HookSubmitResult<Contractor> | undefined>
  }
}

const isCurrentlySelfOnboarding = (contractor?: Contractor) =>
  !!contractor?.onboardingStatus &&
  ContractorSelfOnboardingStatuses.has(contractor.onboardingStatus)

const canToggleSelfOnboarding = (contractor?: Contractor) => {
  if (!contractor) return true
  return (
    contractor.onboardingStatus === ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
    contractor.onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_NOT_INVITED
  )
}

/** @internal */
function buildContractorDetailsFieldsMetadata(
  base: Record<keyof ContractorDetailsFormData, FieldMetadata>,
) {
  const typeEntries = [ContractorType.Individual, ContractorType.Business]
  const wageTypeEntries = [WageType.Hourly, WageType.Fixed]
  return {
    type: withOptions(
      base.type,
      typeEntries.map(value => ({ value, label: value })),
      typeEntries,
    ),
    wageType: withOptions(
      base.wageType,
      wageTypeEntries.map(value => ({ value, label: value })),
      wageTypeEntries,
    ),
    startDate: base.startDate,
    hourlyRate: base.hourlyRate,
    selfOnboarding: base.selfOnboarding,
    fileNewHireReport: base.fileNewHireReport,
    email: base.email,
    firstName: base.firstName,
    lastName: base.lastName,
    middleInitial: base.middleInitial,
    businessName: base.businessName,
    ssn: base.ssn,
    ein: base.ein,
    workState: withOptions(
      base.workState,
      STATES_ABBR.map(abbr => ({ value: abbr, label: abbr })),
      STATES_ABBR,
    ),
  } satisfies FieldsMetadata
}

/**
 * Headless hook for creating or updating a contractor's profile details —
 * individual vs. business type, wage type, names, SSN/EIN, work state, and the
 * self-onboarding preference.
 *
 * @remarks
 * Returns a discriminated union: a loading variant while the contractor fetch
 * resolves, and a ready variant exposing the form's data, pending status,
 * submit action, error handling, and bound `Fields`. Field visibility is
 * driven by the current `type` and `wageType` (self-onboarding only toggles the
 * `Email` field); fields that do not apply are `undefined` on `form.Fields`.
 * SSN/EIN are exposed by contractor type regardless of self-onboarding — each
 * consumer decides whether to render them. Self-onboarding is only toggleable
 * when the contractor's onboarding status allows it.
 *
 * @param input - See {@link UseContractorDetailsFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseContractorDetailsFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   useContractorDetailsForm,
 *   SDKFormProvider,
 *   type UseContractorDetailsFormReady,
 * } from '@gusto/embedded-react-sdk'
 *
 * function ContractorDetailsPage({
 *   companyId,
 *   contractorId,
 * }: {
 *   companyId: string
 *   contractorId: string
 * }) {
 *   const contractorDetails = useContractorDetailsForm({ companyId, contractorId })
 *
 *   if (contractorDetails.isLoading) return <div>Loading...</div>
 *
 *   return <ContractorDetailsReady contractorDetails={contractorDetails} />
 * }
 *
 * function ContractorDetailsReady({
 *   contractorDetails,
 * }: {
 *   contractorDetails: UseContractorDetailsFormReady
 * }) {
 *   const { Fields } = contractorDetails.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={contractorDetails}>
 *       <form onSubmit={e => { e.preventDefault(); void contractorDetails.actions.onSubmit() }}>
 *         <Fields.Type label="Contractor type" />
 *         <Fields.WageType label="Wage type" />
 *         {Fields.FirstName && <Fields.FirstName label="First name" />}
 *         {Fields.LastName && <Fields.LastName label="Last name" />}
 *         {Fields.BusinessName && <Fields.BusinessName label="Business name" />}
 *         <Fields.StartDate label="Start date" />
 *         <button type="submit" disabled={contractorDetails.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useContractorDetailsForm({
  companyId,
  contractorId,
  withSelfOnboardingField = true,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseContractorDetailsFormProps): HookLoadingResult | UseContractorDetailsFormReady {
  const contractorQuery = useContractorsGet(
    { contractorUuid: contractorId ?? '' },
    { enabled: !!contractorId },
  )

  const contractor = contractorQuery.data?.contractor

  const isCreateMode = !contractorId
  const isSelfOnboardingToggleable = canToggleSelfOnboarding(contractor)

  const mode = isCreateMode ? 'create' : 'update'
  const hasSsn = contractor?.hasSsn ?? false
  const hasEin = contractor?.hasEin ?? false

  const [schema, metadataConfig] = useMemo(
    () => createContractorDetailsSchema({ mode, optionalFieldsToRequire, hasSsn, hasEin }),
    [mode, optionalFieldsToRequire, hasSsn, hasEin],
  )

  const parsedHourlyRate =
    contractor?.hourlyRate != null ? parseFloat(contractor.hourlyRate) : undefined

  const resolvedDefaults: ContractorDetailsFormData = useMemo(
    () => ({
      type: contractor?.type ?? partnerDefaults?.type ?? ContractorType.Individual,
      wageType: contractor?.wageType ?? partnerDefaults?.wageType ?? WageType.Fixed,
      startDate:
        contractor?.startDate ??
        partnerDefaults?.startDate ??
        new Date().toISOString().split('T')[0]!,
      hourlyRate: parsedHourlyRate ?? partnerDefaults?.hourlyRate ?? NaN,
      selfOnboarding: partnerDefaults?.selfOnboarding ?? isCurrentlySelfOnboarding(contractor),
      fileNewHireReport:
        contractor?.fileNewHireReport ?? partnerDefaults?.fileNewHireReport ?? false,
      email: contractor?.email ?? partnerDefaults?.email ?? '',
      firstName: contractor?.firstName ?? partnerDefaults?.firstName ?? '',
      lastName: contractor?.lastName ?? partnerDefaults?.lastName ?? '',
      middleInitial: contractor?.middleInitial ?? partnerDefaults?.middleInitial ?? '',
      businessName: contractor?.businessName ?? partnerDefaults?.businessName ?? '',
      workState: contractor?.workState ?? partnerDefaults?.workState ?? '',
      ssn: partnerDefaults?.ssn ?? '',
      ein: partnerDefaults?.ein ?? '',
    }),
    [contractor, partnerDefaults, parsedHourlyRate],
  )

  const formMethods = useForm<ContractorDetailsFormData, unknown, ContractorDetailsFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const [watchedType, watchedWageType, watchedSelfOnboarding, watchedFileNewHireReport] = useWatch({
    control: formMethods.control,
    name: ['type', 'wageType', 'selfOnboarding', 'fileNewHireReport'],
  })

  // Render-gating: a field shows when it applies to the current selection. The
  // schema mirrors this via `getExcludedContractorFields` so off-screen fields
  // never trip a phantom required error.
  const isIndividual = watchedType === ContractorType.Individual
  const isBusiness = watchedType === ContractorType.Business
  const isHourly = watchedWageType === WageType.Hourly

  const createContractorMutation = useContractorsCreateMutation()
  const updateContractorMutation = useContractorsUpdateMutation()

  const isPending = createContractorMutation.isPending || updateContractorMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('ContractorDetailsForm')

  const queries = contractorId ? [contractorQuery] : []
  const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = buildContractorDetailsFieldsMetadata(baseMetadata)

  const onSubmit = async (
    options?: ContractorDetailsSubmitOptions,
  ): Promise<HookSubmitResult<Contractor> | undefined> => {
    let submitResult: HookSubmitResult<Contractor> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ContractorDetailsFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const selfOnboardingEnabled = payload.selfOnboarding
            const cleanedSsn = payload.ssn ? removeNonDigits(payload.ssn) : ''
            const cleanedEin = payload.ein ? removeNonDigits(payload.ein) : ''

            const requestBody: ContractorCreateRequestBody = {
              type: payload.type,
              wageType: payload.wageType,
              startDate: payload.startDate,
              selfOnboarding: selfOnboardingEnabled,
              email: selfOnboardingEnabled ? payload.email || undefined : undefined,
              hourlyRate:
                payload.wageType === WageType.Hourly ? String(payload.hourlyRate) : undefined,
              ...(payload.type === ContractorType.Individual
                ? {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    middleInitial: payload.middleInitial || undefined,
                    fileNewHireReport: payload.fileNewHireReport,
                    workState: payload.fileNewHireReport
                      ? payload.workState || undefined
                      : undefined,
                    ssn: cleanedSsn || undefined,
                  }
                : {
                    fileNewHireReport: false,
                    businessName: payload.businessName,
                    ein: cleanedEin || undefined,
                  }),
            }

            let savedContractor: Contractor

            if (isCreateMode) {
              const resolvedCompanyId = options?.companyId ?? companyId
              if (!resolvedCompanyId) {
                throw new SDKInternalError('companyId is required to create a contractor')
              }

              const result = await createContractorMutation.mutateAsync({
                request: {
                  companyUuid: resolvedCompanyId,
                  contractorCreateRequestBody: { ...requestBody, isActive: true },
                },
              })

              if (!result.contractor) {
                throw new SDKInternalError('Contractor creation failed')
              }

              savedContractor = result.contractor
            } else {
              if (!contractor?.version) {
                throw new SDKInternalError('Contractor version is required for updates')
              }

              const updateBody: ContractorUpdateRequestBody = {
                ...requestBody,
                version: contractor.version,
              }

              const result = await updateContractorMutation.mutateAsync({
                request: {
                  contractorUuid: contractor.uuid,
                  contractorUpdateRequestBody: updateBody,
                },
              })

              if (!result.contractor) {
                throw new SDKInternalError('Contractor update failed')
              }

              savedContractor = result.contractor
            }

            submitResult = {
              mode: isCreateMode ? 'create' : 'update',
              data: savedContractor,
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

  const isDataLoading = contractorId ? contractorQuery.isLoading : false

  if (isDataLoading || (contractorId && !contractor)) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      contractor: contractor ?? null,
    },
    status: {
      isPending,
      mode: isCreateMode ? ('create' as const) : ('update' as const),
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Type: TypeField,
        WageType: WageTypeField,
        StartDate: StartDateField,
        HourlyRate: isHourly ? HourlyRateField : undefined,
        SelfOnboarding:
          withSelfOnboardingField && isSelfOnboardingToggleable ? SelfOnboardingField : undefined,
        FileNewHireReport: isIndividual ? FileNewHireReportField : undefined,
        Email: watchedSelfOnboarding ? EmailField : undefined,
        FirstName: isIndividual ? FirstNameField : undefined,
        LastName: isIndividual ? LastNameField : undefined,
        MiddleInitial: isIndividual ? MiddleInitialField : undefined,
        BusinessName: isBusiness ? BusinessNameField : undefined,
        Ssn: isIndividual ? SsnField : undefined,
        Ein: isBusiness ? EinField : undefined,
        WorkState: isIndividual && watchedFileNewHireReport ? WorkStateField : undefined,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Return type of {@link useContractorDetailsForm}.
 *
 * @public
 */
export type UseContractorDetailsFormResult = HookLoadingResult | UseContractorDetailsFormReady

/**
 * Shape of `form.fieldsMetadata` returned by {@link useContractorDetailsForm}.
 *
 * @public
 */
export type ContractorDetailsFieldsMetadata = ReturnType<
  typeof buildContractorDetailsFieldsMetadata
>
