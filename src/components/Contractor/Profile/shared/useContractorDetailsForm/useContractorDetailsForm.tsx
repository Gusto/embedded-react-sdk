import { useCallback, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Resolver, UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Contractor } from '@gusto/embedded-api-v-2025-11-15/models/components/contractor'
import type { ContractorCreateRequestBody } from '@gusto/embedded-api-v-2025-11-15/models/components/contractorcreaterequestbody'
import type { ContractorUpdateRequestBody } from '@gusto/embedded-api-v-2025-11-15/models/components/contractorupdaterequestbody'
import { useContractorsGet } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsGet'
import { useContractorsCreateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsCreate'
import { useContractorsUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsUpdate'
import {
  ContractorType,
  WageType,
  createContractorDetailsSchema,
  deriveContractorApplicability,
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
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
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
export interface ContractorDetailsFields {
  /** Radio group bound to `type`. Always available. */
  Type: typeof TypeField
  /** Radio group bound to `wageType`. Always available. */
  WageType: typeof WageTypeField
  /** Date picker bound to `startDate`. Always available. */
  StartDate: typeof StartDateField
  /** Number input bound to `hourlyRate`; available only when `wageType` is `Hourly`. */
  HourlyRate: typeof HourlyRateField | undefined
  /** Switch bound to `selfOnboarding`; available only when toggleable. */
  SelfOnboarding: typeof SelfOnboardingField | undefined
  /** Switch bound to `fileNewHireReport`; available only for individual contractors. */
  FileNewHireReport: typeof FileNewHireReportField | undefined
  /** Text input bound to `email`; available only when self-onboarding is enabled. */
  Email: typeof EmailField | undefined
  /** Text input bound to `firstName`; available only for individual contractors. */
  FirstName: typeof FirstNameField | undefined
  /** Text input bound to `lastName`; available only for individual contractors. */
  LastName: typeof LastNameField | undefined
  /** Text input bound to `middleInitial`; available only for individual contractors. */
  MiddleInitial: typeof MiddleInitialField | undefined
  /** Text input bound to `businessName`; available only for business contractors. */
  BusinessName: typeof BusinessNameField | undefined
  /** Text input bound to `ssn`; available only for individual contractors who are not self-onboarding. */
  Ssn: typeof SsnField | undefined
  /** Text input bound to `ein`; available only for business contractors who are not self-onboarding. */
  Ein: typeof EinField | undefined
  /** Select bound to `workState`; available only for individual contractors filing a new-hire report. */
  WorkState: typeof WorkStateField | undefined
}

/**
 * The ready-state result returned by {@link useContractorDetailsForm} once data has loaded.
 *
 * @public
 */
export interface UseContractorDetailsFormReady extends BaseFormHookReady<
  FieldsMetadata,
  ContractorDetailsFormData,
  ContractorDetailsFields
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
  (ContractorSelfOnboardingStatuses as Set<string>).has(contractor.onboardingStatus)

const canToggleSelfOnboarding = (contractor?: Contractor) => {
  if (!contractor) return true
  return (
    contractor.onboardingStatus === ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
    contractor.onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_NOT_INVITED
  )
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
 * driven by the current `type`, `wageType`, and self-onboarding selection;
 * fields that do not apply are `undefined` on `form.Fields`. Self-onboarding
 * is only toggleable when the contractor's onboarding status allows it.
 *
 * @param input - See {@link UseContractorDetailsFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseContractorDetailsFormReady} once ready.
 * @public
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

  // Validation derives applicability from the values under validation, so the
  // resolver builds the right schema without depending on `useWatch` (which is
  // only available after `useForm`). This breaks the useForm/useWatch cycle.
  const resolver = useCallback<
    Resolver<ContractorDetailsFormData, unknown, ContractorDetailsFormOutputs>
  >(
    (values, context, options) => {
      const { excludeFields } = deriveContractorApplicability(values)
      const [schema] = createContractorDetailsSchema({
        mode,
        optionalFieldsToRequire,
        hasSsn,
        hasEin,
        excludeFields,
      })
      return zodResolver(schema)(values, context, options)
    },
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
    resolver,
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

  const applicability = useMemo(
    () =>
      deriveContractorApplicability({
        type: watchedType,
        wageType: watchedWageType,
        selfOnboarding: watchedSelfOnboarding,
        fileNewHireReport: watchedFileNewHireReport,
      }),
    [watchedType, watchedWageType, watchedSelfOnboarding, watchedFileNewHireReport],
  )

  const { isIndividual, isBusiness, isHourly, showEmail, showSsn, showEin, showWorkState } =
    applicability

  // Built from the watched applicability for metadata + getFormSubmissionValues;
  // the resolver builds its own per-validation schema from the submitted values.
  const [schema, metadataConfig] = useMemo(
    () =>
      createContractorDetailsSchema({
        mode,
        optionalFieldsToRequire,
        hasSsn,
        hasEin,
        excludeFields: applicability.excludeFields,
      }),
    [mode, optionalFieldsToRequire, hasSsn, hasEin, applicability],
  )

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

  const typeEntries = [ContractorType.Individual, ContractorType.Business]
  const wageTypeEntries = [WageType.Hourly, WageType.Fixed]
  const fieldsMetadata = {
    ...baseMetadata,
    type: withOptions(
      baseMetadata.type,
      typeEntries.map(value => ({ value, label: value })),
      typeEntries,
    ),
    wageType: withOptions(
      baseMetadata.wageType,
      wageTypeEntries.map(value => ({ value, label: value })),
      wageTypeEntries,
    ),
    workState: withOptions(
      baseMetadata.workState,
      STATES_ABBR.map(abbr => ({ value: abbr, label: abbr })),
      STATES_ABBR,
    ),
  }

  const buildRequestBody = (payload: ContractorDetailsFormOutputs): ContractorCreateRequestBody => {
    const useSelfOnboarding = payload.selfOnboarding
    const isIndividualPayload = payload.type === ContractorType.Individual

    const base: ContractorCreateRequestBody = {
      type: payload.type,
      wageType: payload.wageType,
      startDate: payload.startDate,
      selfOnboarding: useSelfOnboarding,
      email: useSelfOnboarding ? payload.email || undefined : undefined,
      hourlyRate: payload.wageType === WageType.Hourly ? String(payload.hourlyRate) : undefined,
    }

    if (isIndividualPayload) {
      const cleanedSsn = payload.ssn ? removeNonDigits(payload.ssn) : ''
      return {
        ...base,
        firstName: payload.firstName,
        lastName: payload.lastName,
        middleInitial: payload.middleInitial || undefined,
        fileNewHireReport: payload.fileNewHireReport,
        workState: payload.fileNewHireReport ? payload.workState || undefined : undefined,
        ssn: !useSelfOnboarding && cleanedSsn ? cleanedSsn : undefined,
      }
    }

    const cleanedEin = payload.ein ? removeNonDigits(payload.ein) : ''
    return {
      ...base,
      fileNewHireReport: false,
      businessName: payload.businessName,
      ein: !useSelfOnboarding && cleanedEin ? cleanedEin : undefined,
    }
  }

  const onSubmit = async (
    options?: ContractorDetailsSubmitOptions,
  ): Promise<HookSubmitResult<Contractor> | undefined> => {
    let submitResult: HookSubmitResult<Contractor> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ContractorDetailsFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const requestBody = buildRequestBody(payload)

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
        Email: showEmail ? EmailField : undefined,
        FirstName: isIndividual ? FirstNameField : undefined,
        LastName: isIndividual ? LastNameField : undefined,
        MiddleInitial: isIndividual ? MiddleInitialField : undefined,
        BusinessName: isBusiness ? BusinessNameField : undefined,
        Ssn: showSsn ? SsnField : undefined,
        Ein: showEin ? EinField : undefined,
        WorkState: showWorkState ? WorkStateField : undefined,
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
export type ContractorDetailsFieldsMetadata =
  UseContractorDetailsFormReady['form']['fieldsMetadata']

/**
 * Shape of `form.Fields` returned by {@link useContractorDetailsForm}.
 *
 * @public
 */
export type ContractorDetailsFormFields = UseContractorDetailsFormReady['form']['Fields']
