export { FederalTaxes, FederalTaxesCard, FederalTaxesEditForm } from './management'
export type {
  FederalTaxesProps,
  FederalTaxesCardProps,
  FederalTaxesEditFormProps,
} from './management'
export {
  useFederalTaxesForm,
  createFederalTaxesSchema,
  FederalTaxesErrorCodes,
  FILING_STATUS_VALUES,
} from './shared/useFederalTaxesForm'
export type {
  FederalTaxesOptionalFieldsToRequire,
  UseFederalTaxesFormProps,
  UseFederalTaxesFormResult,
  UseFederalTaxesFormReady,
  FederalTaxesFieldsMetadata,
  FederalTaxesFormFields,
  FederalTaxesFields,
  FederalTaxesErrorCode,
  FederalTaxesFormData,
  FederalTaxesFormOutputs,
  FederalTaxesField,
  FilingStatusValue,
  FederalTaxesRequiredValidation,
  FilingStatusFieldProps,
  TwoJobsFieldProps,
  DependentsAmountFieldProps,
  OtherIncomeFieldProps,
  DeductionsFieldProps,
  ExtraWithholdingFieldProps,
} from './shared/useFederalTaxesForm'
export {
  useFederalTaxesSummary,
  type UseFederalTaxesSummaryParams,
  type UseFederalTaxesSummaryReady,
  type UseFederalTaxesSummaryResult,
} from './shared/useFederalTaxesSummary'
