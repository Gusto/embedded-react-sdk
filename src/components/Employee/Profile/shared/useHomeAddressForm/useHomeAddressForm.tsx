import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesCreateMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreate'
import { useEmployeeAddressesUpdateMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdate'
import { useEmployeeAddressesDeleteMutation } from '@gusto/embedded-api/react-query/employeeAddressesDelete'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import {
  createHomeAddressSchema,
  type HomeAddressOptionalFieldsToRequire,
  type HomeAddressFormData,
  type HomeAddressFormOutputs,
} from './homeAddressSchema'
import {
  Street1Field,
  Street2Field,
  CityField,
  StateField,
  ZipField,
  CourtesyWithholdingField,
  EffectiveDateField,
} from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { STATES_ABBR } from '@/shared/constants'

export type { HomeAddressOptionalFieldsToRequire } from './homeAddressSchema'

export interface HomeAddressSubmitOptions {
  employeeId?: string
  effectiveDate?: string
}

export interface UseHomeAddressFormProps {
  employeeId?: string
  withEffectiveDateField?: boolean
  optionalFieldsToRequire?: HomeAddressOptionalFieldsToRequire
  defaultValues?: Partial<HomeAddressFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
  /**
   * How to choose create (POST) vs update (PUT) when the employee may already have a current address.
   * - `auto`: create only if there is no current address; otherwise update (default).
   * - `alwaysCreate`: always POST a new home address (e.g. add a future-dated address).
   * - `alwaysUpdate`: always PUT the current active address (e.g. edit in place).
   */
  submissionMode?: 'auto' | 'alwaysCreate' | 'alwaysUpdate'
  /**
   * `current` fills the form from the active address; `empty` clears fields for add-new flows even when a current address exists.
   */
  defaultValuesStrategy?: 'current' | 'empty'
  /**
   * When set with `submissionMode: 'alwaysUpdate'`, the form defaults and PUT target the home address with this UUID
   * (e.g. editing a row from address history). When omitted, the active address is used.
   */
  updateTargetUuid?: string
}

export type HomeAddressFormFields = {
  Street1: typeof Street1Field
  Street2: typeof Street2Field
  City: typeof CityField
  State: typeof StateField
  Zip: typeof ZipField
  CourtesyWithholding: typeof CourtesyWithholdingField
  EffectiveDate: typeof EffectiveDateField | undefined
}

type HomeAddressFormApi = BaseFormHookReady<FieldsMetadata, HomeAddressFormData>['form']

export interface UseHomeAddressFormReady extends Omit<
  BaseFormHookReady<FieldsMetadata, HomeAddressFormData>,
  'data' | 'status' | 'actions' | 'form'
> {
  data: {
    homeAddress: EmployeeAddress | null
    homeAddresses: EmployeeAddress[] | undefined
  }
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: {
    onSubmit: (
      options?: HomeAddressSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeAddress> | undefined>
    deleteHomeAddress: (homeAddressUuid: string) => Promise<boolean>
  }
  form: Omit<HomeAddressFormApi, 'Fields'> & {
    Fields: HomeAddressFormFields
  }
}

const getActiveHomeAddress = (addresses?: EmployeeAddress[]) => {
  if (!addresses || addresses.length === 0) return undefined
  return addresses.find(address => address.active) ?? addresses[0]
}

export function useHomeAddressForm({
  employeeId,
  withEffectiveDateField = true,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
  submissionMode = 'auto',
  defaultValuesStrategy = 'current',
  updateTargetUuid,
}: UseHomeAddressFormProps): HookLoadingResult | UseHomeAddressFormReady {
  const homeAddressesQuery = useEmployeeAddressesGet(
    { employeeId: employeeId ?? '' },
    { enabled: !!employeeId },
  )

  const homeAddresses = homeAddressesQuery.data?.employeeAddressList
  const currentHomeAddress = getActiveHomeAddress(homeAddresses)

  const sourceAddressForDefaults = useMemo(() => {
    if (
      submissionMode === 'alwaysUpdate' &&
      updateTargetUuid &&
      homeAddresses &&
      homeAddresses.length > 0
    ) {
      return homeAddresses.find(a => a.uuid === updateTargetUuid) ?? currentHomeAddress
    }
    return currentHomeAddress
  }, [submissionMode, updateTargetUuid, homeAddresses, currentHomeAddress])

  const isCreateMode =
    submissionMode === 'alwaysCreate'
      ? true
      : submissionMode === 'alwaysUpdate'
        ? false
        : !currentHomeAddress

  const schemaMode = isCreateMode ? 'create' : 'update'

  const [schema, metadataConfig] = useMemo(
    () =>
      createHomeAddressSchema({
        mode: schemaMode,
        optionalFieldsToRequire,
        withEffectiveDateField,
      }),
    [schemaMode, optionalFieldsToRequire, withEffectiveDateField],
  )

  const resolvedDefaults: HomeAddressFormData = useMemo(() => {
    if (defaultValuesStrategy === 'empty') {
      return {
        street1: partnerDefaults?.street1 ?? '',
        street2: partnerDefaults?.street2 ?? '',
        city: partnerDefaults?.city ?? '',
        state: partnerDefaults?.state ?? '',
        zip: partnerDefaults?.zip ?? '',
        courtesyWithholding: partnerDefaults?.courtesyWithholding ?? false,
        effectiveDate: partnerDefaults?.effectiveDate ?? '',
      }
    }
    return {
      street1: sourceAddressForDefaults?.street1 ?? partnerDefaults?.street1 ?? '',
      street2: sourceAddressForDefaults?.street2 ?? partnerDefaults?.street2 ?? '',
      city: sourceAddressForDefaults?.city ?? partnerDefaults?.city ?? '',
      state: sourceAddressForDefaults?.state ?? partnerDefaults?.state ?? '',
      zip: sourceAddressForDefaults?.zip ?? partnerDefaults?.zip ?? '',
      courtesyWithholding:
        sourceAddressForDefaults?.courtesyWithholding ??
        partnerDefaults?.courtesyWithholding ??
        false,
      effectiveDate:
        sourceAddressForDefaults?.effectiveDate?.toString() ?? partnerDefaults?.effectiveDate ?? '',
    }
  }, [defaultValuesStrategy, sourceAddressForDefaults, partnerDefaults])

  const formMethods = useForm<HomeAddressFormData, unknown, HomeAddressFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const createHomeAddressMutation = useEmployeeAddressesCreateMutation()
  const updateHomeAddressMutation = useEmployeeAddressesUpdateMutation()
  const deleteHomeAddressMutation = useEmployeeAddressesDeleteMutation()

  const isPending =
    createHomeAddressMutation.isPending ||
    updateHomeAddressMutation.isPending ||
    deleteHomeAddressMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('HomeAddressForm')

  const queries = employeeId ? [homeAddressesQuery] : []
  const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })

  const stateOptions = STATES_ABBR.map(abbr => ({
    value: abbr,
    label: abbr,
  }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    street1: baseMetadata.street1,
    street2: baseMetadata.street2,
    city: baseMetadata.city,
    state: withOptions(baseMetadata.state, stateOptions),
    zip: baseMetadata.zip,
    courtesyWithholding: baseMetadata.courtesyWithholding,
    effectiveDate: baseMetadata.effectiveDate,
  }

  const onSubmit = async (
    options?: HomeAddressSubmitOptions,
  ): Promise<HookSubmitResult<EmployeeAddress> | undefined> => {
    let submitResult: HookSubmitResult<EmployeeAddress> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: HomeAddressFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const resolvedEmployeeId = options?.employeeId ?? employeeId

            if (!resolvedEmployeeId) {
              throw new SDKInternalError('employeeId is required to submit home address')
            }

            const resolvedEffectiveDate =
              withEffectiveDateField && payload.effectiveDate
                ? payload.effectiveDate
                : options?.effectiveDate

            const effectiveDateParam = resolvedEffectiveDate
              ? new RFCDate(new Date(resolvedEffectiveDate))
              : undefined

            let updatedHomeAddress: EmployeeAddress

            if (isCreateMode) {
              const result = await createHomeAddressMutation.mutateAsync({
                request: {
                  employeeId: resolvedEmployeeId,
                  requestBody: {
                    street1: payload.street1,
                    street2: payload.street2 || undefined,
                    city: payload.city,
                    state: payload.state,
                    zip: payload.zip,
                    courtesyWithholding: payload.courtesyWithholding,
                    effectiveDate: effectiveDateParam,
                  },
                },
              })

              if (!result.employeeAddress) {
                throw new SDKInternalError('Home address creation failed')
              }

              updatedHomeAddress = result.employeeAddress
            } else {
              const addressToUpdate =
                submissionMode === 'alwaysUpdate' && updateTargetUuid
                  ? homeAddresses?.find(a => a.uuid === updateTargetUuid)
                  : currentHomeAddress

              if (!addressToUpdate) {
                throw new SDKInternalError(
                  'Cannot update home address: no matching address on file',
                )
              }

              const result = await updateHomeAddressMutation.mutateAsync({
                request: {
                  homeAddressUuid: addressToUpdate.uuid,
                  requestBody: {
                    version: addressToUpdate.version,
                    street1: payload.street1,
                    street2: payload.street2 || undefined,
                    city: payload.city,
                    state: payload.state,
                    zip: payload.zip,
                    courtesyWithholding: payload.courtesyWithholding,
                    effectiveDate: effectiveDateParam,
                  },
                },
              })

              if (!result.employeeAddress) {
                throw new SDKInternalError('Home address update failed')
              }

              updatedHomeAddress = result.employeeAddress
            }

            submitResult = {
              mode: isCreateMode ? 'create' : 'update',
              data: updatedHomeAddress,
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

  const deleteHomeAddress = async (homeAddressUuid: string): Promise<boolean> => {
    let deleted = false
    await baseSubmitHandler(homeAddressUuid, async uuid => {
      const target = homeAddresses?.find(a => a.uuid === uuid)
      if (!target) {
        throw new SDKInternalError('Home address not found')
      }
      if (target.active === true) {
        throw new SDKInternalError('Cannot delete the active home address')
      }

      await deleteHomeAddressMutation.mutateAsync({
        request: { homeAddressUuid: uuid },
      })
      deleted = true

      await homeAddressesQuery.refetch()
    })
    return deleted
  }

  const isDataLoading = employeeId ? homeAddressesQuery.isLoading : false

  if (isDataLoading || (employeeId && !homeAddresses)) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      homeAddress: currentHomeAddress ?? null,
      homeAddresses,
    },
    status: {
      isPending,
      mode: isCreateMode ? ('create' as const) : ('update' as const),
    },
    actions: { onSubmit, deleteHomeAddress },
    errorHandling,
    form: {
      Fields: {
        Street1: Street1Field,
        Street2: Street2Field,
        City: CityField,
        State: StateField,
        Zip: ZipField,
        CourtesyWithholding: CourtesyWithholdingField,
        EffectiveDate: withEffectiveDateField ? EffectiveDateField : undefined,
      },
      fieldsMetadata,
      hookFormInternals: { formMethods },
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UseHomeAddressFormResult = HookLoadingResult | UseHomeAddressFormReady
export type HomeAddressFieldsMetadata = UseHomeAddressFormReady['form']['fieldsMetadata']
