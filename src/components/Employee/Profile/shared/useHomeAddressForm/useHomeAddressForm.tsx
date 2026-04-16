import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesCreateMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreate'
import { useEmployeeAddressesUpdateMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdate'
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
import { useErrorHandling } from '@/partner-hook-utils/useErrorHandling'
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
}

export interface UseHomeAddressFormReady extends BaseFormHookReady<
  FieldsMetadata,
  HomeAddressFormData
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
}: UseHomeAddressFormProps): HookLoadingResult | UseHomeAddressFormReady {
  const homeAddressesQuery = useEmployeeAddressesGet(
    { employeeId: employeeId ?? '' },
    { enabled: !!employeeId },
  )

  const homeAddresses = homeAddressesQuery.data?.employeeAddressList
  const currentHomeAddress = getActiveHomeAddress(homeAddresses)

  const isCreateMode = !currentHomeAddress
  const mode = isCreateMode ? 'create' : 'update'

  const [schema, metadataConfig] = useMemo(
    () =>
      createHomeAddressSchema({
        mode,
        optionalFieldsToRequire,
        withEffectiveDateField,
      }),
    [mode, optionalFieldsToRequire, withEffectiveDateField],
  )

  const resolvedDefaults: HomeAddressFormData = {
    street1: currentHomeAddress?.street1 ?? partnerDefaults?.street1 ?? '',
    street2: currentHomeAddress?.street2 ?? partnerDefaults?.street2 ?? '',
    city: currentHomeAddress?.city ?? partnerDefaults?.city ?? '',
    state: currentHomeAddress?.state ?? partnerDefaults?.state ?? '',
    zip: currentHomeAddress?.zip ?? partnerDefaults?.zip ?? '',
    courtesyWithholding:
      currentHomeAddress?.courtesyWithholding ?? partnerDefaults?.courtesyWithholding ?? false,
    effectiveDate:
      currentHomeAddress?.effectiveDate?.toString() ?? partnerDefaults?.effectiveDate ?? '',
  }

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

  const isPending = createHomeAddressMutation.isPending || updateHomeAddressMutation.isPending

  const { baseSubmitHandler, error: submitError, setError } = useBaseSubmit('HomeAddressForm')

  const queries = employeeId ? [homeAddressesQuery] : []
  const errorHandling = useErrorHandling(queries, { error: submitError, setError })

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
              const result = await updateHomeAddressMutation.mutateAsync({
                request: {
                  homeAddressUuid: currentHomeAddress.uuid,
                  requestBody: {
                    version: currentHomeAddress.version,
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
    actions: { onSubmit },
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
export type HomeAddressFormFields = UseHomeAddressFormReady['form']['Fields']
