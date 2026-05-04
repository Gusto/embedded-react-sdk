import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeFederalTax } from '@gusto/embedded-api/models/components/employeefederaltax'
import type { EmployeeFederalTaxRev2020 } from '@gusto/embedded-api/models/components/employeefederaltaxrev2020'
import { useEmployeeTaxSetupGetFederalTaxes } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupUpdateFederalTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateFederalTaxes'
import type {
  FilingStatus,
  PutV1EmployeesEmployeeIdFederalTaxesRequestBody,
} from '@gusto/embedded-api/models/operations/putv1employeesemployeeidfederaltaxes'
import {
  createFederalTaxesSchema,
  FILING_STATUS_VALUES,
  type FederalTaxesOptionalFieldsToRequire,
  type FederalTaxesFormData,
  type FederalTaxesFormOutputs,
  type FilingStatusValue,
} from './federalTaxesSchema'
import {
  FilingStatusField,
  TwoJobsField,
  DependentsAmountField,
  OtherIncomeField,
  DeductionsField,
  ExtraWithholdingField,
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

export type { FederalTaxesOptionalFieldsToRequire } from './federalTaxesSchema'

export interface FederalTaxesSubmitCallbacks {
  onFederalTaxesUpdated?: (federalTaxes: EmployeeFederalTax) => void
}

export interface UseFederalTaxesFormProps {
  employeeId: string
  optionalFieldsToRequire?: FederalTaxesOptionalFieldsToRequire
  defaultValues?: Partial<FederalTaxesFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export interface FederalTaxesFields {
  FilingStatus: typeof FilingStatusField
  TwoJobs: typeof TwoJobsField
  DependentsAmount: typeof DependentsAmountField
  OtherIncome: typeof OtherIncomeField
  Deductions: typeof DeductionsField
  ExtraWithholding: typeof ExtraWithholdingField
}

export interface UseFederalTaxesFormReady extends BaseFormHookReady<
  FieldsMetadata,
  FederalTaxesFormData,
  FederalTaxesFields
> {
  data: {
    employeeFederalTax: EmployeeFederalTax
  }
  status: { isPending: boolean; mode: 'update' }
  actions: {
    onSubmit: (
      callbacks?: FederalTaxesSubmitCallbacks,
    ) => Promise<HookSubmitResult<EmployeeFederalTax> | undefined>
  }
}

function isRev2020(federalTax: EmployeeFederalTax): federalTax is EmployeeFederalTaxRev2020 {
  return federalTax.w4DataType === 'rev_2020_w4'
}

function toFilingStatus(value: string | null | undefined): FilingStatusValue | '' {
  if (!value) return ''
  return FILING_STATUS_VALUES.find(allowed => allowed === value) ?? ''
}

function toNumber(value: string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function useFederalTaxesForm({
  employeeId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseFederalTaxesFormProps): HookLoadingResult | UseFederalTaxesFormReady {
  const federalTaxesQuery = useEmployeeTaxSetupGetFederalTaxes({ employeeUuid: employeeId })

  const employeeFederalTax = federalTaxesQuery.data?.employeeFederalTax

  const [schema, metadataConfig] = useMemo(
    () => createFederalTaxesSchema({ optionalFieldsToRequire }),
    [optionalFieldsToRequire],
  )

  const filingStatusOptions = useMemo(
    () => FILING_STATUS_VALUES.map(value => ({ value, label: value })),
    [],
  )

  const twoJobsOptions = useMemo(
    () => [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ],
    [],
  )

  const resolvedDefaults: FederalTaxesFormData = useMemo(() => {
    const rev2020Source =
      employeeFederalTax && isRev2020(employeeFederalTax) ? employeeFederalTax : undefined

    const fromServerFilingStatus = toFilingStatus(rev2020Source?.filingStatus)

    return {
      filingStatus: fromServerFilingStatus || partnerDefaults?.filingStatus || '',
      twoJobs: rev2020Source?.twoJobs ?? partnerDefaults?.twoJobs ?? false,
      dependentsAmount:
        toNumber(rev2020Source?.dependentsAmount) || (partnerDefaults?.dependentsAmount ?? 0),
      otherIncome: toNumber(rev2020Source?.otherIncome) || (partnerDefaults?.otherIncome ?? 0),
      deductions: toNumber(rev2020Source?.deductions) || (partnerDefaults?.deductions ?? 0),
      extraWithholding:
        toNumber(rev2020Source?.extraWithholding) || (partnerDefaults?.extraWithholding ?? 0),
    }
  }, [employeeFederalTax, partnerDefaults])

  const formMethods = useForm<FederalTaxesFormData, unknown, FederalTaxesFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const { mutateAsync: updateFederalTaxes, isPending } =
    useEmployeeTaxSetupUpdateFederalTaxesMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('FederalTaxesForm')

  const errorHandling = composeErrorHandler([federalTaxesQuery], { submitError, setSubmitError })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    filingStatus: withOptions<FilingStatusValue>(
      baseMetadata.filingStatus,
      filingStatusOptions,
      FILING_STATUS_VALUES,
    ),
    twoJobs: withOptions<boolean>(baseMetadata.twoJobs, twoJobsOptions, [true, false]),
    dependentsAmount: baseMetadata.dependentsAmount,
    otherIncome: baseMetadata.otherIncome,
    deductions: baseMetadata.deductions,
    extraWithholding: baseMetadata.extraWithholding,
  }

  const onSubmit = async (
    callbacks?: FederalTaxesSubmitCallbacks,
  ): Promise<HookSubmitResult<EmployeeFederalTax> | undefined> => {
    let submitResult: HookSubmitResult<EmployeeFederalTax> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: FederalTaxesFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            if (!employeeFederalTax) {
              throw new SDKInternalError('Federal taxes record was not loaded before submit')
            }

            const requestBody: PutV1EmployeesEmployeeIdFederalTaxesRequestBody = {
              filingStatus: payload.filingStatus as FilingStatus,
              twoJobs: payload.twoJobs,
              dependentsAmount: payload.dependentsAmount,
              otherIncome: payload.otherIncome,
              deductions: payload.deductions,
              extraWithholding: payload.extraWithholding,
              w4DataType: 'rev_2020_w4',
              version: employeeFederalTax.version,
            }

            const response = await updateFederalTaxes({
              request: {
                employeeUuid: employeeId,
                requestBody,
              },
            })

            if (!response.employeeFederalTax) {
              throw new SDKInternalError('Federal taxes update did not return an updated record')
            }

            const updated = response.employeeFederalTax
            callbacks?.onFederalTaxesUpdated?.(updated)

            submitResult = { mode: 'update', data: updated }
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

  if (federalTaxesQuery.isLoading || !employeeFederalTax) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      employeeFederalTax,
    },
    status: {
      isPending,
      mode: 'update' as const,
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        FilingStatus: FilingStatusField,
        TwoJobs: TwoJobsField,
        DependentsAmount: DependentsAmountField,
        OtherIncome: OtherIncomeField,
        Deductions: DeductionsField,
        ExtraWithholding: ExtraWithholdingField,
      },
      fieldsMetadata,
      hookFormInternals: { formMethods },
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UseFederalTaxesFormResult = HookLoadingResult | UseFederalTaxesFormReady
export type FederalTaxesFieldsMetadata = UseFederalTaxesFormReady['form']['fieldsMetadata']
export type FederalTaxesFormFields = UseFederalTaxesFormReady['form']['Fields']
