export * from '@/components'
export * from '@/contexts'

/**
 * Entity types returned by the Gusto Embedded Payroll API.
 *
 * @remarks
 * Re-exported from `@gusto/embedded-api` for use in SDK hook results and component props.
 * Properties are camelCase — the underlying API returns snake_case JSON, but the Typescript
 * client normalizes them.
 *
 * @public
 */
export type * as APIModels from '@/models/external'
export type { WARiskClassCode } from '@/models/WA_RISK_CODES'
export type { NaicsCode } from '@/models/NAICSCodes'
export {
  componentEvents,
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
  ContractorOnboardingStatus,
  ContractorSelfOnboardingStatuses,
  PAY_PERIODS,
  I9_FORM_NAME,
  STATES_ABBR,
} from '@/shared/constants'
export type { EventType, StateAbbreviation } from '@/shared/constants'
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
export { SDKErrorCategories } from '@/types/sdkError'
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
  LoaderComponentType,
  OnEventType,
} from '@/components/Base'
export type {
  ResourceDictionary,
  GlobalResourceDictionary,
  Resources,
  Translations,
  DeepPartial,
  SupportedLanguages,
  DataAttributes,
  RequireAtLeastOne,
} from '@/types/Helpers'

// Partner hook infrastructure
export { composeErrorHandler, SDKFormProvider, composeSubmitHandler } from '@/partner-hook-utils'
export type {
  MixedErrorSource,
  QueryWithRefetch,
  SubmitStateForErrorHandling,
  SDKFormProviderProps,
  ComposeSubmitInput,
  ComposeSubmitHandlerResult,
  ComposableFormHookResult,
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
  InputProps,
  TextInputHookFieldProps,
  SelectHookFieldProps,
  ComboBoxHookFieldProps,
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
  ComboBoxProps,
  ComboBoxOption,
  CheckboxProps,
  NumberInputProps,
  DatePickerProps,
  RadioGroupProps,
  RadioGroupOption,
  SwitchProps,
} from '@/partner-hook-utils'

// Domain hooks - Employee
export * from '@/components/Employee/exports/hooks'

// Domain hooks - Contractor
export * from '@/components/Contractor/exports/hooks'

// Domain hooks - Company
export * from '@/components/Company/exports/hooks'
