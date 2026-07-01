export * from '@/components'
export * from '@/contexts'

/**
 * Gusto API entity types returned by SDK hooks and components. These are
 * re-exported from the Gusto Embedded API client so their shapes are
 * documented here in the SDK reference.
 *
 * @group API Models
 * @public
 */
export type * as APIModels from '@/models/external'
export {
  componentEvents,
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
  ContractorOnboardingStatus,
  ContractorSelfOnboardingStatuses,
  PAY_PERIODS,
  I9_FORM_NAME,
} from '@/shared/constants'
export type { EventType } from '@/shared/constants'
export type {
  BeforeCreateRequestHook,
  BeforeRequestHook,
  AfterSuccessHook,
  AfterErrorHook,
  BeforeCreateRequestContext,
  BeforeRequestContext,
  AfterSuccessContext,
  AfterErrorContext,
  SDKHooks,
} from '@/types/hooks'
export type { SDKError, SDKErrorCategory, SDKFieldError } from '@/types/sdkError'
export { normalizeToSDKError, SDKInternalError } from '@/types/sdkError'
export type {
  ObservabilityHook,
  ObservabilityError,
  ObservabilityMetric,
  ObservabilityMetricUnit,
  SanitizationConfig,
} from '@/types/observability'

export type {
  BaseComponentInterface,
  CommonComponentInterface,
  OnEventType,
} from '@/components/Base'
export type {
  ResourceDictionary,
  Resources,
  DeepPartial,
  SupportedLanguages,
} from '@/types/Helpers'

// Partner hook infrastructure
export {
  composeErrorHandler,
  collectErrors,
  SDKFormProvider,
  composeSubmitHandler,
  useFieldErrorMessage,
  useDeriveFieldsMetadata,
  withOptions,
  FormFieldsMetadataProvider,
  TextInputHookField,
  SelectHookField,
  CheckboxHookField,
  NumberInputHookField,
  DatePickerHookField,
  RadioGroupHookField,
  SwitchHookField,
} from '@/partner-hook-utils'
export type {
  MixedErrorSource,
  SubmitStateForErrorHandling,
  HookFormInternals,
  HookLoadingResult,
  HookSubmitResult,
  HookErrorHandling,
  BaseHookReady,
  BaseFormHookReady,
  FormHookResult,
  FieldMetadata,
  FieldMetadataWithOptions,
  FieldsMetadata,
  ValidationMessages,
  BaseFieldProps,
  HookFieldProps,
  TextInputHookFieldProps,
  SelectHookFieldProps,
  CheckboxHookFieldProps,
  NumberInputHookFieldProps,
  DatePickerHookFieldProps,
  RadioGroupHookFieldProps,
  SwitchHookFieldProps,
  SharedFieldLayoutProps,
  SharedHorizontalFieldLayoutProps,
  TextInputProps,
  SelectProps,
  SelectOption,
  CheckboxProps,
  NumberInputProps,
  DatePickerProps,
  RadioGroupProps,
  RadioGroupOption,
  SwitchProps,
  FormFieldsMetadataContextValue,
} from '@/partner-hook-utils'

// Domain hooks - Employee
export {
  useDeductionForm,
  DeductionFormErrorCodes,
} from '@/components/Employee/Deductions/shared/useDeductionForm'
export type {
  UseDeductionFormProps,
  UseDeductionFormResult,
  UseDeductionFormReady,
  DeductionFormFields,
  DeductionFormFieldsMetadata,
  DeductionFormErrorCode,
  DeductionFormOptionalFieldsToRequire,
  DeductionFormData,
  DeductionFormRequiredValidation,
  DeductionFormNegativeAmountValidation,
  DeductionFormAmountValidation,
  DeductionFormCapValidation,
  DescriptionFieldProps,
  RecurringFieldProps,
  DeductAsPercentageFieldProps,
  AmountFieldProps as DeductionAmountFieldProps,
  TotalAmountFieldProps,
  AnnualMaximumFieldProps,
  GarnishmentTypeFieldProps,
} from '@/components/Employee/Deductions/shared/useDeductionForm'

export {
  useChildSupportGarnishmentForm,
  ChildSupportGarnishmentFormErrorCodes,
  getRequiredAttrKeys,
  SUPPORTED_REQUIRED_ATTR_KEYS,
} from '@/components/Employee/Deductions/shared/useChildSupportGarnishmentForm'
export type {
  UseChildSupportGarnishmentFormProps,
  UseChildSupportGarnishmentFormResult,
  UseChildSupportGarnishmentFormReady,
  ChildSupportGarnishmentFormFields,
  ChildSupportGarnishmentFormFieldsMetadata,
  ChildSupportGarnishmentFormErrorCode,
  ChildSupportGarnishmentFormData,
  SupportedRequiredAttrKey,
  ChildSupportGarnishmentRequiredValidation,
  ChildSupportGarnishmentNegativeAmountValidation,
  ChildSupportGarnishmentPercentValidation,
  PayPeriodMaximumValidation,
  ChildSupportGarnishmentAmountValidation,
  StateFieldEntry,
  CountyEntry,
  ChildSupportGarnishmentStateFieldProps,
  FipsCodeFieldProps,
  CaseNumberFieldProps,
  OrderNumberFieldProps,
  RemittanceNumberFieldProps,
  PayPeriodMaximumFieldProps,
  ChildSupportGarnishmentAmountFieldProps,
  PaymentPeriodFieldProps,
} from '@/components/Employee/Deductions/shared/useChildSupportGarnishmentForm'

export {
  useCompensationForm,
  CompensationErrorCodes,
} from '@/components/Employee/Compensation/shared/useCompensationForm'
export type {
  CompensationSubmitOptions,
  UseCompensationFormProps,
  UseCompensationFormResult,
  UseCompensationFormReady,
  CompensationFieldsMetadata,
  CompensationFormFields,
  CompensationErrorCode,
  CompensationOptionalFieldsToRequire,
  CompensationFormData,
  RequiredValidation as CompensationRequiredValidation,
  RateValidation,
  EffectiveDateValidation as CompensationEffectiveDateValidation,
  TitleFieldProps as CompensationTitleFieldProps,
  EffectiveDateFieldProps as CompensationEffectiveDateFieldProps,
  FlsaStatusFieldProps,
  RateFieldProps,
  PaymentUnitFieldProps,
  AdjustForMinimumWageFieldProps,
  MinimumWageIdFieldProps,
} from '@/components/Employee/Compensation/shared/useCompensationForm'

export { useJobForm, JobErrorCodes } from '@/components/Employee/Compensation/shared/useJobForm'
export type {
  JobSubmitOptions,
  UseJobFormProps,
  UseJobFormResult,
  UseJobFormReady,
  JobFieldsMetadata,
  JobFormFields,
  JobErrorCode,
  JobOptionalFieldsToRequire,
  JobFormData,
  JobRequiredValidation,
  JobTitleFieldProps,
  HireDateFieldProps,
  TwoPercentShareholderFieldProps,
  StateWcCoveredFieldProps,
  StateWcClassCodeFieldProps,
} from '@/components/Employee/Compensation/shared/useJobForm'

export {
  useEmployeeDetailsForm,
  EmployeeDetailsErrorCodes,
} from '@/components/Employee/Profile/shared/useEmployeeDetailsForm'
export type {
  EmployeeDetailsSubmitCallbacks,
  EmployeeDetailsOptionalFieldsToRequire,
  UseEmployeeDetailsFormSharedProps,
  UseEmployeeDetailsFormProps,
  UseEmployeeDetailsFormResult,
  UseEmployeeDetailsFormReady,
  EmployeeDetailsFieldsMetadata,
  EmployeeDetailsFormFields,
  EmployeeDetailsErrorCode,
  EmployeeDetailsFormData,
  EmployeeDetailsField,
  EmployeeDetailsRequiredValidation,
  NameValidation,
  EmailValidation,
  SsnValidation,
  FirstNameFieldProps,
  MiddleInitialFieldProps,
  LastNameFieldProps,
  EmailFieldProps,
  DateOfBirthFieldProps,
  SsnFieldProps,
  SelfOnboardingFieldProps,
  SsnRequiredValidation,
} from '@/components/Employee/Profile/shared/useEmployeeDetailsForm'

export {
  useContractorDetailsForm,
  ContractorType,
  WageType,
  ContractorDetailsErrorCodes,
} from '@/components/Contractor/Profile/shared/useContractorDetailsForm'
export type {
  ContractorDetailsSubmitOptions,
  ContractorDetailsOptionalFieldsToRequire,
  UseContractorDetailsFormSharedProps,
  UseContractorDetailsFormProps,
  UseContractorDetailsFormResult,
  UseContractorDetailsFormReady,
  ContractorDetailsFieldsMetadata,
  ContractorDetailsFormFields,
  ContractorDetailsErrorCode,
  ContractorDetailsFormData,
  ContractorDetailsRequiredValidation,
  ContractorDetailsNameValidation,
  ContractorDetailsEmailValidation,
  ContractorDetailsSsnValidation,
  ContractorDetailsSsnRequiredValidation,
  ContractorDetailsEinValidation,
  ContractorDetailsEinRequiredValidation,
  TypeFieldProps as ContractorTypeFieldProps,
  WageTypeFieldProps as ContractorWageTypeFieldProps,
  StartDateFieldProps as ContractorStartDateFieldProps,
  HourlyRateFieldProps as ContractorHourlyRateFieldProps,
  SelfOnboardingFieldProps as ContractorSelfOnboardingFieldProps,
  FileNewHireReportFieldProps as ContractorFileNewHireReportFieldProps,
  EmailFieldProps as ContractorEmailFieldProps,
  FirstNameFieldProps as ContractorFirstNameFieldProps,
  LastNameFieldProps as ContractorLastNameFieldProps,
  MiddleInitialFieldProps as ContractorMiddleInitialFieldProps,
  BusinessNameFieldProps as ContractorBusinessNameFieldProps,
  SsnFieldProps as ContractorSsnFieldProps,
  EinFieldProps as ContractorEinFieldProps,
  WorkStateFieldProps as ContractorWorkStateFieldProps,
} from '@/components/Contractor/Profile/shared/useContractorDetailsForm'

export {
  useContractorBankAccountForm,
  ContractorBankAccountErrorCodes,
  ACCOUNT_TYPES as ContractorBankAccountTypes,
} from '@/components/Contractor/PaymentMethod/shared/useContractorBankAccountForm'
export type {
  UseContractorBankAccountFormProps,
  UseContractorBankAccountFormResult,
  UseContractorBankAccountFormReady,
  ContractorBankAccountFormFields,
  ContractorBankAccountFieldsMetadata,
  ContractorBankAccountErrorCode,
  ContractorAccountType,
  ContractorBankAccountFormData,
  ContractorBankAccountFormField,
  ContractorBankAccountOptionalFieldsToRequire,
  ContractorBankAccountRequiredValidation,
  ContractorBankAccountRoutingNumberValidation,
  ContractorBankAccountAccountNumberValidation,
  NameFieldProps as ContractorBankAccountNameFieldProps,
  RoutingNumberFieldProps as ContractorBankAccountRoutingNumberFieldProps,
  AccountNumberFieldProps as ContractorBankAccountAccountNumberFieldProps,
  AccountTypeFieldProps as ContractorBankAccountAccountTypeFieldProps,
} from '@/components/Contractor/PaymentMethod/shared/useContractorBankAccountForm'

export {
  useContractorPaymentMethodForm,
  ContractorPaymentMethodErrorCodes,
} from '@/components/Contractor/PaymentMethod/shared/useContractorPaymentMethodForm'
export type {
  UseContractorPaymentMethodFormProps,
  UseContractorPaymentMethodFormResult,
  UseContractorPaymentMethodFormReady,
  ContractorPaymentMethodFormFields,
  ContractorPaymentMethodFieldsMetadata,
  ContractorPaymentMethodErrorCode,
  ContractorPaymentMethodFormType,
  ContractorPaymentMethodFormData,
  ContractorPaymentMethodFormField,
  TypeFieldProps as ContractorPaymentMethodTypeFieldProps,
} from '@/components/Contractor/PaymentMethod/shared/useContractorPaymentMethodForm'

export {
  useWorkAddressForm,
  useCurrentWorkAddressForm,
  WorkAddressErrorCodes,
} from '@/components/Employee/Profile/shared/useWorkAddressForm'
export type {
  WorkAddressSubmitCallbacks,
  WorkAddressSubmitOptions,
  WorkAddressOptionalFieldsToRequire,
  UseCurrentWorkAddressFormProps,
  UseWorkAddressFormProps,
  UseWorkAddressFormResult,
  UseWorkAddressFormReady,
  WorkAddressFieldsMetadata,
  WorkAddressFormFields,
  WorkAddressErrorCode,
  WorkAddressFormData,
  WorkAddressField,
  WorkAddressRequiredValidation,
  LocationFieldProps,
  EffectiveDateFieldProps,
} from '@/components/Employee/Profile/shared/useWorkAddressForm'

export {
  useHomeAddressForm,
  useCurrentHomeAddressForm,
  HomeAddressErrorCodes,
} from '@/components/Employee/Profile/shared/useHomeAddressForm'
export type {
  HomeAddressSubmitOptions,
  HomeAddressOptionalFieldsToRequire,
  UseHomeAddressFormProps,
  UseCurrentHomeAddressFormProps,
  UseHomeAddressFormResult,
  UseHomeAddressFormReady,
  HomeAddressFieldsMetadata,
  HomeAddressFormFields,
  HomeAddressErrorCode,
  HomeAddressFormData,
  HomeAddressField,
  HomeAddressRequiredValidation,
  ZipValidation,
  Street1FieldProps,
  Street2FieldProps,
  CityFieldProps,
  StateFieldProps,
  ZipFieldProps,
  CourtesyWithholdingFieldProps,
  HomeAddressEffectiveDateFieldProps,
} from '@/components/Employee/Profile/shared/useHomeAddressForm'

export {
  useContractorAddressForm,
  ContractorAddressErrorCodes,
} from '@/components/Contractor/Address/shared/useContractorAddressForm'
export type {
  ContractorAddressSubmitOptions,
  ContractorAddressOptionalFieldsToRequire,
  UseContractorAddressFormProps,
  UseContractorAddressFormResult,
  UseContractorAddressFormReady,
  ContractorAddressFieldsMetadata,
  ContractorAddressFormFields,
  ContractorAddressErrorCode,
  ContractorAddressFormData,
  ContractorAddressField,
  ContractorAddressRequiredValidation,
  ContractorAddressZipValidation,
  ContractorAddressStreet1FieldProps,
  ContractorAddressStreet2FieldProps,
  ContractorAddressCityFieldProps,
  ContractorAddressStateFieldProps,
  ContractorAddressZipFieldProps,
} from '@/components/Contractor/Address/shared/useContractorAddressForm'

export {
  useBankForm,
  BankFormErrorCodes,
  ACCOUNT_TYPES,
} from '@/components/Employee/PaymentMethod/shared/useBankForm'
export type {
  BankFormSubmitOptions,
  UseBankFormProps,
  UseBankFormResult,
  UseBankFormReady,
  BankFormFields,
  BankFormFieldsMetadata,
  BankFormErrorCode,
  BankFormData,
  BankFormField,
  BankFormOptionalFieldsToRequire,
  AccountType,
  BankFormRequiredValidation,
  RoutingNumberValidation,
  AccountNumberValidation,
  NameFieldProps,
  RoutingNumberFieldProps,
  AccountNumberFieldProps,
  AccountTypeFieldProps,
} from '@/components/Employee/PaymentMethod/shared/useBankForm'

export {
  usePaymentMethodForm,
  PaymentMethodFormErrorCodes,
  PAYMENT_METHOD_TYPES,
} from '@/components/Employee/PaymentMethod/shared/usePaymentMethodForm'
export type {
  UsePaymentMethodFormProps,
  UsePaymentMethodFormResult,
  UsePaymentMethodFormReady,
  PaymentMethodFormFields,
  PaymentMethodFormFieldsMetadata,
  PaymentMethodFormErrorCode,
  PaymentMethodFormData,
  PaymentMethodFormField,
  PaymentMethodFormOptionalFieldsToRequire,
  PaymentMethodType,
  PaymentMethodFormRequiredValidation,
  TypeFieldProps,
} from '@/components/Employee/PaymentMethod/shared/usePaymentMethodForm'

export {
  useSplitPaymentsForm,
  SplitPaymentsFormErrorCodes,
  createSplitPaymentsFormSchema,
  SPLIT_BY_VALUES,
} from '@/components/Employee/PaymentMethod/shared/useSplitPaymentsForm'
export type {
  UseSplitPaymentsFormProps,
  UseSplitPaymentsFormResult,
  UseSplitPaymentsFormReady,
  SplitPaymentsFormFields,
  SplitPaymentsFormFieldsMetadata,
  SplitPaymentsFormErrorCode,
  SplitPaymentsFormData,
  SplitPaymentsFormOutputs,
  SplitPaymentsFormField,
  SplitPaymentsFormOptionalFieldsToRequire,
  SplitByValue,
  SplitPaymentsFormRequiredValidation,
  SplitByFieldProps,
  SplitFieldEntry,
  SplitFieldProps,
  SplitFieldValidation,
  WorkingSplit,
} from '@/components/Employee/PaymentMethod/shared/useSplitPaymentsForm'

export {
  useFederalTaxesForm,
  FederalTaxesErrorCodes,
  FILING_STATUS_VALUES,
} from '@/components/Employee/FederalTaxes/shared/useFederalTaxesForm'
export {
  useEmployeeStateTaxesForm,
  createEmployeeStateTaxesSchema,
  EmployeeStateTaxesErrorCodes,
  createStateFields,
  useStateFields,
  getQuestionVariant,
} from '@/components/Employee/StateTaxes/shared'
export type {
  UseEmployeeStateTaxesFormProps,
  UseEmployeeStateTaxesFormResult,
  UseEmployeeStateTaxesFormReady,
  EmployeeStateTaxesFieldsMetadata,
  EmployeeStateTaxesFormFields,
  EmployeeStateTaxesErrorCode,
  EmployeeStateTaxesFormData,
  EmployeeStateTaxesFormOutputs,
  EmployeeStateTaxesSchemaOptions,
  EmployeeStateTaxesQuestionMeta,
  EmployeeStateTaxesMetadataConfig,
  StateTaxValue,
  StateTaxQuestionVariant,
  StateTaxFieldsGroup,
  StateTaxFields,
  StateTaxQuestionFieldEntry,
  SharedQuestionMetadata,
  SelectStateTaxQuestion,
  RadioStateTaxQuestion,
  TextStateTaxQuestion,
  NumberStateTaxQuestion,
  CurrencyStateTaxQuestion,
  DateStateTaxQuestion,
  CreateStateFieldsOptions,
  BaseStateTaxFieldProps,
  StateTaxValidationMessages,
  SelectStateTaxFieldProps,
  RadioStateTaxFieldProps,
  TextStateTaxFieldProps,
  NumberStateTaxFieldProps,
  CurrencyStateTaxFieldProps,
  DateStateTaxFieldProps,
} from '@/components/Employee/StateTaxes/shared'
export type {
  FederalTaxesOptionalFieldsToRequire,
  UseFederalTaxesFormProps,
  UseFederalTaxesFormResult,
  UseFederalTaxesFormReady,
  FederalTaxesFieldsMetadata,
  FederalTaxesFormFields,
  FederalTaxesErrorCode,
  FederalTaxesFormData,
  FederalTaxesField,
  FilingStatusValue,
  FederalTaxesRequiredValidation,
  FilingStatusFieldProps,
  TwoJobsFieldProps,
  DependentsAmountFieldProps,
  OtherIncomeFieldProps,
  DeductionsFieldProps,
  ExtraWithholdingFieldProps,
} from '@/components/Employee/FederalTaxes/shared/useFederalTaxesForm'

export {
  useSignEmployeeForm,
  SignEmployeeFormErrorCodes,
  MAX_PREPARERS,
  PREPARER_FIELDS_BY_INDEX,
  preparerFieldName,
} from '@/components/Employee/Documents/shared/useSignEmployeeForm'
export type {
  UseSignEmployeeFormProps,
  UseSignEmployeeFormResult,
  UseSignEmployeeFormReady,
  SignEmployeeFormFieldsMetadata,
  SignEmployeeFormFields,
  PreparerFieldGroup,
  SignEmployeeFormErrorCode,
  SignEmployeeFormData,
  SignEmployeeFormField,
  PreparerIndex,
  PreparerFieldSuffix,
  SignEmployeeFormRequiredValidation,
  SignatureFieldProps as SignEmployeeFormSignatureFieldProps,
  ConfirmSignatureFieldProps as SignEmployeeFormConfirmSignatureFieldProps,
  UsedPreparerFieldProps,
  PreparerTextFieldProps,
  PreparerSelectFieldProps,
  PreparerCheckboxFieldProps,
} from '@/components/Employee/Documents/shared/useSignEmployeeForm'

// Domain data hooks - Employee
export { useEmployeeList } from '@/components/Employee/EmployeeList/shared'
export type {
  UseEmployeeListProps,
  UseEmployeeListResult,
  UseEmployeeListReady,
  EmployeeType,
  EmployeeAction,
  EmployeeWithActions,
} from '@/components/Employee/EmployeeList/shared'

// Domain hooks - Company
export {
  usePayScheduleForm,
  PayScheduleErrorCodes,
} from '@/components/Company/PaySchedule/shared/usePayScheduleForm'
export type {
  PayScheduleOptionalFieldsToRequire,
  UsePayScheduleFormProps,
  UsePayScheduleFormResult,
  UsePayScheduleFormReady,
  PayScheduleFieldsMetadata,
  PayScheduleFormFields,
  PayScheduleErrorCode,
  PayScheduleFormData,
  PayScheduleField,
  PayScheduleFrequency,
  PayScheduleRequiredValidation,
  DayValidation,
  CustomNameFieldProps,
  FrequencyFieldProps,
  CustomTwicePerMonthFieldProps,
  AnchorPayDateFieldProps,
  AnchorEndOfPayPeriodFieldProps,
  Day1FieldProps,
  Day2FieldProps,
} from '@/components/Company/PaySchedule/shared/usePayScheduleForm'

export {
  useSignCompanyForm,
  SignCompanyFormErrorCodes,
} from '@/components/Company/DocumentSigner/shared/useSignCompanyForm'
export type {
  SignCompanyFormOptionalFieldsToRequire,
  UseSignCompanyFormProps,
  UseSignCompanyFormResult,
  UseSignCompanyFormReady,
  SignCompanyFormFieldsMetadata,
  SignCompanyFormFields,
  SignCompanyFormErrorCode,
  SignCompanyFormData,
  SignCompanyFormField,
  SignCompanyFormRequiredValidation,
  SignatureFieldProps,
  ConfirmSignatureFieldProps,
} from '@/components/Company/DocumentSigner/shared/useSignCompanyForm'

// Domain data hooks - Contractor
export { useContractorDocumentsList } from '@/components/Contractor/Documents/DocumentsList/useContractorDocumentsList'
export type {
  UseContractorDocumentsListParams,
  UseContractorDocumentsListResult,
  UseContractorDocumentsListReady,
} from '@/components/Contractor/Documents/DocumentsList/useContractorDocumentsList'
