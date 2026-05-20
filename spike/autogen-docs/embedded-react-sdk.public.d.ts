import { AfterErrorContext } from '@gusto/embedded-api/hooks/types'
import { AfterErrorHook } from '@gusto/embedded-api/hooks/types'
import { AfterSuccessContext } from '@gusto/embedded-api/hooks/types'
import { AfterSuccessHook } from '@gusto/embedded-api/hooks/types'
import { Agencies } from '@gusto/embedded-api/models/components/childsupportdata'
import { AnchorHTMLAttributes } from 'react'
import { AriaAttributes } from 'react'
import { BeforeCreateRequestContext } from '@gusto/embedded-api/hooks/types'
import { BeforeCreateRequestHook } from '@gusto/embedded-api/hooks/types'
import { BeforeRequestContext } from '@gusto/embedded-api/hooks/types'
import { BeforeRequestHook } from '@gusto/embedded-api/hooks/types'
import { ButtonHTMLAttributes } from 'react'
import { Compensation } from '@gusto/embedded-api/models/components/compensation'
import { ComponentType } from 'react'
import { Contractor as Contractor_2 } from '@gusto/embedded-api/models/components/contractor'
import { ContractorAddress } from '@gusto/embedded-api/models/components/contractoraddress'
import { Control } from 'react-hook-form'
import { CustomTypeOptions } from 'i18next'
import { default as default_2 } from 'react'
import { Employee as Employee_2 } from '@gusto/embedded-api/models/components/employee'
import { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import { EmployeeFederalTax } from '@gusto/embedded-api/models/components/employeefederaltax'
import { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { EmployeeStateTaxesList } from '@gusto/embedded-api/models/components/employeestatetaxeslist'
import { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { ErrorInfo } from 'react'
import { FallbackProps } from 'react-error-boundary'
import { FieldsetHTMLAttributes } from 'react'
import { FieldValues } from 'react-hook-form'
import { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import { FocusEvent as FocusEvent_2 } from 'react'
import { Form } from '@gusto/embedded-api/models/components/form'
import { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { GarnishmentType } from '@gusto/embedded-api/models/components/garnishment'
import { HTMLAttributes } from 'react'
import { InputHTMLAttributes } from 'react'
import { Job } from '@gusto/embedded-api/models/components/job'
import { JSX } from 'react'
import { JSX as JSX_2 } from 'react/jsx-runtime'
import { JSXElementConstructor } from 'react'
import { Location as Location_2 } from '@gusto/embedded-api/models/components/location'
import { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { PaymentPeriod } from '@gusto/embedded-api/models/components/garnishmentchildsupport'
import { PaymentUnit } from '@gusto/embedded-api/models/components/compensation'
import { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import { PaySchedulePreviewPayPeriod } from '@gusto/embedded-api/models/components/payschedulepreviewpayperiod'
import { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { PolicyType as PolicyType_2 } from '@gusto/embedded-api/models/components/timeoffpolicy'
import { QueryClient } from '@tanstack/react-query'
import { ReactElement } from 'react'
import { ReactNode } from 'react'
import { Ref } from 'react'
import { RefObject } from 'react'
import { SelectHTMLAttributes } from 'react'
import { Signatory } from '@gusto/embedded-api/models/components/signatory'
import { SyntheticEvent } from 'react'
import { TableHTMLAttributes } from 'react'
import { TextareaHTMLAttributes } from 'react'
import { UseFormProps } from 'react-hook-form'
import { UseFormReturn } from 'react-hook-form'
import { UseQueryResult } from '@tanstack/react-query'
import { z } from 'zod'

export declare const ACCOUNT_TYPES: readonly ['Checking', 'Savings']

declare function AccountNumberField(props: AccountNumberFieldProps): JSX_2.Element

export declare type AccountNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<AccountNumberValidation>
>

export declare type AccountNumberValidation = (typeof BankFormErrorCodes)[keyof Pick<
  typeof BankFormErrorCodes,
  'REQUIRED' | 'INVALID_ACCOUNT_NUMBER'
>]

export declare type AccountType = (typeof ACCOUNT_TYPES)[number]

declare function AccountTypeField(props: AccountTypeFieldProps): JSX_2.Element

export declare type AccountTypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<BankFormRequiredValidation, AccountType>
>

declare type AccrualMethod = 'per_hour_paid' | 'per_calendar_year' | 'unlimited'

declare type AccrualMethodFixed = 'per_pay_period' | 'all_at_once'

declare function AddEmployeesHoliday(props: AddEmployeesHolidayProps): JSX_2.Element

declare interface AddEmployeesHolidayProps extends BaseComponentInterface {
  companyId: string
}

declare function AddEmployeesToPolicy(props: AddEmployeesToPolicyProps): JSX_2.Element

declare interface AddEmployeesToPolicyProps extends BaseComponentInterface {
  companyId: string
  policyId: string
  policyType: CreatableTimeOffPolicyType
}

declare function Address(props: AddressProps): JSX_2.Element

declare type AddressDefaultValues = RequireAtLeastOne<
  Pick<ContractorAddress, 'street1' | 'street2' | 'city' | 'state' | 'zip'>
>

declare interface AddressProps extends BaseComponentInterface<'Contractor.Address'> {
  contractorId: string
  defaultValues?: AddressDefaultValues
  children?: ReactNode
  className?: string
}

declare function AdjustForMinimumWageField(props: AdjustForMinimumWageFieldProps): JSX_2.Element

export declare type AdjustForMinimumWageFieldProps = HookFieldProps<CheckboxHookFieldProps>

export { AfterErrorContext }

export { AfterErrorHook }

export { AfterSuccessContext }

export { AfterSuccessHook }

export declare interface AlertProps {
  /**
   * The visual status that the alert should convey
   */
  status?: 'info' | 'success' | 'warning' | 'error'
  /**
   * The label text for the alert
   */
  label: string
  /**
   * Optional children to be rendered inside the alert
   */
  children?: ReactNode
  /**
   * Optional custom icon component to override the default icon
   */
  icon?: ReactNode
  /**
   * CSS className to be applied
   */
  className?: string
  /**
   * Optional callback function called when the dismiss button is clicked
   */
  onDismiss?: () => void
  /**
   * Whether to disable scrolling the alert into view and focusing it on mount. Set to true when using inside modals.
   */
  disableScrollIntoView?: boolean
}

declare function AmountField(props: DeductionAmountFieldProps): JSX_2.Element

declare function AmountField_2(props: ChildSupportGarnishmentAmountFieldProps): JSX_2.Element

declare function AnchorEndOfPayPeriodField(props: AnchorEndOfPayPeriodFieldProps): JSX_2.Element

export declare type AnchorEndOfPayPeriodFieldProps = HookFieldProps<
  DatePickerHookFieldProps<PayScheduleRequiredValidation>
>

declare function AnchorPayDateField(props: AnchorPayDateFieldProps): JSX_2.Element

export declare type AnchorPayDateFieldProps = HookFieldProps<
  DatePickerHookFieldProps<PayScheduleRequiredValidation>
>

declare function AnnualMaximumField(props: AnnualMaximumFieldProps): JSX_2.Element

export declare type AnnualMaximumFieldProps = HookFieldProps<
  NumberInputHookFieldProps<DeductionFormCapValidation>
>

export declare interface APIConfig {
  baseUrl: string
  headers?: HeadersInit
  hooks?: SDKHooks
  observability?: ObservabilityHook
}

declare interface ApiPayrollBlocker {
  key: string
  message?: string
}

export declare function ApiProvider({
  url,
  headers,
  hooks,
  children,
  queryClient: queryClientFromProps,
}: ApiProviderProps): JSX_2.Element

export declare interface ApiProviderProps {
  url: string
  headers?: HeadersInit
  hooks?: SDKHooks
  children: React.ReactNode
  queryClient?: QueryClient
}

declare function AssignSignatory(props: AssignSignatoryProps): JSX_2.Element

declare type AssignSignatoryDefaultValues = RequireAtLeastOne<{
  create?: CreateSignatoryDefaultValues
  invite?: InviteSignatoryDefaultValues
}>

declare interface AssignSignatoryProps extends BaseComponentInterface<'Company.AssignSignatory'> {
  companyId: string
  signatoryId?: string
  defaultValues?: AssignSignatoryDefaultValues
}

export declare interface BadgeProps extends Pick<
  HTMLAttributes<HTMLSpanElement>,
  'className' | 'id' | 'aria-label'
> {
  /**
   * Content to be displayed inside the badge
   */
  children: ReactNode
  /**
   * Visual style variant of the badge
   */
  status?: 'success' | 'warning' | 'error' | 'info'
  /**
   * Optional callback when the dismiss button is clicked. When provided, a dismiss button is rendered inside the badge.
   */
  onDismiss?: () => void
  /**
   * Accessible label for the dismiss button
   */
  dismissAriaLabel?: string
  /**
   * Whether the badge interaction is disabled
   */
  isDisabled?: boolean
}

declare function BankAccount(props: BankAccountProps): JSX_2.Element

declare interface BankAccountProps extends BaseComponentInterface<'Company.BankAccount'> {
  companyId: string
}

export declare type BankFormData = {
  [K in keyof typeof fieldValidators_8]: z.infer<(typeof fieldValidators_8)[K]>
}

export declare type BankFormErrorCode = (typeof BankFormErrorCodes)[keyof typeof BankFormErrorCodes]

export declare const BankFormErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
  readonly INVALID_ROUTING_NUMBER: 'INVALID_ROUTING_NUMBER'
  readonly INVALID_ACCOUNT_NUMBER: 'INVALID_ACCOUNT_NUMBER'
}

export declare type BankFormField = keyof typeof fieldValidators_8

export declare interface BankFormFields {
  Name: typeof NameField
  RoutingNumber: typeof RoutingNumberField
  AccountNumber: typeof AccountNumberField
  AccountType: typeof AccountTypeField
}

export declare type BankFormFieldsMetadata = UseBankFormReady['form']['fieldsMetadata']

export declare type BankFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_7
>

export declare type BankFormOutputs = BankFormData

export declare type BankFormRequiredValidation = typeof BankFormErrorCodes.REQUIRED

declare interface BankFormSchemaOptions {
  optionalFieldsToRequire?: BankFormOptionalFieldsToRequire
}

export declare interface BankFormSubmitOptions {
  /** Override the `employeeId` configured at hook construction. Useful when the employee is created in the same submit chain. */
  employeeId?: string
}

export declare interface BannerProps extends Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'id' | 'aria-label'
> {
  /**
   * Title content displayed in the colored header section
   */
  title: ReactNode
  /**
   * Content to be displayed in the main content area
   */
  children: ReactNode
  /**
   * Visual status variant of the banner
   */
  status?: 'warning' | 'error'
}

declare interface BaseBoundariesProps {
  children?: ReactNode
  FallbackComponent?: (props: FallbackProps) => JSX.Element
  onErrorBoundaryError?: (error: unknown, info: ErrorInfo) => void
  componentName?: string
}

declare interface BaseComponentInterface<
  TResourceKey extends keyof Resources = keyof Resources,
> extends CommonComponentInterface<TResourceKey> {
  FallbackComponent?: BaseBoundariesProps['FallbackComponent']
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
  onEvent: OnEventType<EventType, unknown>
}

declare type BaseDataViewProps<T> = {
  columns: DataViewColumn<T>[]
  data: T[]
  pagination?: PaginationControlProps
  itemMenu?: (item: T) => React.ReactNode
  emptyState?: () => React.ReactNode
  footer?: () => Partial<Record<FooterKeys<T>, React.ReactNode>>
  isFetching?: boolean
}

export declare interface BaseFieldProps {
  label: string
  description?: default_2.ReactNode
}

/**
 * Base shape for form hooks in the ready state.
 * Individual hooks override `data`, `actions`, and `form`.
 *
 * `status.mode` matches {@link HookSubmitResult} (`create` | `update`). Document-sign hooks
 * surface `mode: 'create'` only — that reflects the submit/API contract, not “create entity”
 * in the domain sense.
 */
export declare interface BaseFormHookReady<
  TFieldsMetadata extends FieldsMetadata = FieldsMetadata,
  TFormData extends FieldValues = FieldValues,
  TFields extends object = Record<string, unknown>,
> {
  isLoading: false
  data: Record<string, unknown>
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: Record<string, unknown>
  errorHandling: HookErrorHandling
  form: {
    Fields: TFields
    fieldsMetadata: TFieldsMetadata
    hookFormInternals: HookFormInternals<TFormData>
    getFormSubmissionValues: () => Record<string, unknown> | undefined
  }
}

/**
 * Base shape for non-form hooks in the ready (loaded) state.
 * Pass `TData` / `TStatus` so each hook narrows payload and status without `Omit` + rewrite.
 */
export declare interface BaseHookReady<
  TData extends Record<string, unknown> = Record<string, unknown>,
  TStatus extends Record<string, unknown> = Record<string, unknown>,
> {
  isLoading: false
  data: TData
  status: TStatus
  errorHandling: HookErrorHandling
}

declare interface BaseListProps {
  /**
   * The list items to render
   */
  items: ReactNode[]
  /**
   * Optional custom class name
   */
  className?: string
  /**
   * Accessibility label for the list
   */
  'aria-label'?: string
  /**
   * ID of an element that labels this list
   */
  'aria-labelledby'?: string
  /**
   * ID of an element that describes this list
   */
  'aria-describedby'?: string
}

declare interface BaseStateTaxFieldProps {
  /** Overrides the API-supplied label. When omitted, falls back to `question.label`. */
  label?: string
  /** Overrides the API-supplied description. When omitted, falls back to `question.description`
   *  (sanitized internally by the underlying field via DOMPurify). */
  description?: ReactNode
  formHookResult?: FormHookResult
  /** Override the default localized validation message(s). */
  validationMessages?: StateTaxValidationMessages
}

export { BeforeCreateRequestContext }

export { BeforeCreateRequestHook }

export { BeforeRequestContext }

export { BeforeRequestHook }

export declare interface BoxHeaderProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export declare interface BoxProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  withPadding?: boolean
  className?: string
}

declare interface Breadcrumb {
  id: string
  label: ReactNode
  /**
   * When false, the breadcrumb is rendered as plain text even if onClick is provided.
   * Defaults to true.
   */
  isClickable?: boolean
}

export declare interface BreadcrumbsProps {
  /**
   * Array of breadcrumbs
   */
  breadcrumbs: Breadcrumb[]
  /**
   * Current breadcrumb id
   */
  currentBreadcrumbId?: string
  /**
   * Accessibility label for the breadcrumbs
   */
  'aria-label'?: string
  /**
   * Additional CSS class name for the breadcrumbs container
   */
  className?: string
  /**
   * Event handler for breadcrumb navigation
   */
  onClick?: (id: string) => void
  /**
   * Passed to the breadcrumbs when the container size is small (640px and below)
   * At this size, the breadcrumb typically does not have sufficient size to render
   * completely. In our implementation, we switch to a condensed mobile version of
   * the breadcrumbs
   */
  isSmallContainer?: boolean
}

declare type BreadcrumbTrail = Record<string, FlowBreadcrumb[]>

declare type BuildFormSchemaResult<T extends Record<string, z.ZodType>> = [
  schema: z.ZodType<FormDataFromValidators<T>, FormDataFromValidators<T>>,
  metadataConfig: FieldsMetadataConfig<T>,
]

export declare type ButtonIconProps = ButtonProps & {
  /**
   * Required aria-label for icon buttons to ensure accessibility
   */
  'aria-label': string
}

export declare interface ButtonProps extends Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'name'
  | 'id'
  | 'className'
  | 'type'
  | 'onClick'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'form'
  | 'title'
  | 'tabIndex'
> {
  /**
   * React ref for the button element
   */
  buttonRef?: Ref<HTMLButtonElement>
  /**
   * Visual style variant of the button
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error'
  /**
   * Shows a loading spinner and disables the button
   */
  isLoading?: boolean
  /**
   * Disables the button and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Optional leading icon rendered before children
   */
  icon?: ReactNode
  /**
   * Content to be rendered inside the button
   */
  children?: ReactNode
  /**
   * Handler for blur events
   */
  onBlur?: (e: FocusEvent_2) => void
  /**
   * Handler for focus events
   */
  onFocus?: (e: FocusEvent_2) => void
}

export declare type CalendarPreviewProps = {
  /**
   * Array of dates to highlight with custom colors and labels
   */
  highlightDates?: Array<{
    /**
     * Date to highlight
     */
    date: Date
    /**
     * Color to use for highlighting
     */
    highlightColor: 'primary' | 'secondary'
    /**
     * Label text for the highlighted date
     */
    label: string
  }>
  /**
   * Date range to display in the calendar preview
   */
  dateRange: {
    /**
     * Start date of the range
     */
    start: Date
    /**
     * End date of the range
     */
    end: Date
    /**
     * Label text for the date range
     */
    label: string
  }
}

export declare interface CardProps {
  /**
   * Content to be displayed inside the card
   */
  children: ReactNode
  /**
   * Optional menu component to be displayed on the right side of the card
   */
  menu?: ReactNode
  /**
   * CSS className to be applied
   */
  className?: string
  /**
   * Optional action element (e.g., checkbox, radio) to be displayed on the left side
   */
  action?: ReactNode
}

declare function CaseNumberField(props: CaseNumberFieldProps): JSX_2.Element

export declare type CaseNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<ChildSupportGarnishmentRequiredValidation>
>

export declare interface CheckboxGroupOption {
  /**
   * Label text or content for the checkbox option
   */
  label: React.ReactNode
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
  /**
   * Disables this specific checkbox option
   */
  isDisabled?: boolean
  /**
   * Optional description text for the checkbox option
   */
  description?: React.ReactNode
}

export declare interface CheckboxGroupProps
  extends SharedFieldLayoutProps, Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  /**
   * Indicates if the checkbox group is in an invalid state
   */
  isInvalid?: boolean
  /**
   * Disables all checkbox options in the group
   */
  isDisabled?: boolean
  /**
   * Array of checkbox options to display
   */
  options: Array<CheckboxGroupOption>
  /**
   * Array of currently selected values
   */
  value?: string[]
  /**
   * Callback when selection changes
   */
  onChange?: (value: string[]) => void
  /**
   * React ref for the first checkbox input element
   */
  inputRef?: Ref<HTMLInputElement>
}

export declare function CheckboxHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  FieldComponent,
}: CheckboxHookFieldProps<TErrorCode>): ReactElement<unknown, string | JSXElementConstructor<any>>

export declare interface CheckboxHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<CheckboxProps>
}

export declare interface CheckboxProps
  extends
    SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id' | 'className'> {
  /**
   * Current checked state of the checkbox
   */
  value?: boolean
  /**
   * Callback when checkbox state changes
   */
  onChange?: (value: boolean) => void
  /**
   * React ref for the checkbox input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Indicates if the checkbox is in an invalid state
   */
  isInvalid?: boolean
  /**
   * Disables the checkbox and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Handler for blur events
   */
  onBlur?: () => void
}

export declare type ChildSupportGarnishmentAmountFieldProps = HookFieldProps<
  NumberInputHookFieldProps<ChildSupportGarnishmentAmountValidation>
>

export declare type ChildSupportGarnishmentAmountValidation =
  | ChildSupportGarnishmentRequiredValidation
  | ChildSupportGarnishmentPercentValidation

export declare type ChildSupportGarnishmentFormData = {
  [K in keyof typeof fieldValidators_2]: z.infer<(typeof fieldValidators_2)[K]>
}

export declare type ChildSupportGarnishmentFormErrorCode =
  (typeof ChildSupportGarnishmentFormErrorCodes)[keyof typeof ChildSupportGarnishmentFormErrorCodes]

export declare const ChildSupportGarnishmentFormErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
  readonly NEGATIVE_AMOUNT: 'NEGATIVE_AMOUNT'
  readonly PERCENT_OUT_OF_RANGE: 'PERCENT_OUT_OF_RANGE'
}

export declare interface ChildSupportGarnishmentFormFields {
  State: typeof StateField
  /** Only available when the selected agency has more than one fips code, or the
   *  sole code is county-scoped (not an "all counties" auto-pick). */
  FipsCode: typeof FipsCodeField | undefined
  /** Only available when the selected agency requires `case_number`. */
  CaseNumber: typeof CaseNumberField | undefined
  /** Only available when the selected agency requires `order_number`. */
  OrderNumber: typeof OrderNumberField | undefined
  /** Only available when the selected agency requires `remittance_number`. */
  RemittanceNumber: typeof RemittanceNumberField | undefined
  PayPeriodMaximum: typeof PayPeriodMaximumField
  Amount: typeof AmountField_2
  PaymentPeriod: typeof PaymentPeriodField
}

export declare type ChildSupportGarnishmentFormFieldsMetadata =
  UseChildSupportGarnishmentFormReady['form']['fieldsMetadata']

export declare type ChildSupportGarnishmentFormOutputs = ChildSupportGarnishmentFormData

declare interface ChildSupportGarnishmentFormSchemaOptions {
  mode?: 'create' | 'update'
  /**
   * The agency record matching the currently selected `state`. The agency's
   * `requiredAttributes` determine which of `caseNumber` / `orderNumber` /
   * `remittanceNumber` are required. When omitted (no agency selected yet),
   * all three are optional.
   */
  selectedAgency?: Agencies | null
}

export declare type ChildSupportGarnishmentNegativeAmountValidation =
  typeof ChildSupportGarnishmentFormErrorCodes.NEGATIVE_AMOUNT

export declare type ChildSupportGarnishmentPercentValidation =
  typeof ChildSupportGarnishmentFormErrorCodes.PERCENT_OUT_OF_RANGE

export declare type ChildSupportGarnishmentRequiredValidation =
  typeof ChildSupportGarnishmentFormErrorCodes.REQUIRED

export declare type ChildSupportGarnishmentStateFieldProps = HookFieldProps<
  SelectHookFieldProps<ChildSupportGarnishmentRequiredValidation, StateFieldEntry>
>

declare function CityField(props: CityFieldProps): JSX_2.Element

export declare type CityFieldProps = HookFieldProps<
  TextInputHookFieldProps<HomeAddressRequiredValidation>
>

export declare function collectErrors(
  queries: QueryWithError[],
  submitError: SDKError | null,
): SDKError[]

export declare interface ComboBoxOption {
  /**
   * Display text for the option
   */
  label: string
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
}

export declare interface ComboBoxProps
  extends
    SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  /**
   * Disables the combo box and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Label text for the combo box field
   */
  label: string
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Array of options to display in the dropdown
   */
  options: ComboBoxOption[]
  /**
   * Currently selected value
   */
  value?: string | null
  /**
   * React ref for the combo box input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Allows the user to type any value, not just options in the list.
   * The options list becomes a suggestion helper rather than a strict constraint.
   */
  allowsCustomValue?: boolean
  /**
   * Element to use as the portal container for the dropdown popover.
   * Overrides the default SDK root container from context.
   */
  portalContainer?: HTMLElement
}

declare interface CommonComponentInterface<TResourceKey extends keyof Resources = keyof Resources> {
  children?: ReactNode
  className?: string
  defaultValues?: unknown
  dictionary?: ResourceDictionary<TResourceKey>
}

export declare namespace Company {
  export {
    Industry,
    AssignSignatory,
    CreateSignatory,
    InviteSignatory,
    DocumentList,
    SignatureForm,
    DocumentSigner,
    OnboardingOverview,
    Locations,
    LocationForm,
    PaySchedule,
    FederalTaxes,
    BankAccount,
    StateTaxesList,
    StateTaxesForm,
    StateTaxes,
    OnboardingFlow,
  }
}

export declare namespace CompanyOnboarding {
  export {
    OnboardingFlow,
    OnboardingOverview,
    DocumentSigner,
    DocumentList,
    SignatureForm,
    Industry,
    BankAccount,
    Locations,
    LocationForm,
    PaySchedule,
    FederalTaxes,
    StateTaxes,
    StateTaxesForm,
    StateTaxesList,
    AssignSignatory,
    CreateSignatory,
    InviteSignatory,
  }
}

declare function Compensation_2(props: CompensationProps): JSX_2.Element

declare namespace Compensation_2 {
  var JobsList: JobsList
  var EditCompensation: EditCompensation
}

declare type CompensationDefaultValues = RequireAtLeastOne<{
  rate?: Job['rate']
  title?: Job['title']
  paymentUnit?: (typeof PAY_PERIODS)[keyof typeof PAY_PERIODS]
  flsaStatus?: FlsaStatusType
}>

export declare type CompensationEffectiveDateFieldProps = HookFieldProps<
  DatePickerHookFieldProps<CompensationEffectiveDateValidation>
>

export declare type CompensationEffectiveDateValidation = (typeof CompensationErrorCodes)[
  | 'REQUIRED'
  | 'EFFECTIVE_DATE_BEFORE_HIRE']

export declare type CompensationErrorCode =
  (typeof CompensationErrorCodes)[keyof typeof CompensationErrorCodes]

export declare const CompensationErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
  readonly RATE_MINIMUM: 'RATE_MINIMUM'
  readonly RATE_EXEMPT_THRESHOLD: 'RATE_EXEMPT_THRESHOLD'
  readonly PAYMENT_UNIT_OWNER: 'PAYMENT_UNIT_OWNER'
  readonly PAYMENT_UNIT_COMMISSION: 'PAYMENT_UNIT_COMMISSION'
  readonly RATE_COMMISSION_ZERO: 'RATE_COMMISSION_ZERO'
  readonly EFFECTIVE_DATE_BEFORE_HIRE: 'EFFECTIVE_DATE_BEFORE_HIRE'
}

export declare type CompensationFieldsMetadata = UseCompensationFormReady['form']['fieldsMetadata']

export declare type CompensationFormData = {
  [K in keyof typeof fieldValidators_3]: z.infer<(typeof fieldValidators_3)[K]>
}

export declare interface CompensationFormFields {
  Title: typeof TitleField
  FlsaStatus: typeof FlsaStatusField | undefined
  Rate: typeof RateField
  PaymentUnit: typeof PaymentUnitField
  AdjustForMinimumWage: typeof AdjustForMinimumWageField | undefined
  MinimumWageId: typeof MinimumWageIdField | undefined
  EffectiveDate: typeof EffectiveDateField | undefined
}

export declare type CompensationFormOutputs = CompensationFormData

export declare type CompensationOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_2
>

declare interface CompensationProps extends BaseComponentInterface<'Employee.Compensation'> {
  employeeId: string
  startDate: string
  defaultValues?: CompensationDefaultValues
}

export declare type CompensationRequiredValidation = typeof CompensationErrorCodes.REQUIRED

export declare interface CompensationSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: CompensationOptionalFieldsToRequire
  /**
   * Lower bound for `effectiveDate` (typically the parent job's `hireDate`).
   * Only enforced in `create` mode — on `update` the loaded effective date
   * may legitimately predate the hire date and is left as-is. Surfaces an
   * `EFFECTIVE_DATE_BEFORE_HIRE` issue when violated.
   */
  hireDate?: string | null
  /**
   * When `false`, drops `effectiveDate` from the validated shape — the field
   * becomes hook-managed (e.g. seeded from the parent job's `hireDate` during
   * onboarding). Partners may still supply the value at submit time via
   * `CompensationSubmitOptions.effectiveDate`. Defaults to `true`.
   */
  withEffectiveDateField?: boolean
}

export declare interface CompensationSubmitOptions {
  /** Override jobId — required when creating a compensation if not configured at hook construction (e.g. when the parent job was just created in the same submit chain). */
  jobId?: string
  /** Override compensationId — when present, forces update (PUT) routing regardless of hook construction. */
  compensationId?: string
  /**
   * Compensation version for optimistic locking on PUT. Required when forcing
   * update routing post-create (e.g. updating the auto-created stub returned
   * from `POST /v1/employees/:id/jobs`). When omitted, the hook reads the
   * version from its cached `currentCompensation`.
   */
  compensationVersion?: string
  /**
   * Supply `effectiveDate` at submit time. When `withEffectiveDateField`
   * is `true`, this overrides the form's value. When `withEffectiveDateField`
   * is `false`, this is the only way to put `effective_date` on the wire —
   * the form value is not read in that mode (matching the options-only
   * convention of `useWorkAddressForm` / `useHomeAddressForm` / `useJobForm`).
   */
  effectiveDate?: string
}

export declare type CompensationTitleFieldProps = HookFieldProps<
  TextInputHookFieldProps<CompensationRequiredValidation>
>

export declare const componentEvents: {
  readonly TIME_OFF_CREATE_POLICY: 'timeOff/createPolicy'
  readonly TIME_OFF_VIEW_POLICY: 'timeOff/viewPolicy'
  readonly TIME_OFF_POLICY_TYPE_SELECTED: 'timeOff/policyTypeSelected'
  readonly TIME_OFF_POLICY_DETAILS_DONE: 'timeOff/policyDetails/done'
  readonly TIME_OFF_POLICY_SETTINGS_DONE: 'timeOff/policySettings/done'
  readonly TIME_OFF_POLICY_SETTINGS_BACK: 'timeOff/policySettings/back'
  readonly TIME_OFF_ADD_EMPLOYEES_DONE: 'timeOff/addEmployees/done'
  readonly TIME_OFF_ADD_EMPLOYEES_BACK: 'timeOff/addEmployees/back'
  readonly TIME_OFF_HOLIDAY_SELECTION_DONE: 'timeOff/holidaySelection/done'
  readonly TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE: 'timeOff/holidayAddEmployees/done'
  readonly TIME_OFF_VIEW_POLICY_DETAILS: 'timeOff/viewPolicyDetails'
  readonly TIME_OFF_VIEW_POLICY_EMPLOYEES: 'timeOff/viewPolicyEmployees'
  readonly TIME_OFF_VIEW_HOLIDAY_EMPLOYEES: 'timeOff/viewHolidayEmployees'
  readonly TIME_OFF_VIEW_HOLIDAY_SCHEDULE: 'timeOff/viewHolidaySchedule'
  readonly TIME_OFF_BACK_TO_LIST: 'timeOff/backToList'
  readonly TIME_OFF_POLICY_CREATE_ERROR: 'timeOff/policyCreate/error'
  readonly TIME_OFF_POLICY_SETTINGS_ERROR: 'timeOff/policySettings/error'
  readonly TIME_OFF_ADD_EMPLOYEES_ERROR: 'timeOff/addEmployees/error'
  readonly TIME_OFF_HOLIDAY_CREATE_ERROR: 'timeOff/holidayCreate/error'
  readonly TIME_OFF_HOLIDAY_ADD_EMPLOYEES_ERROR: 'timeOff/holidayAddEmployees/error'
  readonly TIME_OFF_EDIT_POLICY: 'timeOff/editPolicy'
  readonly TIME_OFF_CHANGE_SETTINGS: 'timeOff/changeSettings'
  readonly TIME_OFF_ADD_EMPLOYEES_TO_POLICY: 'timeOff/addEmployeesToPolicy'
  readonly TIME_OFF_HOLIDAY_ADD_EMPLOYEES: 'timeOff/holidayAddEmployees'
  readonly TIME_OFF_EDIT_HOLIDAY_POLICY: 'timeOff/editHolidayPolicy'
  readonly TIME_OFF_HOLIDAY_SELECTION_EDIT_DONE: 'timeOff/holidaySelection/editDone'
  readonly TIME_OFF_DELETE_POLICY_DONE: 'timeOff/deletePolicy/done'
  readonly EMPLOYEE_TERMINATION_CREATED: 'employee/termination/created'
  readonly EMPLOYEE_TERMINATION_UPDATED: 'employee/termination/updated'
  readonly EMPLOYEE_TERMINATION_PAYROLL_CREATED: 'employee/termination/payroll/created'
  readonly EMPLOYEE_TERMINATION_PAYROLL_FAILED: 'employee/termination/payroll/failed'
  readonly EMPLOYEE_TERMINATION_DONE: 'employee/termination/done'
  readonly EMPLOYEE_TERMINATION_CANCELLED: 'employee/termination/cancelled'
  readonly EMPLOYEE_TERMINATION_EDIT: 'employee/termination/edit'
  readonly EMPLOYEE_TERMINATION_RUN_PAYROLL: 'employee/termination/runPayroll'
  readonly EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL: 'employee/termination/runOffCyclePayroll'
  readonly EMPLOYEE_TERMINATION_VIEW_SUMMARY: 'employee/termination/viewSummary'
  readonly OFF_CYCLE_CREATED: 'offCycle/created'
  readonly DISMISSAL_PAY_PERIOD_SELECTED: 'dismissal/payPeriod/selected'
  readonly TRANSITION_CREATED: 'transition/created'
  readonly RUN_TRANSITION_PAYROLL: 'transition/runPayroll'
  readonly TRANSITION_PAYROLL_SKIPPED: 'transition/payrollSkipped'
  readonly CONTRACTOR_PAYMENT_CREATE: 'contractor/payments/create'
  readonly CONTRACTOR_PAYMENT_EDIT: 'contractor/payments/edit'
  readonly CONTRACTOR_PAYMENT_UPDATE: 'contractor/payments/update'
  readonly CONTRACTOR_PAYMENT_PREVIEW: 'contractor/payments/preview'
  readonly CONTRACTOR_PAYMENT_BACK_TO_EDIT: 'contractor/payments/backToEdit'
  readonly CONTRACTOR_PAYMENT_CREATED: 'contractor/payments/created'
  readonly CONTRACTOR_PAYMENT_SUBMIT: 'contractor/payments/submit'
  readonly CONTRACTOR_PAYMENT_VIEW: 'contractor/payments/view'
  readonly CONTRACTOR_PAYMENT_VIEW_DETAILS: 'contractor/payments/view/details'
  readonly CONTRACTOR_PAYMENT_CANCEL: 'contractor/payments/cancel'
  readonly CONTRACTOR_PAYMENT_EXIT: 'contractor/payments/exit'
  readonly CONTRACTOR_PAYMENT_RFI_RESPOND: 'contractor/payments/rfi/respond'
  readonly RECOVERY_CASE_RESOLVE: 'recoveryCase/resolve'
  readonly RECOVERY_CASE_RESUBMIT: 'recoveryCase/resubmit'
  readonly RECOVERY_CASE_RESUBMIT_CANCEL: 'recoveryCase/resubmit/cancel'
  readonly RECOVERY_CASE_RESUBMIT_DONE: 'recoveryCase/resubmit/done'
  readonly INFORMATION_REQUEST_RESPOND: 'informationRequest/respond'
  readonly INFORMATION_REQUEST_FORM_SUBMIT: 'informationRequest/form/submit'
  readonly INFORMATION_REQUEST_FORM_CANCEL: 'informationRequest/form/cancel'
  readonly INFORMATION_REQUEST_FORM_DONE: 'informationRequest/form/done'
  readonly PAYROLL_WIRE_START_TRANSFER: 'payroll/wire/startTransfer'
  readonly PAYROLL_WIRE_INSTRUCTIONS_DONE: 'payroll/wire/instructions/done'
  readonly PAYROLL_WIRE_INSTRUCTIONS_CANCEL: 'payroll/wire/instructions/cancel'
  readonly PAYROLL_WIRE_INSTRUCTIONS_SELECT: 'payroll/wire/instructions/select'
  readonly PAYROLL_WIRE_FORM_DONE: 'payroll/wire/form/done'
  readonly PAYROLL_WIRE_FORM_CANCEL: 'payroll/wire/form/cancel'
  readonly RUN_PAYROLL_BACK: 'runPayroll/back'
  readonly RUN_PAYROLL_CALCULATED: 'runPayroll/calculated'
  readonly RUN_PAYROLL_CANCELLED: 'runPayroll/cancelled'
  readonly RUN_PAYROLL_CANCELLED_ALERT_DISMISSED: 'runPayroll/cancelled/alertDismissed'
  readonly RUN_PAYROLL_EDIT: 'runPayroll/edit'
  readonly RUN_PAYROLL_EMPLOYEE_EDIT: 'runPayroll/employee/edit'
  readonly RUN_PAYROLL_EMPLOYEE_SKIP: 'runPayroll/employee/skip'
  readonly RUN_PAYROLL_EMPLOYEE_SAVED: 'runPayroll/employee/saved'
  readonly RUN_PAYROLL_EMPLOYEE_CANCELLED: 'runPayroll/employee/cancelled'
  readonly RUN_PAYROLL_SELECTED: 'runPayroll/selected'
  readonly RUN_OFF_CYCLE_PAYROLL: 'runPayroll/offCycle/start'
  readonly OFF_CYCLE_SELECT_REASON: 'offCycle/selectReason'
  readonly OFF_CYCLE_DEDUCTIONS_CHANGE: 'offCycle/deductionsChange'
  readonly RUN_PAYROLL_SUBMITTED: 'runPayroll/submitted'
  readonly RUN_PAYROLL_SUBMITTING: 'runPayroll/submitting'
  readonly RUN_PAYROLL_SUMMARY_VIEWED: 'runPayroll/summary/viewed'
  readonly RUN_PAYROLL_RECEIPT_GET: 'runPayroll/receipt/get'
  readonly RUN_PAYROLL_RECEIPT_VIEWED: 'runPayroll/receipt/viewed'
  readonly RUN_PAYROLL_PROCESSED: 'runPayroll/processed'
  readonly RUN_PAYROLL_PROCESSING_FAILED: 'runPayroll/processingFailed'
  readonly RUN_PAYROLL_PDF_PAYSTUB_VIEWED: 'runPayroll/pdfPaystub/viewed'
  readonly RUN_PAYROLL_BLOCKERS_DETECTED: 'runPayroll/blockers/detected'
  readonly RUN_PAYROLL_BLOCKER_RESOLUTION_ATTEMPTED: 'runPayroll/blocker/resolutionAttempted'
  readonly RUN_PAYROLL_BLOCKERS_VIEW_ALL: 'runPayroll/blockers/viewAll'
  readonly RUN_PAYROLL_DATES_CONFIGURED: 'runPayroll/dates/configured'
  readonly REVIEW_PAYROLL: 'payroll/review'
  readonly PAYROLL_SKIPPED: 'payroll/skipped'
  readonly PAYROLL_DELETED: 'payroll/deleted'
  readonly PAYROLL_EXIT_FLOW: 'payroll/saveAndExit'
  readonly RUN_PAYROLL_GROSS_UP_SELECTED: 'runPayroll/grossUp/selected'
  readonly RUN_PAYROLL_GROSS_UP_CALCULATED: 'runPayroll/grossUp/calculated'
  readonly CONTRACTOR_ADDRESS_UPDATED: 'contractor/address/updated'
  readonly CONTRACTOR_ADDRESS_DONE: 'contractor/address/done'
  readonly CONTRACTOR_PAYMENT_METHOD_UPDATED: 'contractor/paymentMethod/updated'
  readonly CONTRACTOR_BANK_ACCOUNT_CREATED: 'contractor/bankAccount/created'
  readonly CONTRACTOR_PAYMENT_METHOD_DONE: 'contractor/paymentMethod/done'
  readonly CONTRACTOR_CREATE: 'contractor/create'
  readonly CONTRACTOR_CREATED: 'contractor/created'
  readonly CONTRACTOR_UPDATE: 'contractor/update'
  readonly CONTRACTOR_UPDATED: 'contractor/updated'
  readonly CONTRACTOR_DELETED: 'contractor/deleted'
  readonly CONTRACTOR_PROFILE_DONE: 'contractor/profile/done'
  readonly CONTRACTOR_NEW_HIRE_REPORT_UPDATED: 'contractor/newHireReport/updated'
  readonly CONTRACTOR_NEW_HIRE_REPORT_DONE: 'contractor/newHireReport/done'
  readonly CONTRACTOR_SUBMIT_DONE: 'contractor/submit/done'
  readonly CONTRACTOR_ONBOARDING_STATUS_UPDATED: 'contractor/onboardingStatus/updated'
  readonly CONTRACTOR_INVITE_CONTRACTOR: 'contractor/invite/selfOnboarding'
  readonly CONTRACTOR_ONBOARDING_CONTINUE: 'contractor/onboarding/continue'
  readonly PAY_SCHEDULE_CREATE: 'paySchedule/create'
  readonly PAY_SCHEDULE_CREATED: 'paySchedule/created'
  readonly PAY_SCHEDULE_UPDATE: 'paySchedule/update'
  readonly PAY_SCHEDULE_UPDATED: 'paySchedule/updated'
  readonly PAY_SCHEDULE_DELETE: 'paySchedule/delete'
  readonly PAY_SCHEDULE_DELETED: 'paySchedule/deleted'
  readonly PAY_SCHEDULE_DONE: 'paySchedule/done'
  readonly COMPANY_INDUSTRY: 'company/industry'
  readonly COMPANY_INDUSTRY_SELECTED: 'company/industry/selected'
  readonly COMPANY_FEDERAL_TAXES_UPDATED: 'company/federalTaxes/updated'
  readonly COMPANY_FEDERAL_TAXES_DONE: 'company/federalTaxes/done'
  readonly COMPANY_SIGNATORY_CREATED: 'company/signatory/created'
  readonly COMPANY_SIGNATORY_INVITED: 'company/signatory/invited'
  readonly COMPANY_SIGNATORY_UPDATED: 'company/signatory/updated'
  readonly COMPANY_CREATE_SIGNATORY_DONE: 'company/signatory/createSignatory/done'
  readonly COMPANY_INVITE_SIGNATORY_DONE: 'company/signatory/inviteSignatory/done'
  readonly COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED: 'company/signatory/assignSignatory/modeUpdated'
  readonly COMPANY_ASSIGN_SIGNATORY_DONE: 'company/signatory/assignSignatory/done'
  readonly COMPANY_FORM_EDIT_SIGNATORY: 'company/forms/editSignatory'
  readonly COMPANY_FORMS_DONE: 'company/forms/done'
  readonly COMPANY_VIEW_FORM_TO_SIGN: 'company/forms/view'
  readonly COMPANY_SIGN_FORM: 'company/forms/sign/signForm'
  readonly COMPANY_SIGN_FORM_DONE: 'company/forms/sign/done'
  readonly COMPANY_SIGN_FORM_BACK: 'company/forms/sign/back'
  readonly COMPANY_LOCATION_CREATE: 'company/location/add'
  readonly COMPANY_LOCATION_CREATED: 'company/location/add/done'
  readonly COMPANY_LOCATION_EDIT: 'company/location/edit'
  readonly COMPANY_LOCATION_UPDATED: 'company/location/edit/done'
  readonly COMPANY_LOCATION_DONE: 'company/location/done'
  readonly COMPANY_BANK_ACCOUNT_CHANGE: 'company/bankAccount/change'
  readonly COMPANY_BANK_ACCOUNT_CANCEL: 'company/bankAccount/cancel'
  readonly COMPANY_BANK_ACCOUNT_CREATED: 'company/bankAccount/created'
  readonly COMPANY_BANK_ACCOUNT_VERIFY: 'company/bankAccount/verify'
  readonly COMPANY_BANK_ACCOUNT_DONE: 'company/bankAccount/done'
  readonly COMPANY_BANK_ACCOUNT_VERIFIED: 'company/bankAccount/verified'
  readonly COMPANY_STATE_TAX_UPDATED: 'company/stateTaxes/updated'
  readonly COMPANY_STATE_TAX_DONE: 'company/stateTaxes/done'
  readonly COMPANY_STATE_TAX_EDIT: 'company/stateTaxes/edit'
  readonly COMPANY_OVERVIEW_DONE: 'company/overview/done'
  readonly COMPANY_OVERVIEW_CONTINUE: 'company/overview/continue'
  readonly EMPLOYEE_CREATE: 'employee/create'
  readonly EMPLOYEE_CREATED: 'employee/created'
  readonly EMPLOYEE_UPDATE: 'employee/update'
  readonly EMPLOYEE_UPDATED: 'employee/updated'
  readonly EMPLOYEE_DELETED: 'employee/deleted'
  readonly EMPLOYEE_DISMISS: 'employee/dismiss'
  readonly EMPLOYEE_ONBOARDING_DONE: 'employee/onboarding/done'
  readonly EMPLOYEE_PROFILE_DONE: 'employee/profile/done'
  readonly EMPLOYEE_HOME_ADDRESS: 'employee/addresses/home'
  readonly EMPLOYEE_HOME_ADDRESS_UPDATE: 'employee/addresses/home/update'
  readonly EMPLOYEE_HOME_ADDRESS_CREATED: 'employee/addresses/home/created'
  readonly EMPLOYEE_HOME_ADDRESS_UPDATED: 'employee/addresses/home/updated'
  readonly EMPLOYEE_HOME_ADDRESS_DELETED: 'employee/addresses/home/deleted'
  readonly EMPLOYEE_WORK_ADDRESS: 'employee/addresses/work'
  readonly EMPLOYEE_WORK_ADDRESS_UPDATE: 'employee/addresses/work/update'
  readonly EMPLOYEE_WORK_ADDRESS_CREATED: 'employee/addresses/work/created'
  readonly EMPLOYEE_WORK_ADDRESS_UPDATED: 'employee/addresses/work/updated'
  readonly EMPLOYEE_WORK_ADDRESS_DELETED: 'employee/addresses/work/deleted'
  readonly EMPLOYEE_DEDUCTION_ADD: 'employee/deductions/add'
  readonly EMPLOYEE_DEDUCTION_CREATED: 'employee/deductions/created'
  readonly EMPLOYEE_DEDUCTION_UPDATED: 'employee/deductions/updated'
  readonly EMPLOYEE_DEDUCTION_DELETED: 'employee/deductions/deleted'
  readonly EMPLOYEE_DEDUCTION_DELETED_EMPTY: 'employee/deductions/deletedEmpty'
  readonly EMPLOYEE_DEDUCTION_DONE: 'employee/deductions/done'
  readonly EMPLOYEE_DEDUCTION_EDIT: 'employee/deductions/edit'
  readonly EMPLOYEE_DEDUCTION_CANCEL: 'employee/deductions/cancel'
  readonly EMPLOYEE_DEDUCTION_CANCEL_EMPTY: 'employee/deductions/cancelEmpty'
  readonly EMPLOYEE_DEDUCTION_INCLUDE_YES: 'employee/deductions/include/yes'
  readonly EMPLOYEE_DEDUCTION_INCLUDE_NO: 'employee/deductions/include/no'
  readonly EMPLOYEE_COMPENSATION_CREATE: 'employee/compensations/create'
  readonly EMPLOYEE_COMPENSATION_CREATED: 'employee/compensations/created'
  readonly EMPLOYEE_COMPENSATION_UPDATE: 'employee/compensations/update'
  readonly EMPLOYEE_COMPENSATION_UPDATED: 'employee/compensations/updated'
  readonly EMPLOYEE_COMPENSATION_DONE: 'employee/compensations/done'
  readonly EMPLOYEE_COMPENSATION_CANCEL: 'employee/compensations/cancel'
  readonly EMPLOYEE_COMPENSATION_RETURN_TO_LIST: 'employee/compensations/returnToList'
  readonly EMPLOYEE_JOB_ADD: 'employee/job/add'
  readonly EMPLOYEE_JOB_EDIT: 'employee/job/edit'
  readonly EMPLOYEE_PAYMENT_METHOD_UPDATED: 'employee/paymentMethod/updated'
  readonly EMPLOYEE_PAYMENT_METHOD_DONE: 'employee/paymentMethod/done'
  readonly EMPLOYEE_PAYMENT_METHOD_RESET: 'employee/paymentMethod/reset'
  readonly EMPLOYEE_SPLIT_PAYMENT: 'employee/paymentMethod/split'
  readonly EMPLOYEE_BANK_ACCOUNT_CREATE: 'employee/bankAccount/create'
  readonly EMPLOYEE_BANK_ACCOUNT_CREATED: 'employee/bankAccount/created'
  readonly EMPLOYEE_BANK_ACCOUNT_DELETED: 'employee/bankAccount/deleted'
  readonly EMPLOYEE_FEDERAL_TAXES_EDIT: 'employee/federalTaxes/edit'
  readonly EMPLOYEE_FEDERAL_TAXES_UPDATED: 'employee/federalTaxes/updated'
  readonly EMPLOYEE_FEDERAL_TAXES_DONE: 'employee/federalTaxes/done'
  readonly EMPLOYEE_STATE_TAXES_EDIT: 'employee/stateTaxes/edit'
  readonly EMPLOYEE_STATE_TAXES_UPDATED: 'employee/stateTaxes/updated'
  readonly EMPLOYEE_STATE_TAXES_DONE: 'employee/stateTaxes/done'
  readonly EMPLOYEE_TAXES_DONE: 'employee/taxes/done'
  readonly EMPLOYEE_SPLIT_PAYCHECK: 'employee/bankAccount/split'
  readonly EMPLOYEE_JOB_CREATED: 'employee/job/created'
  readonly EMPLOYEE_JOB_UPDATED: 'employee/job/updated'
  readonly EMPLOYEE_JOB_DELETED: 'employee/job/deleted'
  readonly EMPLOYEE_SUMMARY_VIEW: 'employee/summary'
  readonly EMPLOYEES_LIST: 'company/employees'
  readonly EMPLOYEE_SELF_ONBOARDING_START: 'employee/selfOnboarding/start'
  readonly EMPLOYEE_VIEW_FORM_TO_SIGN: 'employee/forms/view'
  readonly EMPLOYEE_SIGN_FORM: 'employee/forms/sign'
  readonly EMPLOYEE_FORMS_DONE: 'employee/forms/done'
  readonly EMPLOYEE_ONBOARDING_STATUS_UPDATED: 'employee/onboardingStatus/updated'
  readonly EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE: 'employee/employmentEligibility/done'
  readonly EMPLOYEE_CHANGE_ELIGIBILITY_STATUS: 'employee/employmentEligibility/change'
  readonly EMPLOYEE_ONBOARDING_DOCUMENTS_CONFIG_UPDATED: 'employee/onboardingDocumentsConfig/updated'
  readonly EMPLOYEE_DOCUMENTS_DONE: 'employee/documents/done'
  readonly EMPLOYEE_REHIRE: 'employee/rehire'
  readonly ROBOT_MACHINE_DONE: 'done'
  readonly ERROR: 'ERROR'
  readonly CANCEL: 'CANCEL'
  readonly BREADCRUMB_NAVIGATE: 'breadcrumb/navigate'
}

export declare interface ComponentsContextType {
  Alert: (props: AlertProps) => JSX.Element | null
  Badge: (props: BadgeProps) => JSX.Element | null
  Banner: (props: BannerProps) => JSX.Element | null
  Button: (props: ButtonProps) => JSX.Element | null
  ButtonIcon: (props: ButtonIconProps) => JSX.Element | null
  Card: (props: CardProps) => JSX.Element | null
  Box: (props: BoxProps) => JSX.Element | null
  BoxHeader: (props: BoxHeaderProps) => JSX.Element | null
  Checkbox: (props: CheckboxProps) => JSX.Element | null
  CheckboxGroup: (props: CheckboxGroupProps) => JSX.Element | null
  ComboBox: (props: ComboBoxProps) => JSX.Element | null
  MultiSelectComboBox: (props: MultiSelectComboBoxProps) => JSX.Element | null
  DatePicker: (props: DatePickerProps) => JSX.Element | null
  DateRangePicker: (props: DateRangePickerProps) => JSX.Element | null
  OrderedList: (props: OrderedListProps) => JSX.Element | null
  UnorderedList: (props: UnorderedListProps) => JSX.Element | null
  NumberInput: (props: NumberInputProps) => JSX.Element | null
  Radio: (props: RadioProps) => JSX.Element | null
  RadioGroup: (props: RadioGroupProps) => JSX.Element | null
  Select: (props: SelectProps) => JSX.Element | null
  Switch: (props: SwitchProps) => JSX.Element | null
  TextInput: (props: TextInputProps) => JSX.Element | null
  TextArea: (props: TextAreaProps) => JSX.Element | null
  Link: (props: LinkProps) => JSX.Element | null
  Menu: (props: MenuProps) => JSX.Element | null
  Table: (props: TableProps) => JSX.Element | null
  Heading: (props: HeadingProps) => JSX.Element | null
  PaginationControl?: (props: PaginationControlProps) => JSX.Element | null
  PayrollLoading?: (props: PayrollLoadingProps) => JSX.Element | null
  Text: (props: TextProps) => JSX.Element | null
  CalendarPreview: (props: CalendarPreviewProps) => JSX.Element | null
  ProgressBar: (props: ProgressBarProps) => JSX.Element | null
  Breadcrumbs: (props: BreadcrumbsProps) => JSX.Element | null
  Tabs: (props: TabsProps) => JSX.Element | null
  Dialog: (props: DialogProps) => JSX.Element | null
  Modal: (props: ModalProps) => JSX.Element | null
  LoadingSpinner: (props: LoadingSpinnerProps) => JSX.Element | null
  DescriptionList: (props: DescriptionListProps) => JSX.Element | null
  FileInput: (props: FileInputProps) => JSX.Element | null
}

/**
 * Minimal shape required for a form hook result to participate in `composeSubmitHandler`.
 * Any hook returning `BaseFormHookReady` satisfies this interface.
 *
 * `formMethods` is declared with method-call syntax (rather than reused from
 * `HookFormInternals`) so TypeScript applies bivariant parameter checking,
 * allowing hooks with specific form data generics to be passed without casts.
 * `_fieldElementRegistry` is reused directly since its type doesn't depend on
 * the form's generic.
 */
declare interface ComposableFormHookResult {
  form: {
    hookFormInternals: Pick<HookFormInternals, '_fieldElementRegistry'> & {
      formMethods: {
        handleSubmit(
          onValid: () => void,
          onInvalid?: (errors: Record<string, unknown>) => void,
        ): () => Promise<void>
        setFocus(name: string): void
        formState: {
          errors: Record<string, unknown>
        }
      }
    }
  }
  errorHandling: HookErrorHandling
}

/**
 * Composes `HookErrorHandling` from React Query results, optional submit state from `useBaseSubmit`,
 * and/or nested SDK hook results that expose `errorHandling`.
 *
 * Pairs with `composeSubmitHandler` by name: this composes **error state and recovery**; it is not a
 * submit callback.
 */
export declare function composeErrorHandler(
  sources: MixedErrorSource[],
  submitState?: SubmitStateForErrorHandling,
): HookErrorHandling

/**
 * Coordinates validation and submission across multiple form hooks on the same page, and
 * returns aggregated `errorHandling` for those forms so you can drive a single error surface.
 *
 * Validates all forms simultaneously via `handleSubmit()`, then focuses the visually first
 * invalid field across all forms (sorted by `getBoundingClientRect()`). Only calls
 * `onAllValid` when every form passes.
 *
 * Uses `handleSubmit` rather than `trigger` so that react-hook-form sets
 * `formState.isSubmitted = true`, which enables `reValidateMode` (default: `onChange`).
 * Without this, errors set by manual `trigger()` calls would never clear as the user types.
 *
 * Each hook passed to `forms` should be initialized with `shouldFocusError: false` so that
 * react-hook-form's built-in per-form focus is disabled and `composeSubmitHandler` can manage
 * cross-form focus instead.
 *
 * The returned `errorHandling` is the same shape every SDK hook returns, so the whole result
 * can be passed back into `composeErrorHandler` when you need to add extra
 * `@gusto/embedded-api` queries or screen-level submit state.
 *
 * @example
 * ```ts
 * const detailsForm = useEmployeeDetailsForm({ employeeId, shouldFocusError: false })
 * const addressForm = useHomeAddressForm({ employeeId, shouldFocusError: false })
 *
 * const { handleSubmit, errorHandling } = composeSubmitHandler(
 *   [detailsForm, addressForm],
 *   async () => {
 *     await detailsForm.actions.onSubmit()
 *     await addressForm.actions.onSubmit()
 *   },
 * )
 *
 * // With extra queries or screen-level submit state:
 * // const errorHandling = composeErrorHandler([submitResult, extraQuery], { submitError, setSubmitError })
 *
 * return <form onSubmit={handleSubmit}>...</form>
 * ```
 */
export declare function composeSubmitHandler<TForms extends readonly FieldValues[]>(
  forms: readonly [
    ...{
      [K in keyof TForms]: ComposeSubmitInput<TForms[K]>
    },
  ],
  onAllValid: () => Promise<void>,
): ComposeSubmitHandlerResult

declare interface ComposeSubmitHandlerResult {
  handleSubmit: (e: SyntheticEvent) => Promise<void>
  errorHandling: HookErrorHandling
}

/**
 * Accepted input for a single slot of `composeSubmitHandler`'s `forms` array.
 *
 * - SDK form hook results (anything matching `ComposableFormHookResult`) are composed directly.
 * - A raw `react-hook-form` `UseFormReturn<T>` is supported for screen-local auxiliary forms
 *   that don't warrant a dedicated SDK hook. Raw forms contribute validation/focus behavior
 *   but no `errorHandling` (fields surface their own inline errors via react-hook-form).
 */
declare type ComposeSubmitInput<T extends FieldValues = FieldValues> =
  | ComposableFormHookResult
  | UseFormReturn<T>

declare function ConfirmSignatureField(
  props: SignEmployeeFormConfirmSignatureFieldProps,
): JSX_2.Element

declare function ConfirmSignatureField_2(props: ConfirmSignatureFieldProps): JSX_2.Element

export declare type ConfirmSignatureFieldProps = HookFieldProps<
  CheckboxHookFieldProps<SignCompanyFormRequiredValidation>
>

declare function ConfirmWireDetails({
  onEvent,
  ...props
}: ConfirmWireDetailsInternalProps): JSX_2.Element

export declare type ConfirmWireDetailsComponentType = ComponentType<ConfirmWireDetailsProps>

declare interface ConfirmWireDetailsInternalProps
  extends Omit<BaseComponentInterface, 'onEvent'>, ConfirmWireDetailsProps {}

export declare interface ConfirmWireDetailsProps {
  companyId: string
  wireInId?: string
  onEvent?: BaseComponentInterface['onEvent']
}

export declare namespace Contractor {
  export {
    PaymentMethod,
    Address,
    ContractorList,
    NewHireReport,
    ContractorSubmit,
    ContractorProfile,
    OnboardingFlow_2 as OnboardingFlow,
    PaymentFlow,
    PaymentsList,
    CreatePayment,
    PaymentHistory,
    PaymentSummary,
    PaymentStatement,
  }
}

declare function ContractorList(props: ContractorListProps & BaseComponentInterface): JSX_2.Element

declare interface ContractorListProps extends CommonComponentInterface<'Contractor.ContractorList'> {
  companyId: string
  successMessage?: string
}

export declare namespace ContractorOnboarding {
  export {
    OnboardingFlow_2 as OnboardingFlow,
    ContractorList,
    ContractorProfile,
    Address,
    PaymentMethod,
    NewHireReport,
    ContractorSubmit,
  }
}

declare function ContractorProfile(
  props: ContractorProfileProps & BaseComponentInterface,
): JSX_2.Element

declare type ContractorProfileFormData = z.infer<typeof ContractorProfileSchema>

declare interface ContractorProfileProps extends CommonComponentInterface<'Contractor.Profile'> {
  companyId: string
  contractorId?: string
  defaultValues?: UseContractorProfileProps['defaultValues']
}

declare const ContractorProfileSchema: z.ZodObject<
  {
    selfOnboarding: z.ZodBoolean
    email: z.ZodOptional<z.ZodString>
    contractorType: z.ZodEnum<{
      Business: 'Business'
      Individual: 'Individual'
    }>
    wageType: z.ZodEnum<{
      Hourly: 'Hourly'
      Fixed: 'Fixed'
    }>
    startDate: z.ZodDate
    firstName: z.ZodOptional<z.ZodString>
    middleInitial: z.ZodOptional<z.ZodString>
    lastName: z.ZodOptional<z.ZodString>
    ssn: z.ZodOptional<z.ZodString>
    businessName: z.ZodOptional<z.ZodString>
    ein: z.ZodOptional<z.ZodString>
    hourlyRate: z.ZodOptional<z.ZodNumber>
  },
  z.core.$strip
>

declare function ContractorSubmit(
  props: ContractorSubmitProps & BaseComponentInterface,
): JSX_2.Element

declare interface ContractorSubmitProps extends CommonComponentInterface<'Contractor.Submit'> {
  contractorId: string
  selfOnboarding?: boolean
}

export declare type CountyEntry = {
  fipsCode: string
  county: string | null
}

declare function CourtesyWithholdingField(props: CourtesyWithholdingFieldProps): JSX_2.Element

export declare type CourtesyWithholdingFieldProps = HookFieldProps<
  CheckboxHookFieldProps<HomeAddressRequiredValidation>
>

declare type CreatableTimeOffPolicyType = Extract<PolicyType_2, 'sick' | 'vacation'>

export declare function createBankFormSchema(
  options?: BankFormSchemaOptions,
): BuildFormSchemaResult<{
  name: z.ZodString
  routingNumber: z.ZodString
  accountNumber: z.ZodString
  accountType: z.ZodEnum<{
    Checking: 'Checking'
    Savings: 'Savings'
  }>
}>

export declare function createChildSupportGarnishmentFormSchema({
  mode,
  selectedAgency,
}?: ChildSupportGarnishmentFormSchemaOptions): BuildFormSchemaResult<{
  state: z.ZodString
  fipsCode: z.ZodString
  caseNumber: z.ZodString
  orderNumber: z.ZodString
  remittanceNumber: z.ZodString
  payPeriodMaximum: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  amount: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  paymentPeriod: z.ZodEnum<{
    readonly EveryWeek: 'Every week'
    readonly EveryOtherWeek: 'Every other week'
    readonly TwicePerMonth: 'Twice per month'
    readonly Monthly: 'Monthly'
  }>
}>

export declare function createCompensationSchema(
  options?: CompensationSchemaOptions,
): BuildFormSchemaResult<{
  /**
   * Optional in both modes. Setting title here scopes the change to this
   * compensation's `effectiveDate` — pair it with a future-dated comp to
   * schedule a promotion title alongside a rate change. Use
   * `useJobForm.Fields.Title` instead when creating a job (title is required
   * by the API on job creation) or when renaming the active role
   * immediately, and avoid rendering both fields on the same screen.
   */
  title: z.ZodString
  flsaStatus: z.ZodOptional<
    z.ZodEnum<{
      Exempt: 'Exempt'
      'Salaried Nonexempt': 'Salaried Nonexempt'
      Nonexempt: 'Nonexempt'
      Owner: 'Owner'
      'Commission Only Exempt': 'Commission Only Exempt'
      'Commission Only Nonexempt': 'Commission Only Nonexempt'
    }>
  >
  paymentUnit: z.ZodEnum<{
    Hour: 'Hour'
    Week: 'Week'
    Month: 'Month'
    Year: 'Year'
    Paycheck: 'Paycheck'
  }>
  rate: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  /**
   * The effective date a new compensation should take effect on.
   *
   * - **create mode (`compensationId` absent)**: required; partners typically default
   *   to the parent job's `hireDate` (onboarding stub-fill) or a future date
   *   (rate change). Must be on or after `hireDate`. Server-side this maps to
   *   POST /v1/jobs/:jobId/compensations.
   * - **update mode (`compensationId` present)**: optional; if omitted the API
   *   keeps the existing effective date. The `hireDate` lower bound is **not**
   *   enforced — loaded values may legitimately predate the hire date. Maps to
   *   PUT /v1/compensations/:id.
   */
  effectiveDate: z.ZodPipe<z.ZodTransform<string | null, unknown>, z.ZodNullable<z.ZodISODate>>
  adjustForMinimumWage: z.ZodBoolean
  minimumWageId: z.ZodString
}>

export declare function createDeductionFormSchema(
  options: DeductionFormSchemaOptions,
): BuildFormSchemaResult<{
  description: z.ZodString
  recurring: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodBoolean>
  deductAsPercentage: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodBoolean>
  amount: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  totalAmount: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  annualMaximum: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  garnishmentType: z.ZodEnum<{
    readonly ChildSupport: 'child_support'
    readonly FederalTaxLien: 'federal_tax_lien'
    readonly StateTaxLien: 'state_tax_lien'
    readonly StudentLoan: 'student_loan'
    readonly CreditorGarnishment: 'creditor_garnishment'
    readonly FederalLoan: 'federal_loan'
    readonly OtherGarnishment: 'other_garnishment'
  }>
}>

export declare function createEmployeeDetailsSchema(
  options?: EmployeeDetailsSchemaOptions,
): BuildFormSchemaResult<{
  firstName: z.ZodString
  middleInitial: z.ZodString
  lastName: z.ZodString
  email: z.ZodEmail
  dateOfBirth: z.ZodISODate
  ssn: z.ZodString
  selfOnboarding: z.ZodBoolean
}>

/**
 * Builds a Zod schema and metadata config for a dynamic state-taxes form.
 *
 * Schema shape: `{ states: { [state]: { [camelKey]: value } } }` where the
 * inner record's keys mirror each API question's `key` after camelCasing.
 *
 * Required fields are tracked via `superRefine` (mirrors `buildFormSchema`'s
 * approach for static-shape forms). Admin-only questions are excluded from
 * both schema and metadata when `isAdmin=false`.
 */
export declare function createEmployeeStateTaxesSchema(
  employeeStateTaxes: EmployeeStateTaxesList[],
  options?: EmployeeStateTaxesSchemaOptions,
): EmployeeStateTaxesSchemaResult

export declare function createFederalTaxesSchema(
  options?: FederalTaxesSchemaOptions,
): BuildFormSchemaResult<{
  filingStatus: z.ZodString
  twoJobs: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodBoolean>
  dependentsAmount: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  otherIncome: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  deductions: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  extraWithholding: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
}>

export declare function createHomeAddressSchema(
  options?: HomeAddressSchemaOptions,
): BuildFormSchemaResult<{
  street1: z.ZodString
  street2: z.ZodString
  city: z.ZodString
  state: z.ZodString
  zip: z.ZodString
  courtesyWithholding: z.ZodBoolean
  effectiveDate: z.ZodISODate
}>

export declare function createJobSchema(options?: JobSchemaOptions): BuildFormSchemaResult<{
  title: z.ZodString
  hireDate: z.ZodPipe<z.ZodTransform<string | null, unknown>, z.ZodNullable<z.ZodISODate>>
  twoPercentShareholder: z.ZodBoolean
  stateWcCovered: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodBoolean>
  stateWcClassCode: z.ZodString
}>

declare function CreatePayment(props: CreatePaymentProps): JSX_2.Element

export declare function createPaymentMethodFormSchema(
  options?: PaymentMethodFormSchemaOptions,
): BuildFormSchemaResult<{
  type: z.ZodEnum<{
    Check: 'Check'
    'Direct Deposit': 'Direct Deposit'
  }>
}>

declare interface CreatePaymentProps extends BaseComponentInterface<'Contractor.Payments.CreatePayment'> {
  companyId: string
}

export declare function createPayScheduleSchema(
  options?: PayScheduleSchemaOptions,
): BuildFormSchemaResult<{
  customName: z.ZodString
  frequency: z.ZodEnum<{
    'Every week': 'Every week'
    'Every other week': 'Every other week'
    'Twice per month': 'Twice per month'
    Monthly: 'Monthly'
  }>
  customTwicePerMonth: z.ZodString
  anchorPayDate: z.ZodPipe<z.ZodTransform<string | null, unknown>, z.ZodNullable<z.ZodISODate>>
  anchorEndOfPayPeriod: z.ZodPipe<
    z.ZodTransform<string | null, unknown>,
    z.ZodNullable<z.ZodISODate>
  >
  day1: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  day2: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
}>

declare function CreateSignatory(
  props: CreateSignatoryProps & BaseComponentInterface,
): JSX_2.Element

declare type CreateSignatoryDefaultValues = RequireAtLeastOne<
  Pick<Signatory, 'firstName' | 'lastName' | 'email' | 'title' | 'phone' | 'birthday'> &
    Pick<
      NonNullable<Signatory['homeAddress']>,
      'street1' | 'street2' | 'city' | 'state' | 'zip'
    > & {
      ssn?: string
    }
>

declare interface CreateSignatoryProps extends CommonComponentInterface {
  companyId: string
  signatoryId?: string
  defaultValues?: CreateSignatoryDefaultValues
}

export declare function createSignCompanyFormSchema(
  options?: SignCompanyFormSchemaOptions,
): BuildFormSchemaResult<{
  signature: z.ZodString
  confirmSignature: z.ZodBoolean
}>

export declare function createSignEmployeeFormSchema(
  options?: SignEmployeeFormSchemaOptions,
): BuildFormSchemaResult<{
  signature: z.ZodString
  confirmSignature: z.ZodBoolean
  usedPreparer: z.ZodEnum<{
    yes: 'yes'
    no: 'no'
  }>
  preparerFirstName: z.ZodString
  preparerLastName: z.ZodString
  preparerStreet1: z.ZodString
  preparerStreet2: z.ZodString
  preparerCity: z.ZodString
  preparerState: z.ZodString
  preparerZip: z.ZodString
  preparerSignature: z.ZodString
  preparerAgree: z.ZodBoolean
  preparer2FirstName: z.ZodString
  preparer2LastName: z.ZodString
  preparer2Street1: z.ZodString
  preparer2Street2: z.ZodString
  preparer2City: z.ZodString
  preparer2State: z.ZodString
  preparer2Zip: z.ZodString
  preparer2Signature: z.ZodString
  preparer2Agree: z.ZodBoolean
  preparer3FirstName: z.ZodString
  preparer3LastName: z.ZodString
  preparer3Street1: z.ZodString
  preparer3Street2: z.ZodString
  preparer3City: z.ZodString
  preparer3State: z.ZodString
  preparer3Zip: z.ZodString
  preparer3Signature: z.ZodString
  preparer3Agree: z.ZodBoolean
  preparer4FirstName: z.ZodString
  preparer4LastName: z.ZodString
  preparer4Street1: z.ZodString
  preparer4Street2: z.ZodString
  preparer4City: z.ZodString
  preparer4State: z.ZodString
  preparer4Zip: z.ZodString
  preparer4Signature: z.ZodString
  preparer4Agree: z.ZodBoolean
}>

export declare function createSplitPaymentsFormSchema(
  options?: SplitPaymentsFormSchemaOptions,
): BuildFormSchemaResult<{
  splitBy: z.ZodEnum<{
    Percentage: 'Percentage'
    Amount: 'Amount'
  }>
  splitAmount: z.ZodRecord<
    z.ZodString,
    z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodNullable<z.ZodNumber>>
  >
  priority: z.ZodRecord<z.ZodString, z.ZodNumber>
}>

export declare function createStateFields(
  employeeStateTaxes: EmployeeStateTaxesList[],
  options: CreateStateFieldsOptions,
): StateTaxFieldsGroup[]

export declare interface CreateStateFieldsOptions {
  isAdmin: boolean
}

declare const createTheme: (colors?: GustoSDKThemeColors) => {
  inputBackgroundColor: string | undefined
  inputBorderColor: string
  inputContentColor: string | undefined
  inputBorderWidth: string
  inputPlaceholderColor: string | undefined
  inputAdornmentColor: string | undefined
  inputDisabledBackgroundColor: string | undefined
  inputLabelColor: string | undefined
  inputLabelFontSize: string
  inputLabelFontWeight: string
  inputDescriptionColor: string | undefined
  inputErrorColor: string | undefined
  inputRadius: string
  buttonRadius: string
  cardRadius: string
  badgeRadius: string
  bannerRadius: string
  boxRadius: string
  fontSizeRoot: string
  fontFamily: string
  fontLineHeightLarge: string
  fontLineHeightRegular: string
  fontLineHeightSmall: string
  fontLineHeightExtraSmall: string
  fontSizeExtraSmall: string
  fontSizeSmall: string
  fontSizeRegular: string
  fontSizeLarge: string
  fontSizeHeading1: string
  fontSizeHeading2: string
  fontSizeHeading3: string
  fontSizeHeading4: string
  fontSizeHeading5: string
  fontSizeHeading6: string
  fontWeightRegular: string
  fontWeightMedium: string
  fontWeightSemibold: string
  fontWeightBold: string
  transitionDuration: string
  shadowResting: string
  shadowTopmost: string
  focusRingColor: string | undefined
  focusRingWidth: string
  colorBody: string
  colorBodyAccent: string
  colorBodyContent: string
  colorBodySubContent: string
  colorPrimary: string
  colorPrimaryAccent: string
  colorPrimaryContent: string
  colorSecondary: string
  colorSecondaryAccent: string
  colorSecondaryContent: string
  colorInfo: string
  colorInfoAccent: string
  colorInfoContent: string
  colorWarning: string
  colorWarningAccent: string
  colorWarningContent: string
  colorError: string
  colorErrorAccent: string
  colorErrorContent: string
  colorSuccess: string
  colorSuccessAccent: string
  colorSuccessContent: string
  colorBorderPrimary: string
  colorBorderSecondary: string
  colorButtonIcon: string
}

export declare function createWorkAddressSchema(
  options?: WorkAddressSchemaOptions,
): BuildFormSchemaResult<{
  locationUuid: z.ZodString
  effectiveDate: z.ZodISODate
}>

declare interface CtaConfig {
  labelKey: string
  namespace?: keyof CustomTypeOptions['resources']
}

export declare type CurrencyStateTaxFieldProps = BaseStateTaxFieldProps & {
  FieldComponent?: ComponentType<NumberInputProps>
}

declare function CustomNameField(props: CustomNameFieldProps): JSX_2.Element

export declare type CustomNameFieldProps = HookFieldProps<
  TextInputHookFieldProps<PayScheduleRequiredValidation>
>

declare function CustomTwicePerMonthField(props: CustomTwicePerMonthFieldProps): JSX_2.Element

export declare type CustomTwicePerMonthFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, string>
>

declare const DashboardFlow: ({ employeeId, onEvent }: DashboardFlowProps) => JSX_2.Element

declare interface DashboardFlowProps extends BaseComponentInterface {
  employeeId: string
}

declare type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean
}

declare type DataViewColumn<T> =
  | {
      key: keyof T
      title: string | React.ReactNode
      render?: (item: T) => React.ReactNode
    }
  | {
      key?: string
      title: string | React.ReactNode
      render: (item: T) => React.ReactNode
    }

declare function DateOfBirthField(props: DateOfBirthFieldProps): JSX_2.Element

export declare type DateOfBirthFieldProps = HookFieldProps<
  DatePickerHookFieldProps<EmployeeDetailsRequiredValidation>
>

export declare function DatePickerHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  FieldComponent,
  portalContainer,
  minDate,
  maxDate,
}: DatePickerHookFieldProps<TErrorCode>): ReactElement<unknown, string | JSXElementConstructor<any>>

export declare interface DatePickerHookFieldProps<TErrorCode extends string = never>
  extends BaseFieldProps, Pick<DatePickerProps, 'portalContainer' | 'minDate' | 'maxDate'> {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<DatePickerProps>
  /** When used inside a modal, pass the modal backdrop ref's element so the calendar popover stacks correctly. */
  portalContainer?: DatePickerProps['portalContainer']
}

export declare interface DatePickerProps
  extends
    SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name'> {
  /**
   * React ref for the date input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Disables the date picker and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Callback when selected date changes
   */
  onChange?: (value: Date | null) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Label text for the date picker field
   */
  label: string
  /**
   * Currently selected date value
   */
  value?: Date | null
  /**
   * Placeholder text when no date is selected
   */
  placeholder?: string
  /**
   * Element to use as the portal container
   */
  portalContainer?: HTMLElement
  /**
   * Minimum selectable date. Dates before this will be disabled.
   */
  minDate?: Date
  /**
   * Maximum selectable date. Dates after this will be disabled.
   */
  maxDate?: Date
  /**
   * Callback to determine if a specific date should be disabled.
   * Return true to disable the date.
   */
  isDateDisabled?: (date: Date) => boolean
}

declare interface DateRange {
  start: Date
  end: Date
}

declare interface DateRangePickerProps {
  label: string
  shouldVisuallyHideLabel?: boolean
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  startDateLabel: string
  endDateLabel: string
  minValue?: Date
  maxValue?: Date
}

export declare type DateStateTaxFieldProps = BaseStateTaxFieldProps & {
  FieldComponent?: ComponentType<DatePickerProps>
}

declare function Day1Field(props: Day1FieldProps): JSX_2.Element

export declare type Day1FieldProps = HookFieldProps<NumberInputHookFieldProps<DayValidation>>

declare function Day2Field(props: Day2FieldProps): JSX_2.Element

export declare type Day2FieldProps = HookFieldProps<NumberInputHookFieldProps<DayValidation>>

export declare type DayValidation = (typeof PayScheduleErrorCodes)['REQUIRED' | 'DAY_RANGE']

declare function DeductAsPercentageField(props: DeductAsPercentageFieldProps): JSX_2.Element

export declare type DeductAsPercentageFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<DeductionFormRequiredValidation, boolean>
>

export declare type DeductionAmountFieldProps = HookFieldProps<
  NumberInputHookFieldProps<DeductionFormAmountValidation>
>

export declare type DeductionFormAmountValidation =
  | DeductionFormRequiredValidation
  | DeductionFormNegativeAmountValidation

export declare type DeductionFormCapValidation = DeductionFormNegativeAmountValidation

export declare type DeductionFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

export declare type DeductionFormErrorCode =
  (typeof DeductionFormErrorCodes)[keyof typeof DeductionFormErrorCodes]

export declare const DeductionFormErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
  readonly NEGATIVE_AMOUNT: 'NEGATIVE_AMOUNT'
}

export declare interface DeductionFormFields {
  Description: typeof DescriptionField
  Recurring: typeof RecurringField
  DeductAsPercentage: typeof DeductAsPercentageField
  Amount: typeof AmountField
  /** Only available when `status.isRecurring` is true. */
  TotalAmount: typeof TotalAmountField | undefined
  /** Only available when `status.isRecurring` is true. */
  AnnualMaximum: typeof AnnualMaximumField | undefined
  /** Only available when `courtOrdered: true`. */
  GarnishmentType: typeof GarnishmentTypeField | undefined
}

export declare type DeductionFormFieldsMetadata = UseDeductionFormReady['form']['fieldsMetadata']

export declare type DeductionFormNegativeAmountValidation =
  typeof DeductionFormErrorCodes.NEGATIVE_AMOUNT

export declare type DeductionFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

export declare type DeductionFormOutputs = DeductionFormData

export declare type DeductionFormRequiredValidation = typeof DeductionFormErrorCodes.REQUIRED

declare interface DeductionFormSchemaOptions {
  mode?: 'create' | 'update'
  /**
   * Court-ordered garnishments require `garnishmentType` (Federal Tax Lien,
   * Student Loan, etc.). Non-court-ordered "custom" deductions don't carry a
   * type — the field is excluded from the schema entirely, matching the legacy
   * GarnishmentForm vs CustomDeductionForm split.
   */
  courtOrdered: boolean
  optionalFieldsToRequire?: DeductionFormOptionalFieldsToRequire
}

declare function Deductions({ employeeId, dictionary, onEvent }: DeductionsProps): JSX_2.Element

declare function DeductionsField(props: DeductionsFieldProps): JSX_2.Element

export declare type DeductionsFieldProps = HookFieldProps<
  NumberInputHookFieldProps<FederalTaxesRequiredValidation>
>

declare interface DeductionsProps extends BaseComponentInterface<'Employee.Deductions'> {
  employeeId: string
}

declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P]
}

declare const defaultThemeColors: {
  colorBody: string
  colorBodyAccent: string
  colorBodyContent: string
  colorBodySubContent: string
  colorPrimary: string
  colorPrimaryAccent: string
  colorPrimaryContent: string
  colorSecondary: string
  colorSecondaryAccent: string
  colorSecondaryContent: string
  colorInfo: string
  colorInfoAccent: string
  colorInfoContent: string
  colorWarning: string
  colorWarningAccent: string
  colorWarningContent: string
  colorError: string
  colorErrorAccent: string
  colorErrorContent: string
  colorSuccess: string
  colorSuccessAccent: string
  colorSuccessContent: string
  colorBorderPrimary: string
  colorBorderSecondary: string
  colorButtonIcon: string
}

declare function DependentsAmountField(props: DependentsAmountFieldProps): JSX_2.Element

export declare type DependentsAmountFieldProps = HookFieldProps<
  NumberInputHookFieldProps<FederalTaxesRequiredValidation>
>

declare function DescriptionField(props: DescriptionFieldProps): JSX_2.Element

export declare type DescriptionFieldProps = HookFieldProps<
  TextInputHookFieldProps<DeductionFormRequiredValidation>
>

declare interface DescriptionListItem {
  term: ReactNode | ReactNode[]
  description: ReactNode | ReactNode[]
}

export declare interface DescriptionListProps {
  items: DescriptionListItem[]
  layout?: 'stacked' | 'horizontal'
  showSeparators?: boolean
  className?: string
}

export declare interface DialogProps {
  /**
   * Controls whether the dialog is open or closed
   */
  isOpen?: boolean
  /**
   * Callback function called when the dialog should be closed
   */
  onClose?: () => void
  /**
   * Callback function called when the primary action button is clicked
   */
  onPrimaryActionClick?: () => void
  /**
   * Whether the primary action is destructive (changes button style to error variant)
   */
  isDestructive?: boolean
  /**
   * Whether the primary action button is in loading state
   */
  isPrimaryActionLoading?: boolean
  /**
   * Text label for the primary action button
   */
  primaryActionLabel: string
  /**
   * Text label for the close/cancel action button
   */
  closeActionLabel: string
  /**
   * Optional title content to be displayed at the top of the dialog
   */
  title?: ReactNode
  /**
   * Optional children content to be rendered in the dialog body
   */
  children?: ReactNode
  /**
   * Whether clicking the backdrop should close the dialog
   */
  shouldCloseOnBackdropClick?: boolean
}

declare function DismissalFlow({
  companyId,
  employeeId,
  onEvent,
  payrollId,
}: DismissalFlowProps): JSX_2.Element

declare interface DismissalFlowContextInterface extends FlowContextInterface {
  companyId: string
  employeeId?: string
  payrollUuid?: string
}

declare interface DismissalFlowProps {
  companyId: string
  employeeId?: string
  onEvent: OnEventType<EventType, unknown>
  payrollId?: string
}

declare function DocumentList(props: DocumentListProps): JSX_2.Element

declare interface DocumentListProps extends BaseComponentInterface<'Company.DocumentList'> {
  companyId: string
  signatoryId?: string
}

declare function DocumentManager(
  props: DocumentManagerProps & BaseComponentInterface,
): JSX_2.Element

declare interface DocumentManagerProps {
  employeeId: string
  formId: string
}

declare function DocumentSigner(props: DocumentSignerProps): JSX_2.Element

declare function DocumentSigner_2(props: DocumentSignerProps_2): JSX_2.Element

declare interface DocumentSignerProps extends BaseComponentInterface<'Company.DocumentList'> {
  companyId: string
  signatoryId?: string
}

declare interface DocumentSignerProps_2 extends BaseComponentInterface<'Employee.DocumentSigner'> {
  employeeId: string
  withEmployeeI9?: boolean
}

declare function EditCompensation({ dictionary, ...props }: EditCompensationProps): JSX_2.Element

declare interface EditCompensationProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  startDate: string
  currentJobId?: string | null
  title: string
  submitCtaLabel: string
  onCancel?: () => void
  partnerDefaultValues?: CompensationDefaultValues
  /**
   * Receives the broadcast events: `EMPLOYEE_JOB_CREATED` / `EMPLOYEE_JOB_UPDATED`
   * (with the saved `Job`), then `EMPLOYEE_COMPENSATION_UPDATED` (with the saved
   * `Compensation`) on a successful submit chain. Use `EMPLOYEE_COMPENSATION_UPDATED`
   * for "save complete" branching.
   */
  onEvent: OnEventType<EventType, unknown>
}

declare function EffectiveDateField(props: CompensationEffectiveDateFieldProps): JSX_2.Element

declare function EffectiveDateField_2(props: EffectiveDateFieldProps): JSX_2.Element

declare function EffectiveDateField_3(props: HomeAddressEffectiveDateFieldProps): JSX_2.Element

export declare type EffectiveDateFieldProps = HookFieldProps<
  DatePickerHookFieldProps<WorkAddressRequiredValidation>
>

declare function EmailField(props: EmailFieldProps): JSX_2.Element

export declare type EmailFieldProps = HookFieldProps<TextInputHookFieldProps<EmailValidation>>

export declare type EmailValidation = (typeof EmployeeDetailsErrorCodes)[
  | 'REQUIRED'
  | 'INVALID_EMAIL'
  | 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING']

export declare namespace Employee {
  export {
    EmployeeList,
    Deductions,
    OnboardingSummary,
    Profile,
    Compensation_2 as Compensation,
    FederalTaxes_2 as FederalTaxes,
    FederalTaxesProps_2 as FederalTaxesProps,
    StateTaxes_2 as StateTaxes,
    PaymentMethod_2 as PaymentMethod,
    Landing,
    DocumentSigner_2 as DocumentSigner,
    OnboardingFlow_3 as OnboardingFlow,
    SelfOnboardingFlow,
    EmployeeDocuments,
    DashboardFlow,
    DashboardFlowProps,
    HomeAddress,
    HomeAddressProps,
    EmploymentEligibility,
    EmploymentEligibilityProps,
    TerminateEmployee,
    TerminateEmployeeProps,
    TerminationSummary,
    TerminationSummaryProps,
    TerminationFlow,
    TerminationFlowProps,
    PayrollOption,
    WorkAddress,
    WorkAddressProps,
    Taxes,
  }
}

export declare type EmployeeDetailsErrorCode =
  (typeof EmployeeDetailsErrorCodes)[keyof typeof EmployeeDetailsErrorCodes]

export declare const EmployeeDetailsErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
  readonly INVALID_NAME: 'INVALID_NAME'
  readonly INVALID_EMAIL: 'INVALID_EMAIL'
  readonly INVALID_SSN: 'INVALID_SSN'
  readonly EMAIL_REQUIRED_FOR_SELF_ONBOARDING: 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING'
}

export declare type EmployeeDetailsField = Exclude<keyof typeof fieldValidators_5, 'selfOnboarding'>

declare interface EmployeeDetailsFields {
  FirstName: typeof FirstNameField
  MiddleInitial: typeof MiddleInitialField
  LastName: typeof LastNameField
  Email: typeof EmailField
  DateOfBirth: typeof DateOfBirthField
  Ssn: typeof SsnField
  SelfOnboarding: typeof SelfOnboardingField | undefined
}

export declare type EmployeeDetailsFieldsMetadata =
  UseEmployeeDetailsFormReady['form']['fieldsMetadata']

export declare type EmployeeDetailsFormData = {
  [K in keyof typeof fieldValidators_5]: z.infer<(typeof fieldValidators_5)[K]>
}

export declare type EmployeeDetailsFormFields = UseEmployeeDetailsFormReady['form']['Fields']

export declare type EmployeeDetailsFormOutputs = EmployeeDetailsFormData

export declare type EmployeeDetailsOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_4
>

export declare type EmployeeDetailsRequiredValidation = typeof EmployeeDetailsErrorCodes.REQUIRED

declare interface EmployeeDetailsSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: EmployeeDetailsOptionalFieldsToRequire
  hasSsn?: boolean
}

export declare interface EmployeeDetailsSubmitCallbacks {
  onEmployeeCreated?: (employee: Employee_2) => void
  onEmployeeUpdated?: (employee: Employee_2) => void
  onOnboardingStatusUpdated?: (status: unknown) => void
}

declare function EmployeeDocuments(props: EmployeeDocumentsProps): JSX_2.Element

declare interface EmployeeDocumentsProps extends BaseComponentInterface<'Employee.EmployeeDocuments'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

declare function EmployeeList({
  FallbackComponent,
  ...props
}: EmployeeListProps & BaseComponentInterface): JSX_2.Element

declare interface EmployeeListProps extends BaseComponentInterface<'Employee.EmployeeList'> {
  companyId: string
}

export declare namespace EmployeeManagement {
  export {
    ManagementEmployeeList as EmployeeList,
    EmployeeDocuments,
    DocumentManager,
    DashboardFlow,
    WorkAddress,
    WorkAddressProps,
    FederalTaxes_2 as FederalTaxes,
    FederalTaxesProps_2 as FederalTaxesProps,
    StateTaxes_2 as StateTaxes,
    StateTaxesProps_2 as StateTaxesProps,
    Profile_2 as Profile,
    ProfileProps_2 as ProfileProps,
    PaymentMethod_3 as PaymentMethod,
    PaymentMethodProps_3 as PaymentMethodProps,
    TerminateEmployee,
    TerminationSummary,
    TerminationFlow,
  }
}

export declare namespace EmployeeOnboarding {
  export {
    OnboardingFlow_3 as OnboardingFlow,
    SelfOnboardingFlow,
    EmployeeList,
    OnboardingSummary,
    Landing,
    DocumentSigner_2 as DocumentSigner,
    EmploymentEligibility,
    Profile,
    Compensation_2 as Compensation,
    FederalTaxes_3 as FederalTaxes,
    FederalTaxesProps_3 as FederalTaxesProps,
    StateTaxes_3 as StateTaxes,
    StateTaxesProps_3 as StateTaxesProps,
    Deductions,
    PaymentMethod_2 as PaymentMethod,
    PaymentMethodProps_2 as PaymentMethodProps,
    Taxes,
  }
}

export declare type EmployeeStateTaxesErrorCode =
  (typeof EmployeeStateTaxesErrorCodes)[keyof typeof EmployeeStateTaxesErrorCodes]

/**
 * The state-taxes form only surfaces a single error code: `REQUIRED`. Field
 * values are stored as `z.unknown()` in the schema; the bundled UI components
 * emit type-correct values and the submit serializer handles edge cases, so
 * any "invalid" input is treated as empty and lands on `REQUIRED`.
 */
export declare const EmployeeStateTaxesErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
}

export declare type EmployeeStateTaxesFieldsMetadata =
  UseEmployeeStateTaxesFormReady['form']['fieldsMetadata']

export declare interface EmployeeStateTaxesFormData {
  states: Record<string, Record<string, StateTaxValue>>
}

export declare type EmployeeStateTaxesFormFields = UseEmployeeStateTaxesFormReady['form']['Fields']

export declare type EmployeeStateTaxesFormOutputs = EmployeeStateTaxesFormData

export declare interface EmployeeStateTaxesMetadataConfig extends FieldsMetadataConfig<
  Record<string, z.ZodType>
> {
  /** Group → questions, in API response order, post admin-filtering. */
  groups: Array<{
    state: string
    isWorkState: boolean
    questions: EmployeeStateTaxesQuestionMeta[]
  }>
}

export declare interface EmployeeStateTaxesQuestionMeta {
  state: string
  isWorkState: boolean
  apiKey: string
  formKey: string
  variant: StateTaxQuestionVariant
  isAdminOnly: boolean
  isWireSelectWithBooleanOptions: boolean
}

export declare interface EmployeeStateTaxesSchemaOptions {
  isAdmin?: boolean
}

declare type EmployeeStateTaxesSchemaResult = [
  schema: z.ZodType<EmployeeStateTaxesFormData, EmployeeStateTaxesFormData>,
  metadataConfig: EmployeeStateTaxesMetadataConfig,
]

declare type EmployeeTab = 'active' | 'onboarding' | 'dismissed'

declare interface EmployeeTableItem {
  uuid: string
  firstName?: string | null
  lastName?: string | null
  jobTitle?: string | null
}

declare interface EmployeeTableProps<T extends EmployeeTableItem> {
  data: T[]
  label?: string
  additionalColumns?: useDataViewProp<T>['columns']
  hideJobTitle?: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  searchPlaceholder?: string
  selectionMode?: SelectionMode_2
  onSelect?: (item: T, checked: boolean) => void
  onSelectAll?: (checked: boolean, visibleItems: T[]) => void
  getIsItemSelected?: (item: T) => boolean
  itemMenu?: (item: T) => ReactNode
  pagination?: PaginationControlProps
  isFetching?: boolean
  emptyState?: () => ReactNode
  emptySearchState?: () => ReactNode
  footer?: useDataViewProp<T>['footer']
}

declare function EmploymentEligibility(props: EmploymentEligibilityProps): JSX_2.Element

declare interface EmploymentEligibilityProps extends BaseComponentInterface<'Employee.EmploymentEligibility'> {
  employeeId: string
}

declare type EventType = (typeof componentEvents)[keyof typeof componentEvents]

declare function ExtraWithholdingField(props: ExtraWithholdingFieldProps): JSX_2.Element

export declare type ExtraWithholdingFieldProps = HookFieldProps<
  NumberInputHookFieldProps<FederalTaxesRequiredValidation>
>

declare function FederalTaxes(props: FederalTaxesProps & BaseComponentInterface): JSX_2.Element

declare function FederalTaxes_2({
  FallbackComponent,
  ...props
}: FederalTaxesProps_2 & Pick<BaseComponentInterface, 'FallbackComponent'>): JSX_2.Element

declare function FederalTaxes_3({
  FallbackComponent,
  ...props
}: FederalTaxesProps_3 & Pick<BaseComponentInterface, 'FallbackComponent'>): JSX_2.Element

declare type FederalTaxesDefaultValues = RequireAtLeastOne<{
  taxPayerType?: FederalTaxFormInputs['taxPayerType']
  filingForm?: FederalTaxFormInputs['filingForm']
  legalName?: FederalTaxFormInputs['legalName']
}>

export declare type FederalTaxesErrorCode =
  (typeof FederalTaxesErrorCodes)[keyof typeof FederalTaxesErrorCodes]

export declare const FederalTaxesErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
}

export declare type FederalTaxesField = keyof typeof fieldValidators_11

export declare interface FederalTaxesFields {
  FilingStatus: typeof FilingStatusField
  TwoJobs: typeof TwoJobsField
  DependentsAmount: typeof DependentsAmountField
  OtherIncome: typeof OtherIncomeField
  Deductions: typeof DeductionsField
  ExtraWithholding: typeof ExtraWithholdingField
}

export declare type FederalTaxesFieldsMetadata = UseFederalTaxesFormReady['form']['fieldsMetadata']

export declare type FederalTaxesFormData = {
  [K in keyof typeof fieldValidators_11]: z.infer<(typeof fieldValidators_11)[K]>
}

export declare type FederalTaxesFormFields = UseFederalTaxesFormReady['form']['Fields']

export declare type FederalTaxesFormOutputs = FederalTaxesFormData

export declare type FederalTaxesOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_10
>

declare interface FederalTaxesProps extends CommonComponentInterface<'Company.FederalTaxes'> {
  companyId: string
  defaultValues?: FederalTaxesDefaultValues
}

declare interface FederalTaxesProps_2 extends CommonComponentInterface<'Employee.FederalTaxes'> {
  employeeId: string
  defaultValues?: Partial<FederalTaxesFormData>
  onEvent: BaseComponentInterface['onEvent']
}

declare interface FederalTaxesProps_3 extends CommonComponentInterface<'Employee.FederalTaxes'> {
  employeeId: string
  defaultValues?: Partial<FederalTaxesFormData>
  onEvent: BaseComponentInterface['onEvent']
}

export declare type FederalTaxesRequiredValidation = typeof FederalTaxesErrorCodes.REQUIRED

declare interface FederalTaxesSchemaOptions {
  optionalFieldsToRequire?: FederalTaxesOptionalFieldsToRequire
}

declare type FederalTaxFormInputs = z.input<typeof FederalTaxFormSchema>

declare const FederalTaxFormSchema: z.ZodObject<
  {
    federalEin: z.ZodOptional<z.ZodString>
    taxPayerType: z.ZodOptional<
      z.ZodEnum<{
        [x: string]: string
      }>
    >
    filingForm: z.ZodOptional<
      z.ZodEnum<{
        [x: string]: string
      }>
    >
    legalName: z.ZodString
  },
  z.core.$strip
>

/**
 * Per-form map of registered field `name` → DOM element. Populated by `useField`
 * via a ref callback, consumed by `composeSubmitHandler` to focus the visually
 * first invalid field across multiple composed forms.
 *
 * Lives here (next to `useField`) rather than in `partner-hook-utils` so the
 * established module-boundary direction (`partner-hook-utils` → `Common`) is
 * preserved. Partner code consumes it via re-exports from `partner-hook-utils/form`.
 */
declare interface FieldElementRegistry {
  register: (name: string, element: HTMLElement | null) => void
  get: (name: string) => HTMLElement | null
  names: () => string[]
}

export declare interface FieldMetadata {
  name: string
  isRequired?: boolean
  isDisabled?: boolean
  hasRedactedValue?: boolean
}

export declare interface FieldMetadataWithOptions<TEntry = unknown> extends FieldMetadata {
  options: Array<{
    label: string
    value: string
  }>
  entries?: readonly TEntry[]
}

export declare type FieldsMetadata = {
  [key: string]: FieldMetadata | FieldMetadataWithOptions
}

declare interface FieldsMetadataConfig<T extends Record<string, z.ZodType>> {
  getFieldsMetadata: (data?: Record<string, unknown>) => Record<keyof T, FieldMetadata>
  /** Form field names that predicate-based requiredness rules read at runtime. */
  predicateDeps: string[]
}

declare const fieldValidators: {
  description: z.ZodString
  recurring: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodBoolean>
  deductAsPercentage: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodBoolean>
  amount: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  totalAmount: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  annualMaximum: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  garnishmentType: z.ZodEnum<{
    readonly ChildSupport: 'child_support'
    readonly FederalTaxLien: 'federal_tax_lien'
    readonly StateTaxLien: 'state_tax_lien'
    readonly StudentLoan: 'student_loan'
    readonly CreditorGarnishment: 'creditor_garnishment'
    readonly FederalLoan: 'federal_loan'
    readonly OtherGarnishment: 'other_garnishment'
  }>
}

declare const fieldValidators_10: {
  splitBy: z.ZodEnum<{
    Percentage: 'Percentage'
    Amount: 'Amount'
  }>
  splitAmount: z.ZodRecord<
    z.ZodString,
    z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodNullable<z.ZodNumber>>
  >
  priority: z.ZodRecord<z.ZodString, z.ZodNumber>
}

declare const fieldValidators_11: {
  filingStatus: z.ZodString
  twoJobs: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodBoolean>
  dependentsAmount: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  otherIncome: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  deductions: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  extraWithholding: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
}

declare const fieldValidators_12: {
  signature: z.ZodString
  confirmSignature: z.ZodBoolean
  usedPreparer: z.ZodEnum<{
    yes: 'yes'
    no: 'no'
  }>
  preparerFirstName: z.ZodString
  preparerLastName: z.ZodString
  preparerStreet1: z.ZodString
  preparerStreet2: z.ZodString
  preparerCity: z.ZodString
  preparerState: z.ZodString
  preparerZip: z.ZodString
  preparerSignature: z.ZodString
  preparerAgree: z.ZodBoolean
  preparer2FirstName: z.ZodString
  preparer2LastName: z.ZodString
  preparer2Street1: z.ZodString
  preparer2Street2: z.ZodString
  preparer2City: z.ZodString
  preparer2State: z.ZodString
  preparer2Zip: z.ZodString
  preparer2Signature: z.ZodString
  preparer2Agree: z.ZodBoolean
  preparer3FirstName: z.ZodString
  preparer3LastName: z.ZodString
  preparer3Street1: z.ZodString
  preparer3Street2: z.ZodString
  preparer3City: z.ZodString
  preparer3State: z.ZodString
  preparer3Zip: z.ZodString
  preparer3Signature: z.ZodString
  preparer3Agree: z.ZodBoolean
  preparer4FirstName: z.ZodString
  preparer4LastName: z.ZodString
  preparer4Street1: z.ZodString
  preparer4Street2: z.ZodString
  preparer4City: z.ZodString
  preparer4State: z.ZodString
  preparer4Zip: z.ZodString
  preparer4Signature: z.ZodString
  preparer4Agree: z.ZodBoolean
}

declare const fieldValidators_13: {
  customName: z.ZodString
  frequency: z.ZodEnum<{
    'Every week': 'Every week'
    'Every other week': 'Every other week'
    'Twice per month': 'Twice per month'
    Monthly: 'Monthly'
  }>
  customTwicePerMonth: z.ZodString
  anchorPayDate: z.ZodPipe<z.ZodTransform<string | null, unknown>, z.ZodNullable<z.ZodISODate>>
  anchorEndOfPayPeriod: z.ZodPipe<
    z.ZodTransform<string | null, unknown>,
    z.ZodNullable<z.ZodISODate>
  >
  day1: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  day2: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
}

declare const fieldValidators_14: {
  signature: z.ZodString
  confirmSignature: z.ZodBoolean
}

declare const fieldValidators_2: {
  state: z.ZodString
  fipsCode: z.ZodString
  caseNumber: z.ZodString
  orderNumber: z.ZodString
  remittanceNumber: z.ZodString
  payPeriodMaximum: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  amount: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  paymentPeriod: z.ZodEnum<{
    readonly EveryWeek: 'Every week'
    readonly EveryOtherWeek: 'Every other week'
    readonly TwicePerMonth: 'Twice per month'
    readonly Monthly: 'Monthly'
  }>
}

declare const fieldValidators_3: {
  /**
   * Optional in both modes. Setting title here scopes the change to this
   * compensation's `effectiveDate` — pair it with a future-dated comp to
   * schedule a promotion title alongside a rate change. Use
   * `useJobForm.Fields.Title` instead when creating a job (title is required
   * by the API on job creation) or when renaming the active role
   * immediately, and avoid rendering both fields on the same screen.
   */
  title: z.ZodString
  flsaStatus: z.ZodOptional<
    z.ZodEnum<{
      Exempt: 'Exempt'
      'Salaried Nonexempt': 'Salaried Nonexempt'
      Nonexempt: 'Nonexempt'
      Owner: 'Owner'
      'Commission Only Exempt': 'Commission Only Exempt'
      'Commission Only Nonexempt': 'Commission Only Nonexempt'
    }>
  >
  paymentUnit: z.ZodEnum<{
    Hour: 'Hour'
    Week: 'Week'
    Month: 'Month'
    Year: 'Year'
    Paycheck: 'Paycheck'
  }>
  rate: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>
  /**
   * The effective date a new compensation should take effect on.
   *
   * - **create mode (`compensationId` absent)**: required; partners typically default
   *   to the parent job's `hireDate` (onboarding stub-fill) or a future date
   *   (rate change). Must be on or after `hireDate`. Server-side this maps to
   *   POST /v1/jobs/:jobId/compensations.
   * - **update mode (`compensationId` present)**: optional; if omitted the API
   *   keeps the existing effective date. The `hireDate` lower bound is **not**
   *   enforced — loaded values may legitimately predate the hire date. Maps to
   *   PUT /v1/compensations/:id.
   */
  effectiveDate: z.ZodPipe<z.ZodTransform<string | null, unknown>, z.ZodNullable<z.ZodISODate>>
  adjustForMinimumWage: z.ZodBoolean
  minimumWageId: z.ZodString
}

declare const fieldValidators_4: {
  title: z.ZodString
  hireDate: z.ZodPipe<z.ZodTransform<string | null, unknown>, z.ZodNullable<z.ZodISODate>>
  twoPercentShareholder: z.ZodBoolean
  stateWcCovered: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodBoolean>
  stateWcClassCode: z.ZodString
}

declare const fieldValidators_5: {
  firstName: z.ZodString
  middleInitial: z.ZodString
  lastName: z.ZodString
  email: z.ZodEmail
  dateOfBirth: z.ZodISODate
  ssn: z.ZodString
  selfOnboarding: z.ZodBoolean
}

declare const fieldValidators_6: {
  locationUuid: z.ZodString
  effectiveDate: z.ZodISODate
}

declare const fieldValidators_7: {
  street1: z.ZodString
  street2: z.ZodString
  city: z.ZodString
  state: z.ZodString
  zip: z.ZodString
  courtesyWithholding: z.ZodBoolean
  effectiveDate: z.ZodISODate
}

declare const fieldValidators_8: {
  name: z.ZodString
  routingNumber: z.ZodString
  accountNumber: z.ZodString
  accountType: z.ZodEnum<{
    Checking: 'Checking'
    Savings: 'Savings'
  }>
}

declare const fieldValidators_9: {
  type: z.ZodEnum<{
    Check: 'Check'
    'Direct Deposit': 'Direct Deposit'
  }>
}

export declare interface FileInputProps extends Omit<
  SharedFieldLayoutProps,
  'shouldVisuallyHideLabel'
> {
  /**
   * ID for the file input element
   */
  id?: string
  /**
   * Currently selected file
   */
  value: File | null
  /**
   * Callback when file selection changes
   */
  onChange: (file: File | null) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Accepted file types (MIME types or extensions)
   * @example ['image/jpeg', 'image/png', 'application/pdf']
   * @example ['.jpg', '.png', '.pdf']
   */
  accept?: string[]
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the input and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Additional CSS class name
   */
  className?: string
  /**
   * Aria-describedby attribute for accessibility
   */
  'aria-describedby'?: string
}

export declare const FILING_STATUS_VALUES: readonly [
  'Single',
  'Married',
  'Head of Household',
  'Exempt from withholding',
]

declare function FilingStatusField(props: FilingStatusFieldProps): JSX_2.Element

export declare type FilingStatusFieldProps = HookFieldProps<
  SelectHookFieldProps<FederalTaxesRequiredValidation, FilingStatusValue>
>

export declare type FilingStatusValue = (typeof FILING_STATUS_VALUES)[number]

declare function FipsCodeField(props: FipsCodeFieldProps): JSX_2.Element

export declare type FipsCodeFieldProps = HookFieldProps<
  SelectHookFieldProps<ChildSupportGarnishmentRequiredValidation, CountyEntry>
>

declare function FirstNameField(props: FirstNameFieldProps): JSX_2.Element

export declare type FirstNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

declare interface FlowBreadcrumb {
  /**
   * Unique key for the breadcrumb step
   */
  id: string
  /**
   * Translation key for the breadcrumb label
   */
  label: string
  /**
   * Optional translation namespace
   */
  namespace?: string
  /**
   * Optional variables for the breadcrumb label
   */
  variables?: Record<string, unknown>
  /**
   * Event handler for breadcrumb navigation
   */
  onNavigate?: (context: unknown) => unknown
  /**
   * When false, the breadcrumb is rendered as non-clickable even if onNavigate is defined.
   * Defaults to true when onNavigate is present, false otherwise.
   */
  isNavigable?: boolean
}

declare interface FlowContextInterface {
  component: React.ComponentType<CommonComponentInterface> | null
  onEvent: OnEventType<EventType, unknown>
  defaultValues?: Record<string, unknown>
  ctaConfig?: CtaConfig | null
  /**
   * Optional chrome rendered above the active flow component. When omitted
   * (or set to `null`), no header is shown.
   */
  header?: FlowHeaderConfig | null
}

/**
 * Discriminated union describing the chrome rendered above the active flow
 * component. Each variant declares only the data it needs:
 *   - `minimal`     → Back button. Optional `cta` for an extra control next to it.
 *   - `progress`    → Step indicator. Requires `currentStep` / `totalSteps`,
 *                     plus optional `cta`.
 *   - `breadcrumbs` → Breadcrumb trail. Optional `currentBreadcrumbId` /
 *                     `breadcrumbs` (typically populated via
 *                     `buildBreadcrumbs` + `updateBreadcrumbs`), plus optional
 *                     `cta`.
 *
 * `cta` carries the same meaning across every variant: an optional component
 * rendered as part of the header chrome.
 */
declare type FlowHeaderConfig =
  | {
      type: 'minimal'
      cta?: React.ComponentType
    }
  | {
      type: 'progress'
      currentStep: number
      totalSteps: number
      cta?: React.ComponentType
    }
  | {
      type: 'breadcrumbs'
      currentBreadcrumbId?: string
      breadcrumbs?: BreadcrumbTrail
      cta?: React.ComponentType
    }

declare function FlsaStatusField(props: FlsaStatusFieldProps): JSX_2.Element

export declare type FlsaStatusFieldProps = HookFieldProps<
  SelectHookFieldProps<CompensationRequiredValidation, FlsaStatusType>
>

declare type FooterKeys<T> = keyof T | string

declare type FormDataFromValidators<T extends Record<string, z.ZodType>> = {
  [K in keyof T]: z.infer<T[K]>
}

export declare interface FormFieldsMetadataContextValue {
  metadata: FieldsMetadata
  errors: SDKError[]
}

export declare function FormFieldsMetadataProvider({
  metadata,
  errors,
  children,
}: FormFieldsMetadataProviderProps): JSX_2.Element

declare interface FormFieldsMetadataProviderProps {
  metadata: Record<string, FieldMetadata | FieldMetadataWithOptions>
  errors: SDKError[]
  children: ReactNode
}

/**
 * Narrowed shape for `formHookResult` props on HookField components.
 *
 * Derived from {@link BaseFormHookReady} so `errorHandling` and `fieldsMetadata`
 * stay in sync with hook return types. `control` is typed as `unknown` because
 * react-hook-form's `Control<T>` is invariant on `T` — the single `as Control`
 * cast lives in {@link useHookFieldResolution}, the only consumer.
 *
 * `_fieldElementRegistry` is forwarded from {@link HookFormInternals} so HookFields
 * can self-publish the registry for descendant `useField` calls when partners
 * use the prop-based field connection path (no `SDKFormProvider`).
 */
export declare type FormHookResult = {
  errorHandling: Pick<BaseFormHookReady['errorHandling'], 'errors'>
  form: Pick<BaseFormHookReady['form'], 'fieldsMetadata'> & {
    hookFormInternals: {
      formMethods: {
        control: unknown
      }
      _fieldElementRegistry?: FieldElementRegistry
    }
  }
}

declare const FREQUENCY_VALUES: readonly [
  'Every week',
  'Every other week',
  'Twice per month',
  'Monthly',
]

declare function FrequencyField(props: FrequencyFieldProps): JSX_2.Element

export declare type FrequencyFieldProps = HookFieldProps<
  SelectHookFieldProps<PayScheduleRequiredValidation, PayScheduleFrequency>
>

declare function GarnishmentTypeField(props: GarnishmentTypeFieldProps): JSX_2.Element

export declare type GarnishmentTypeFieldProps = HookFieldProps<
  SelectHookFieldProps<DeductionFormRequiredValidation, GarnishmentType>
>

/**
 * Resolves a question's UI variant from its API shape and per-key promotion
 * rules. Unknown wire types fall through to `text` to mirror the existing
 * `QuestionInput` default branch.
 */
export declare function getQuestionVariant(
  question: EmployeeStateTaxQuestion,
): StateTaxQuestionVariant

export declare function getRequiredAttrKeys(agency?: Agencies | null): Set<SupportedRequiredAttrKey>

export declare interface GustoApiProps extends Omit<GustoProviderProps, 'components'> {
  queryClient?: QueryClient
  components?: Partial<ComponentsContextType>
  children?: default_2.ReactNode
}

/** @deprecated Import from `GustoProvider` instead */
export declare const GustoApiProvider: default_2.FC<GustoApiProps>

export declare const GustoProvider: default_2.FC<GustoApiProps>

/**
 * A provider that accepts UI component adapters through the components prop
 */
export declare const GustoProviderCustomUIAdapter: default_2.FC<GustoProviderCustomUIAdapterProps>

export declare interface GustoProviderCustomUIAdapterProps extends GustoProviderProps {
  children?: default_2.ReactNode
}

export declare interface GustoProviderProps {
  config: APIConfig
  dictionary?: ResourceDictionary
  lng?: string
  locale?: string
  currency?: string
  theme?: GustoSDKTheme
  portalContainer?: HTMLElement
  queryClient?: QueryClient
  components: ComponentsContextType
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
}

declare type GustoSDKTheme = Partial<ReturnType<typeof createTheme>>

declare type GustoSDKThemeColors = Partial<typeof defaultThemeColors>

export declare interface HeadingProps extends Pick<
  HTMLAttributes<HTMLHeadingElement>,
  'className' | 'id'
> {
  /**
   * The HTML heading element to render (h1-h6)
   */
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /**
   * Optional visual style to apply, independent of the semantic heading level
   */
  styledAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /**
   * Text alignment within the heading
   */
  textAlign?: 'start' | 'center' | 'end'
  /**
   * Content to be displayed inside the heading
   */
  children?: ReactNode
}

declare function HireDateField(props: HireDateFieldProps): JSX_2.Element

export declare type HireDateFieldProps = HookFieldProps<
  DatePickerHookFieldProps<JobRequiredValidation>
>

declare interface HolidayItem {
  uuid: string
  name: string
  observedDate: string
  nextObservation: string
}

declare interface HolidayPolicyDetailEmployee extends EmployeeTableItem {
  uuid: string
}

declare interface HolidayPolicyDetailPresentationProps {
  title: string
  subtitle?: string
  onBack: () => void
  backLabel: string
  actions?: ReactNode[]
  holidays: HolidayItem[]
  selectedTabId: string
  onTabChange: (id: string) => void
  employees: Pick<
    EmployeeTableProps<HolidayPolicyDetailEmployee>,
    | 'data'
    | 'searchValue'
    | 'onSearchChange'
    | 'onSearchClear'
    | 'searchPlaceholder'
    | 'itemMenu'
    | 'pagination'
    | 'isFetching'
    | 'emptyState'
  >
  onAddEmployee?: () => void
  removeDialog: RemoveDialogState
  successAlert?: string
  onDismissAlert?: () => void
}

declare function HolidaySelectionForm(props: HolidaySelectionFormProps): JSX_2.Element

declare interface HolidaySelectionFormProps extends BaseComponentInterface {
  companyId: string
  mode?: 'create' | 'edit'
}

declare function HomeAddress({
  FallbackComponent,
  ...props
}: HomeAddressProps & BaseComponentInterface): JSX_2.Element

export declare type HomeAddressEffectiveDateFieldProps = HookFieldProps<
  DatePickerHookFieldProps<HomeAddressRequiredValidation>
>

export declare type HomeAddressErrorCode =
  (typeof HomeAddressErrorCodes)[keyof typeof HomeAddressErrorCodes]

export declare const HomeAddressErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
  readonly INVALID_ZIP: 'INVALID_ZIP'
}

export declare type HomeAddressField = keyof typeof fieldValidators_7

declare interface HomeAddressFields {
  Street1: typeof Street1Field
  Street2: typeof Street2Field
  City: typeof CityField
  State: typeof StateField_2
  Zip: typeof ZipField
  CourtesyWithholding: typeof CourtesyWithholdingField
  EffectiveDate: typeof EffectiveDateField_3 | undefined
}

export declare type HomeAddressFieldsMetadata = UseHomeAddressFormReady['form']['fieldsMetadata']

export declare type HomeAddressFormData = {
  [K in keyof typeof fieldValidators_7]: z.infer<(typeof fieldValidators_7)[K]>
}

export declare type HomeAddressFormFields = UseHomeAddressFormReady['form']['Fields']

export declare type HomeAddressFormOutputs = HomeAddressFormData

export declare type HomeAddressOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_6
>

declare interface HomeAddressProps extends CommonComponentInterface<'Employee.HomeAddress.Management'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

export declare type HomeAddressRequiredValidation = typeof HomeAddressErrorCodes.REQUIRED

declare interface HomeAddressSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: HomeAddressOptionalFieldsToRequire
  withEffectiveDateField?: boolean
}

export declare interface HomeAddressSubmitOptions {
  employeeId?: string
  /** When omitted on update without an effective-date field, the row’s `effectiveDate` from the fetched address is used. */
  effectiveDate?: string
}

/** Error state and recovery actions returned by all hooks. */
export declare interface HookErrorHandling {
  errors: SDKError[]
  retryQueries: () => void
  clearSubmitError: () => void
}

/** Strips `name` from a HookField props type for domain-specific field components that bind `name` internally. */
export declare type HookFieldProps<
  TProps extends {
    name: string
  },
> = Omit<TProps, 'name'>

/** Exposes react-hook-form internals for SDK utilities and advanced partner use cases. */
export declare interface HookFormInternals<TFormData extends FieldValues = FieldValues> {
  formMethods: UseFormReturn<TFormData>
  /**
   * Per-form map of registered field `name` → DOM element. Populated by
   * `useField` via a ref callback and consumed by `composeSubmitHandler` to
   * focus the visually first invalid field across multiple composed forms.
   * `SDKFormProvider` and the `withFieldElementRegistry` HookField wrapper
   * publish it via context for `useField` to populate. Not intended as a
   * partner API surface.
   */
  _fieldElementRegistry?: FieldElementRegistry
}

/** Discriminated union member returned while async data is being fetched. */
export declare interface HookLoadingResult {
  isLoading: true
  errorHandling: HookErrorHandling
}

/** Result shape returned by a successful form submission. */
export declare interface HookSubmitResult<T> {
  mode: 'create' | 'update'
  data: T
}

declare function Industry<T>(props: IndustryProps<T>): JSX_2.Element

declare type IndustryProps<T> = Pick<
  BaseComponentInterface<'Company.Industry'>,
  'onEvent' | 'dictionary'
> &
  Partial<Pick<HTMLAttributes<T>, 'children' | 'className'>> & {
    companyId: string
  }

declare function InformationRequestForm(props: InformationRequestFormProps): JSX_2.Element

declare namespace InformationRequestForm {
  var Footer: ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => JSX_2.Element
}

declare interface InformationRequestFormProps extends BaseComponentInterface<'InformationRequests.InformationRequestForm'> {
  companyId: string
  requestId: string
  onEvent: OnEventType<EventType, unknown>
}

declare function InformationRequestList(props: InformationRequestListProps): JSX_2.Element

declare interface InformationRequestListProps extends BaseComponentInterface<'InformationRequests.InformationRequestList'> {
  companyId: string
  onEvent: BaseComponentInterface['onEvent']
}

export declare namespace InformationRequests {
  export { InformationRequestsFlow, InformationRequestList, InformationRequestForm }
}

declare function InformationRequestsFlow({
  companyId,
  dictionary,
  withAlert,
  onEvent,
}: InformationRequestsFlowProps): JSX_2.Element

declare interface InformationRequestsFlowProps extends Omit<
  BaseComponentInterface<'InformationRequests'>,
  'onEvent'
> {
  companyId: string
  /**
   * When true (default), the submission success alert is rendered at the top of this component.
   * Set to false when embedding in a parent (e.g. PayrollBlockerList) that renders the alert elsewhere.
   */
  withAlert?: boolean
  onEvent?: BaseComponentInterface['onEvent']
}

declare interface InputProps extends Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'className'
  | 'id'
  | 'name'
  | 'placeholder'
  | 'type'
  | 'value'
  | 'onChange'
  | 'onBlur'
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'aria-invalid'
  | 'min'
  | 'max'
  | 'maxLength'
> {
  /**
   * Ref for the input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Content to display at the start of the input
   */
  adornmentStart?: ReactNode
  /**
   * Content to display at the end of the input
   */
  adornmentEnd?: ReactNode
  /**
   * Whether the input is disabled
   */
  isDisabled?: boolean
}

declare type InternalAlert = {
  type: 'error' | 'info' | 'success'
  title: string
  content?: ReactNode
  onDismiss?: () => void
  translationParams?: Record<string, unknown>
  onAction?: () => void
  actionLabel?: string
}

declare function InviteSignatory(
  props: InviteSignatoryProps & BaseComponentInterface,
): JSX_2.Element

declare type InviteSignatoryDefaultValues = RequireAtLeastOne<
  Pick<Signatory, 'firstName' | 'lastName' | 'email' | 'title'> & {
    confirmEmail: string
  }
>

declare interface InviteSignatoryProps extends CommonComponentInterface {
  companyId: string
  defaultValues?: InviteSignatoryDefaultValues
}

export declare type JobErrorCode = (typeof JobErrorCodes)[keyof typeof JobErrorCodes]

export declare const JobErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
}

export declare type JobFieldsMetadata = UseJobFormReady['form']['fieldsMetadata']

export declare type JobFormData = {
  [K in keyof typeof fieldValidators_4]: z.infer<(typeof fieldValidators_4)[K]>
}

export declare interface JobFormFields {
  Title: typeof JobTitleField
  HireDate: typeof HireDateField | undefined
  TwoPercentShareholder: typeof TwoPercentShareholderField | undefined
  StateWcCovered: typeof StateWcCoveredField | undefined
  StateWcClassCode: typeof StateWcClassCodeField | undefined
}

export declare type JobFormOutputs = JobFormData

export declare type JobOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_3
>

export declare type JobRequiredValidation = typeof JobErrorCodes.REQUIRED

declare interface JobSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: JobOptionalFieldsToRequire
  /**
   * When `false`, drops `hireDate` from the validated shape entirely — the
   * field becomes hook-managed rather than user-facing (e.g. an onboarding
   * screen that derives hireDate from the employee's `startDate`). Partners
   * supply the value at submit time via `JobSubmitOptions.hireDate`.
   * Defaults to `true`.
   */
  withHireDateField?: boolean
}

declare function JobsList(props: JobsListProps & BaseComponentInterface): JSX_2.Element

declare interface JobsListProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
}

export declare interface JobSubmitOptions {
  /** Override the `employeeId` configured at hook construction. Useful when the employee is created in the same submit chain. */
  employeeId?: string
  /**
   * Supply `hireDate` at submit time rather than via a rendered field. Use
   * with `withHireDateField: false` for screens that derive hireDate from
   * external context (e.g. the employee's `startDate` during onboarding).
   * Falls back to the loaded job's `hireDate` on update mode when omitted;
   * required (or sourced from a partner default) on create mode.
   */
  hireDate?: string
}

declare function JobTitleField(props: JobTitleFieldProps): JSX_2.Element

export declare type JobTitleFieldProps = HookFieldProps<
  TextInputHookFieldProps<JobRequiredValidation>
>

declare function Landing(props: SummaryProps_2 & BaseComponentInterface): JSX_2.Element

declare function LastNameField(props: LastNameFieldProps): JSX_2.Element

export declare type LastNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

export declare type LinkProps = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  /**
   * URL that the link points to
   */
  | 'href'
  /**
   * Specifies where to open the linked document
   */
  | 'target'
  /**
   * Specifies the relationship between the current document and the linked document
   */
  | 'rel'
  /**
   * Indicates that the link is for downloading a resource
   */
  | 'download'
  /**
   * Additional CSS class name
   */
  | 'className'
  /**
   * Unique identifier for the link
   */
  | 'id'
  /**
   * Handler for key down events
   */
  | 'onKeyDown'
  /**
   * Handler for key up events
   */
  | 'onKeyUp'
  /**
   * Accessible label for the link
   */
  | 'aria-label'
  /**
   * ID of an element that labels this link
   */
  | 'aria-labelledby'
  /**
   * ID of an element that describes this link
   */
  | 'aria-describedby'
  /**
   * Title text shown on hover
   */
  | 'title'
> & {
  /**
   * Content to be displayed inside the link
   */
  children?: ReactNode
}

declare interface LoadingIndicatorContextProps {
  LoadingIndicator: ({ children }: { children?: React.ReactNode }) => JSX.Element
}

export declare interface LoadingSpinnerProps extends Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'id' | 'aria-label'
> {
  /**
   * Size of the spinner
   */
  size?: 'lg' | 'sm'
  /**
   * Display style of the spinner
   */
  style?: 'inline' | 'block'
}

declare function LocationField(props: LocationFieldProps): JSX_2.Element

export declare type LocationFieldProps = HookFieldProps<
  SelectHookFieldProps<WorkAddressRequiredValidation, Location_2>
>

declare function LocationForm({
  companyId,
  locationId,
  className,
  children,
  ...props
}: LocationFormProps & BaseComponentInterface): JSX_2.Element

declare interface LocationFormProps extends CommonComponentInterface {
  companyId: string
  locationId?: string
}

declare function Locations({ companyId, onEvent, dictionary }: LocationsProps): JSX_2.Element

declare interface LocationsProps extends BaseComponentInterface<'Company.Locations'> {
  companyId: string
}

declare function ManagementEmployeeList({
  FallbackComponent,
  ...props
}: ManagementEmployeeListProps & BaseComponentInterface): JSX_2.Element

declare interface ManagementEmployeeListProps extends CommonComponentInterface<'Employee.ManagementEmployeeList'> {
  companyId: string
  initialTab?: EmployeeTab
  onEvent: BaseComponentInterface['onEvent']
}

export declare const MAX_PREPARERS = 4

export declare interface MenuItem extends DataAttributes {
  /**
   * Text label for the menu item
   */
  label: string
  /**
   * Optional icon to display before the label
   */
  icon?: ReactNode
  /**
   * Callback function when the menu item is clicked
   */
  onClick: () => void
  /**
   * Disables the menu item and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Optional URL to navigate to when clicked
   */
  href?: string
}

export declare interface MenuProps extends DataAttributes {
  /**
   * Reference to the element that triggers the menu
   */
  triggerRef?: RefObject<Element | null>
  /**
   * Array of menu items to display
   */
  items?: MenuItem[]
  /**
   * Controls whether the menu is currently open
   */
  isOpen?: boolean
  /**
   * Callback when the menu is closed
   */
  onClose?: () => void
  /**
   * Accessible label describing the menu's purpose
   */
  'aria-label': string
  /**
   * Element to use as the portal container for the menu popover.
   * Overrides the default SDK root container from context.
   */
  portalContainer?: HTMLElement
  /**
   * Controls the placement of the menu popover relative to the trigger
   */
  placement?:
    | 'top'
    | 'top start'
    | 'top end'
    | 'bottom'
    | 'bottom start'
    | 'bottom end'
    | 'left'
    | 'right'
}

declare function MiddleInitialField(props: MiddleInitialFieldProps): JSX_2.Element

export declare type MiddleInitialFieldProps = HookFieldProps<
  TextInputHookFieldProps<EmployeeDetailsRequiredValidation>
>

declare function MinimumWageIdField(props: MinimumWageIdFieldProps): JSX_2.Element

export declare type MinimumWageIdFieldProps = HookFieldProps<
  SelectHookFieldProps<CompensationRequiredValidation, MinimumWage>
>

export declare type MixedErrorSource =
  | QueryWithRefetch
  | {
      errorHandling: HookErrorHandling
    }

export declare interface ModalProps {
  /**
   * Controls whether the modal is open or closed
   */
  isOpen?: boolean
  /**
   * Callback function called when the modal should be closed
   */
  onClose?: () => void
  /**
   * Whether clicking the backdrop should close the modal
   */
  shouldCloseOnBackdropClick?: boolean
  /**
   * Main content to be rendered in the modal body
   */
  children?: ReactNode
  /**
   * Footer content to be rendered at the bottom of the modal
   */
  footer?: ReactNode
  /**
   * Optional ref to the backdrop container
   */
  containerRef?: React.RefObject<HTMLDivElement | null>
}

declare type MultipleSelectionProps<T> = {
  selectionMode?: 'multiple'
  onSelect: (item: T, checked: boolean) => void
  /**
   * Called when the select-all checkbox is toggled.
   * The header checkbox state reflects only the currently visible `data` array.
   * With pagination, consumers decide whether to select all data or only the visible page.
   * `visibleData` is the current page's data array for reference.
   */
  onSelectAll?: (checked: boolean, visibleData: T[]) => void
  /**
   * Required for multi-select. Returns whether a given item is currently selected.
   * Use a stable identifier from the item (e.g. item.id) rather than array index.
   */
  getIsItemSelected: (item: T) => boolean
}

declare interface MultiSelectComboBoxOption {
  label: string
  value: string
}

declare interface MultiSelectComboBoxProps
  extends
    SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  inputRef?: Ref<HTMLInputElement>
  isDisabled?: boolean
  isInvalid?: boolean
  isLoading?: boolean
  label: string
  options: MultiSelectComboBoxOption[]
  value?: string[]
  onChange?: (values: string[]) => void
  onBlur?: () => void
}

declare function NameField(props: NameFieldProps): JSX_2.Element

export declare type NameFieldProps = HookFieldProps<
  TextInputHookFieldProps<BankFormRequiredValidation>
>

export declare type NameValidation = (typeof EmployeeDetailsErrorCodes)['REQUIRED' | 'INVALID_NAME']

declare function needsDay1(data: PayScheduleFormData): boolean

declare function needsDay2(data: PayScheduleFormData): boolean

declare function NewHireReport(props: NewHireReportProps): JSX_2.Element

declare interface NewHireReportProps extends BaseComponentInterface<'Contractor.NewHireReport'> {
  contractorId: string
  selfOnboarding?: boolean
}

/**
 * Normalizes any caught error into a unified `SDKError`.
 *
 * Classification is based purely on the error type:
 * - `SDKInternalError` → uses the error's own `category` (default: `internal_error`)
 * - `GustoEmbeddedError` subclasses → `api_error`
 * - `SDKValidationError` → `validation_error`
 * - `HTTPClientError` subclasses → `network_error`
 * - Everything else → `internal_error`
 */
export declare function normalizeToSDKError(error: unknown): SDKError

declare type NoSelectionProps = {
  onSelect?: undefined
  onSelectAll?: undefined
  getIsItemSelected?: undefined
  selectionMode?: undefined
}

export declare function NumberInputHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  format,
  min,
  max,
  placeholder,
  validationMessages,
  FieldComponent,
}: NumberInputHookFieldProps<TErrorCode>): ReactElement<
  unknown,
  string | JSXElementConstructor<any>
>

export declare interface NumberInputHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  format?: NumberInputProps['format']
  min?: NumberInputProps['min']
  max?: NumberInputProps['max']
  placeholder?: NumberInputProps['placeholder']
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<NumberInputProps>
}

export declare interface NumberInputProps
  extends
    SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'min' | 'max' | 'name' | 'id' | 'placeholder' | 'className'
    > {
  /**
   * Format type for the number input
   */
  format?: 'currency' | 'decimal' | 'percent'
  /**
   * React ref for the number input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Current value of the number input
   */
  value?: number
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the number input and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Callback when number input value changes
   */
  onChange?: (value: number) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Element to display at the start of the input
   */
  adornmentStart?: InputProps['adornmentStart']
  /**
   * Element to display at the end of the input
   */
  adornmentEnd?: InputProps['adornmentEnd']
  /**
   * Minimum number of decimal places to display
   */
  minimumFractionDigits?: number
  /**
   * Maximum number of decimal places to display
   */
  maximumFractionDigits?: number
}

export declare type NumberStateTaxFieldProps = BaseStateTaxFieldProps & {
  FieldComponent?: ComponentType<NumberInputProps>
}

declare interface ObservabilityContextValue {
  observability: ObservabilityHook | undefined
}

/**
 * An `SDKError` enriched with internal component context for observability telemetry.
 *
 * Partners receive this type through `ObservabilityHook.onError`. It extends the
 * core `SDKError` with `timestamp`, `componentName`, and `componentStack` so that
 * error-tracking tools (e.g. Sentry) can correlate and group errors.
 *
 * The base `SDKError` (without these fields) is the type used in partner-facing
 * hooks like `useEmployeeForm`, keeping the public API clean.
 */
export declare interface ObservabilityError extends SDKError {
  /** When the error occurred (Unix timestamp in milliseconds) */
  timestamp: number
  /** SDK component where the error occurred (e.g. "Employee.Profile") */
  componentName?: string
  /** React component stack trace (present only for errors caught by ErrorBoundary) */
  componentStack?: string
}

/**
 * Observability hook interface for SDK consumers to implement
 *
 * @example
 * ```tsx
 * import * as Sentry from '@sentry/react'
 * import { GustoProvider } from '@gusto/embedded-react-sdk'
 *
 * <GustoProvider
 *   config={{
 *     baseUrl: '/api/',
 *     observability: {
 *       onError: (error: ObservabilityError) => {
 *         Sentry.captureException(error.raw, {
 *           level: error.category === 'validation_error' ? 'warning' : 'error',
 *           tags: {
 *             error_category: error.category,
 *             component: error.componentName ?? 'unknown',
 *             http_status: String(error.httpStatus ?? ''),
 *           },
 *         })
 *       },
 *       onMetric: (metric) => {
 *         console.log(`[Metric] ${metric.name}: ${metric.value}${metric.unit}`)
 *       },
 *       sanitization: {
 *         enabled: true,
 *         includeRawError: false,
 *       }
 *     }
 *   }}
 * >
 *   <YourApp />
 * </GustoProvider>
 * ```
 */
export declare interface ObservabilityHook {
  /**
   * Called when an error is caught by error boundaries or form submission fails.
   * Receives an `ObservabilityError` — an `SDKError` enriched with `componentName`
   * and (for boundary errors) `componentStack`.
   */
  onError?: (error: ObservabilityError) => void
  /**
   * Called to track performance metrics for component operations.
   */
  onMetric?: (metric: ObservabilityMetric) => void
  /**
   * Configuration for sanitizing data before sending to observability tools.
   * Default: `{ enabled: true, includeRawError: false }`
   */
  sanitization?: SanitizationConfig
}

export declare interface ObservabilityMetric {
  /** Metric name (e.g., 'sdk.form.submit_duration', 'sdk.component.loading_duration') */
  name: string
  /** Metric value */
  value: number
  /** Metric unit */
  unit?: ObservabilityMetricUnit
  /** Tags for filtering/grouping */
  tags?: Record<string, string>
  /** When the metric was recorded (Unix timestamp in milliseconds) */
  timestamp: number
}

export declare type ObservabilityMetricUnit = 'ms' | 'count' | 'bytes' | 'percent'

export declare const ObservabilityProvider: ({
  children,
  observability,
}: ObservabilityProviderProps) => JSX_2.Element

export declare interface ObservabilityProviderProps {
  children: ReactNode
  observability?: ObservabilityHook
}

declare function OffCycleCreation(props: OffCycleCreationProps): JSX_2.Element

declare interface OffCycleCreationFormData extends OffCyclePayPeriodDateFormData {
  reason: OffCycleReason
  skipRegularDeductions: boolean
  includeAllEmployees: boolean
  selectedEmployeeUuids: string[]
}

declare interface OffCycleCreationProps extends BaseComponentInterface<'Payroll.OffCycleCreation'> {
  companyId: string
  payrollType?: OffCyclePayrollDateType
}

declare function OffCycleDeductionsSetting({
  dictionary,
  skipRegularDeductions,
  onEvent,
}: OffCycleDeductionsSettingProps): JSX_2.Element

declare interface OffCycleDeductionsSettingChangePayload {
  skipRegularDeductions: boolean
}

declare interface OffCycleDeductionsSettingProps extends CommonComponentInterface<'Payroll.OffCycleDeductionsSetting'> {
  skipRegularDeductions: boolean
  onEvent: OnEventType<EventType, unknown>
}

declare function OffCycleFlow({
  companyId,
  payrollType,
  onEvent,
  withReimbursements,
}: OffCycleFlowProps): JSX_2.Element

declare interface OffCycleFlowContextInterface extends FlowContextInterface {
  companyId: string
  payrollUuid?: string
  payrollType?: OffCycleReason
  withReimbursements?: boolean
}

declare interface OffCycleFlowProps {
  companyId: string
  payrollType?: OffCycleReason
  onEvent: OnEventType<EventType, unknown>
  withReimbursements?: boolean
}

declare interface OffCyclePayPeriodDateFormData {
  isCheckOnly: boolean
  startDate: Date | null
  endDate: Date | null
  checkDate: Date | null
}

declare type OffCyclePayrollDateType = 'bonus' | 'correction'

declare type OffCycleReason = 'bonus' | 'correction'

declare interface OffCycleReasonDefaults {
  skipDeductions: boolean
  withholdingType: WithholdingType
}

declare function OffCycleReasonSelection(props: OffCycleReasonSelectionProps): JSX_2.Element

declare interface OffCycleReasonSelectionProps extends BaseComponentInterface<'Payroll.OffCycleReasonSelection'> {
  companyId: string
}

declare type OnboardingDefaultValues = RequireAtLeastOne<{
  profile?: ProfileDefaultValues
  compensation?: CompensationDefaultValues
}>

declare const OnboardingFlow: ({
  companyId,
  onEvent,
  defaultValues,
}: OnboardingFlowProps) => JSX_2.Element

declare const OnboardingFlow_2: ({
  companyId,
  onEvent,
  defaultValues,
}: OnboardingFlowProps_2) => JSX_2.Element

declare const OnboardingFlow_3: ({
  companyId,
  onEvent,
  defaultValues,
  isSelfOnboardingEnabled,
  withEmployeeI9,
}: OnboardingFlowProps_3) => JSX_2.Element

declare type OnboardingFlowDefaultValues = RequireAtLeastOne<{
  federalTaxes?: FederalTaxesDefaultValues
  paySchedule?: PayScheduleDefaultValues
}>

declare type OnboardingFlowDefaultValues_2 = RequireAtLeastOne<{
  profile?: UseContractorProfileProps['defaultValues']
  address?: AddressDefaultValues
}>

declare interface OnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingFlowDefaultValues>
}

declare interface OnboardingFlowProps_2 extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingFlowDefaultValues_2>
}

declare interface OnboardingFlowProps_3 extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingDefaultValues>
  isSelfOnboardingEnabled?: boolean
  withEmployeeI9?: boolean
}

declare function OnboardingOverview(
  props: OnboardingOverviewProps & BaseComponentInterface,
): JSX_2.Element

declare interface OnboardingOverviewProps extends CommonComponentInterface<'Company.OnboardingOverview'> {
  companyId: string
}

declare function OnboardingSummary(props: SummaryProps & BaseComponentInterface): JSX_2.Element

declare type OnEventType<K, T> = (type: K, data?: T) => void

declare type OptionalFieldsToRequire<TConfig> = {
  create?: Array<OptionalOnCreate<TConfig>>
  update?: Array<OptionalOnUpdate<TConfig>>
}

declare type OptionalOnCreate<TConfig> = {
  [K in keyof TConfig & string]: TConfig[K] extends 'update' | 'never' ? K : never
}[keyof TConfig & string]

declare type OptionalOnUpdate<TConfig> = {
  [K in keyof TConfig & string]: TConfig[K] extends 'create' | 'never' ? K : never
}[keyof TConfig & string]

export declare type OrderedListProps = BaseListProps

declare function OrderNumberField(props: OrderNumberFieldProps): JSX_2.Element

export declare type OrderNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<ChildSupportGarnishmentRequiredValidation>
>

declare function OtherIncomeField(props: OtherIncomeFieldProps): JSX_2.Element

export declare type OtherIncomeFieldProps = HookFieldProps<
  NumberInputHookFieldProps<FederalTaxesRequiredValidation>
>

export declare type PaginationControlProps = {
  handleFirstPage: () => void
  handlePreviousPage: () => void
  handleNextPage: () => void
  handleLastPage: () => void
  handleItemsPerPageChange: (n: PaginationItemsPerPage) => void
  currentPage: number
  totalPages: number
  totalCount?: number
  itemsPerPage?: PaginationItemsPerPage
  isFetching?: boolean
}

export declare type PaginationItemsPerPage = 5 | 10 | 50

declare const PAY_PERIODS: {
  readonly HOUR: 'Hour'
  readonly WEEK: 'Week'
  readonly MONTH: 'Month'
  readonly YEAR: 'Year'
  readonly PAYCHECK: 'Paycheck'
}

export declare const PAYMENT_METHOD_TYPES: readonly ['Direct Deposit', 'Check']

declare const PaymentFlow: ({ companyId, onEvent }: PaymentFlowProps) => JSX_2.Element

declare interface PaymentFlowProps extends BaseComponentInterface {
  companyId: string
}

declare function PaymentHistory(props: PaymentHistoryProps): JSX_2.Element

declare interface PaymentHistoryProps extends BaseComponentInterface<'Contractor.Payments.PaymentHistory'> {
  paymentId: string
}

declare function PaymentMethod(props: PaymentMethodProps): JSX_2.Element

declare function PaymentMethod_2({
  dictionary,
  FallbackComponent,
  ...props
}: PaymentMethodProps_2 & BaseComponentInterface): JSX_2.Element

declare function PaymentMethod_3({
  dictionary,
  FallbackComponent,
  ...props
}: PaymentMethodProps_3 & BaseComponentInterface): JSX_2.Element

export declare type PaymentMethodFormData = {
  [K in keyof typeof fieldValidators_9]: z.infer<(typeof fieldValidators_9)[K]>
}

export declare type PaymentMethodFormErrorCode =
  (typeof PaymentMethodFormErrorCodes)[keyof typeof PaymentMethodFormErrorCodes]

export declare const PaymentMethodFormErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
}

export declare type PaymentMethodFormField = keyof typeof fieldValidators_9

export declare interface PaymentMethodFormFields {
  Type: typeof TypeField
}

export declare type PaymentMethodFormFieldsMetadata =
  UsePaymentMethodFormReady['form']['fieldsMetadata']

export declare type PaymentMethodFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_8
>

export declare type PaymentMethodFormOutputs = PaymentMethodFormData

export declare type PaymentMethodFormRequiredValidation =
  typeof PaymentMethodFormErrorCodes.REQUIRED

declare interface PaymentMethodFormSchemaOptions {
  optionalFieldsToRequire?: PaymentMethodFormOptionalFieldsToRequire
}

declare interface PaymentMethodProps extends BaseComponentInterface<'Contractor.PaymentMethod'> {
  contractorId: string
}

declare interface PaymentMethodProps_2 extends CommonComponentInterface<'Employee.PaymentMethod'> {
  employeeId: string
  defaultValues?: never
  isAdmin?: boolean
  onEvent: OnEventType<EventType, unknown>
}

declare interface PaymentMethodProps_3 extends CommonComponentInterface<'Employee.PaymentMethod'> {
  employeeId: string
  defaultValues?: never
  isAdmin?: boolean
  initialState?: 'list' | 'add' | 'split'
  onEvent: OnEventType<EventType, unknown>
}

export declare type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number]

declare function PaymentPeriodField(props: PaymentPeriodFieldProps): JSX_2.Element

export declare type PaymentPeriodFieldProps = HookFieldProps<
  SelectHookFieldProps<ChildSupportGarnishmentRequiredValidation, PaymentPeriod>
>

declare function PaymentsList(props: PaymentsListProps): JSX_2.Element

declare interface PaymentsListProps extends BaseComponentInterface<'Contractor.Payments.PaymentsList'> {
  companyId: string
  alerts?: InternalAlert[]
}

declare function PaymentStatement(props: PaymentStatementProps): JSX_2.Element

declare interface PaymentStatementProps extends BaseComponentInterface<'Contractor.Payments.PaymentStatement'> {
  paymentGroupId: string
  contractorUuid: string
}

declare const PaymentSummary: ({
  paymentGroupId,
  companyId,
  onEvent,
  alerts,
}: PaymentSummaryProps) => JSX_2.Element | null

declare interface PaymentSummaryProps {
  paymentGroupId: string
  companyId: string
  onEvent: (type: EventType, data?: unknown) => void
  alerts?: InternalAlert[]
}

declare function PaymentUnitField(props: PaymentUnitFieldProps): JSX_2.Element

export declare type PaymentUnitFieldProps = HookFieldProps<
  SelectHookFieldProps<CompensationRequiredValidation, PaymentUnit>
>

declare function PayPeriodMaximumField(props: PayPeriodMaximumFieldProps): JSX_2.Element

export declare type PayPeriodMaximumFieldProps = HookFieldProps<
  NumberInputHookFieldProps<PayPeriodMaximumValidation>
>

export declare type PayPeriodMaximumValidation =
  | ChildSupportGarnishmentRequiredValidation
  | ChildSupportGarnishmentNegativeAmountValidation

export declare namespace Payroll {
  export {
    PayrollConfiguration,
    PayrollEditEmployee,
    PayrollHistory,
    PayrollLanding,
    PayrollList,
    OffCycleReasonSelection,
    OffCycleReason,
    OffCycleReasonDefaults,
    OffCycleReasonSelectionProps,
    SelectReasonPayload,
    OffCycleDeductionsSetting,
    OffCycleDeductionsSettingProps,
    OffCycleDeductionsSettingChangePayload,
    PayrollOverview,
    PayrollFlow,
    PayrollExecutionFlow,
    PayrollExecutionFlowProps,
    PayrollExecutionInitialState,
    PayrollReceipts,
    ConfirmWireDetails,
    ConfirmWireDetailsProps,
    ConfirmWireDetailsComponentType,
    PayrollBlockerList,
    ApiPayrollBlocker,
    RecoveryCases,
    OffCyclePayPeriodDateFormData,
    OffCyclePayrollDateType,
    OffCycleCreation,
    OffCycleCreationProps,
    OffCycleCreationFormData,
    OffCycleFlow,
    OffCycleFlowContextInterface,
    OffCycleFlowProps,
    DismissalFlow,
    DismissalFlowProps,
    DismissalFlowContextInterface,
    TransitionFlow,
    TransitionFlowContextInterface,
    TransitionFlowProps,
    TransitionCreation,
    TransitionCreationProps,
    TransitionCreationFormData,
  }
}

/**
 * PayrollBlockerList - DataView-based component displaying payroll blockers
 * Shows each blocker with individual resolution buttons
 * Also displays recovery cases and information requests sections when applicable
 */
declare function PayrollBlockerList(props: PayrollBlockerListProps): JSX_2.Element

declare interface PayrollBlockerListProps extends BaseComponentInterface<'Payroll.PayrollBlocker'> {
  companyId: string
}

declare function PayrollConfiguration(
  props: PayrollConfigurationProps & BaseComponentInterface,
): JSX_2.Element

declare interface PayrollConfigurationProps extends BaseComponentInterface<'Payroll.PayrollConfiguration'> {
  companyId: string
  payrollId: string
  alerts?: ReactNode
  withReimbursements?: boolean
}

declare function PayrollEditEmployee(
  props: PayrollEditEmployeeProps & BaseComponentInterface,
): JSX_2.Element

declare interface PayrollEditEmployeeProps extends BaseComponentInterface<'Payroll.PayrollEditEmployee'> {
  employeeId: string
  companyId: string
  payrollId: string
  withReimbursements?: boolean
}

declare function PayrollExecutionFlow({
  companyId,
  payrollId,
  onEvent,
  initialPayPeriod,
  isDismissalPayroll: isDismissal,
  withReimbursements,
  ConfirmWireDetailsComponent,
  prefixBreadcrumbs,
  initialState,
}: PayrollExecutionFlowProps): JSX_2.Element

declare interface PayrollExecutionFlowProps {
  companyId: string
  payrollId: string
  onEvent: OnEventType<EventType, unknown>
  initialPayPeriod?: PayrollPayPeriodType
  isDismissalPayroll?: boolean
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  prefixBreadcrumbs?: FlowBreadcrumb[]
  initialState?: PayrollExecutionInitialState
}

declare type PayrollExecutionInitialState = 'configuration' | 'overview'

declare const PayrollFlow: ({
  companyId,
  onEvent,
  withReimbursements,
  ConfirmWireDetailsComponent,
}: PayrollFlowProps) => JSX_2.Element

declare type PayrollFlowAlert = {
  type: 'error' | 'info' | 'success'
  title: string
  content?: ReactNode
  onDismiss?: () => void
  alertKey?: string
}

declare interface PayrollFlowProps extends BaseComponentInterface {
  companyId: string
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
}

declare function PayrollHistory(props: PayrollHistoryProps): JSX_2.Element

declare interface PayrollHistoryProps extends BaseComponentInterface<'Payroll.PayrollHistory'> {
  companyId: string
}

declare function PayrollLanding(props: PayrollLandingProps): JSX_2.Element

declare interface PayrollLandingProps extends BaseComponentInterface<'Payroll.PayrollLanding'> {
  companyId: string
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  showPayrollCancelledAlert?: boolean
}

declare function PayrollList(props: PayrollListBlockProps): JSX_2.Element

declare interface PayrollListBlockProps extends BaseComponentInterface {
  companyId: string
}

export declare interface PayrollLoadingProps {
  title: ReactNode
  description?: ReactNode
}

declare type PayrollOption = 'dismissalPayroll' | 'regularPayroll' | 'anotherWay'

declare function PayrollOverview(props: PayrollOverviewProps): JSX_2.Element

declare interface PayrollOverviewProps extends BaseComponentInterface<'Payroll.PayrollOverview'> {
  companyId: string
  payrollId: string
  alerts?: PayrollFlowAlert[]
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
}

declare function PayrollReceipts(props: PayrollReceiptsProps): JSX_2.Element

declare interface PayrollReceiptsProps extends BaseComponentInterface<'Payroll.PayrollReceipts'> {
  payrollId: string
  withReimbursements?: boolean
}

declare const PaySchedule: ({
  companyId,
  defaultValues,
  dictionary,
  ...props
}: PayScheduleProps & BaseComponentInterface) => JSX_2.Element

declare type PayScheduleDefaultFields = {
  [K in keyof Pick<
    PayScheduleFormData,
    'anchorPayDate' | 'anchorEndOfPayPeriod' | 'day1' | 'day2' | 'customName' | 'frequency'
  >]: NonNullable<PayScheduleFormData[K]>
}

declare type PayScheduleDefaultValues = RequireAtLeastOne<Partial<PayScheduleDefaultFields>>

export declare type PayScheduleErrorCode =
  (typeof PayScheduleErrorCodes)[keyof typeof PayScheduleErrorCodes]

export declare const PayScheduleErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
  readonly DAY_RANGE: 'DAY_RANGE'
}

export declare type PayScheduleField = keyof typeof fieldValidators_13

declare interface PayScheduleFields {
  CustomName: typeof CustomNameField
  Frequency: typeof FrequencyField
  CustomTwicePerMonth: typeof CustomTwicePerMonthField | undefined
  AnchorPayDate: typeof AnchorPayDateField
  AnchorEndOfPayPeriod: typeof AnchorEndOfPayPeriodField
  Day1: typeof Day1Field | undefined
  Day2: typeof Day2Field | undefined
}

export declare type PayScheduleFieldsMetadata = UsePayScheduleFormReady['form']['fieldsMetadata']

export declare type PayScheduleFormData = {
  [K in keyof typeof fieldValidators_13]: z.infer<(typeof fieldValidators_13)[K]>
}

export declare type PayScheduleFormFields = UsePayScheduleFormReady['form']['Fields']

export declare type PayScheduleFormOutputs = PayScheduleFormData

export declare type PayScheduleFrequency = (typeof FREQUENCY_VALUES)[number]

export declare type PayScheduleOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_11
>

declare interface PayScheduleProps extends CommonComponentInterface<'Company.PaySchedule'> {
  companyId: string
  defaultValues?: PayScheduleDefaultValues
}

export declare type PayScheduleRequiredValidation = typeof PayScheduleErrorCodes.REQUIRED

declare interface PayScheduleSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: PayScheduleOptionalFieldsToRequire
}

declare function PolicyConfigurationForm(props: PolicyConfigurationFormProps): JSX_2.Element

declare interface PolicyConfigurationFormData {
  name: string
  accrualMethod: AccrualMethod
  accrualRate?: number
  accrualRateUnit?: number
  includeOvertime?: boolean
  allPaidHours?: boolean
  accrualMethodFixed?: AccrualMethodFixed
  resetDateType?: ResetDateType
  resetMonth?: number
  resetDay?: number
}

declare interface PolicyConfigurationFormProps extends BaseComponentInterface<'Company.TimeOff.CreateTimeOffPolicy'> {
  companyId: string
  policyType: 'sick' | 'vacation'
  policyId?: string
  defaultValues?: Partial<PolicyConfigurationFormData>
}

declare type PolicyDetails = UnlimitedPolicyDetails | RateBasedPolicyDetails

declare function PolicyList({ FallbackComponent, ...props }: PolicyListProps): JSX_2.Element

declare interface PolicyListProps extends BaseComponentInterface<'Company.TimeOff.TimeOffPolicies'> {
  companyId: string
}

declare type PolicySettingsAccrualMethod =
  | 'hours_worked'
  | 'fixed_per_pay_period'
  | 'fixed_all_at_once'

declare interface PolicySettingsDisplay {
  maxAccrualHoursPerYear: number | null
  maxHours: number | null
  carryoverLimitHours: number | null
  accrualWaitingPeriodDays: number | null
  paidOutOnTermination: boolean
}

declare interface PolicySettingsFormData {
  accrualMaximumEnabled: boolean
  accrualMaximum?: number
  balanceMaximumEnabled: boolean
  balanceMaximum?: number
  carryOverLimitEnabled: boolean
  carryOverLimit?: number
  waitingPeriodEnabled: boolean
  waitingPeriod?: number
  paidOutOnTermination: boolean
}

declare function PolicySettingsPresentation({
  accrualMethod,
  onContinue,
  onBack,
  defaultValues,
  mode,
  editingPolicyName,
  isPending,
}: PolicySettingsPresentationProps): JSX_2.Element

declare interface PolicySettingsPresentationProps {
  accrualMethod: PolicySettingsAccrualMethod
  onContinue: (data: PolicySettingsFormData) => void
  onBack: () => void
  defaultValues?: Partial<PolicySettingsFormData>
  mode?: 'create' | 'edit'
  editingPolicyName?: string
  isPending?: boolean
}

declare type PolicyType = 'sick' | 'vacation' | 'holiday'

declare type PolicyTypeKey = 'vacation' | 'sick'

declare function PolicyTypeSelector(props: PolicyTypeSelectorProps): JSX_2.Element

declare interface PolicyTypeSelectorProps extends BaseComponentInterface<'Company.TimeOff.SelectPolicyType'> {
  companyId: string
  defaultPolicyType?: PolicyType
}

declare function Preparer1City(props: PreparerTextFieldProps): JSX_2.Element

declare function Preparer1ConfirmSignature(props: PreparerCheckboxFieldProps): JSX_2.Element

declare const preparer1Fields: {
  FirstName: typeof Preparer1FirstName
  LastName: typeof Preparer1LastName
  Street1: typeof Preparer1Street1
  Street2: typeof Preparer1Street2
  City: typeof Preparer1City
  State: typeof Preparer1State
  Zip: typeof Preparer1Zip
  Signature: typeof Preparer1Signature
  ConfirmSignature: typeof Preparer1ConfirmSignature
}

declare function Preparer1FirstName(props: PreparerTextFieldProps): JSX_2.Element

declare function Preparer1LastName(props: PreparerTextFieldProps): JSX_2.Element

declare function Preparer1Signature(props: PreparerTextFieldProps): JSX_2.Element

declare function Preparer1State(props: PreparerSelectFieldProps): JSX_2.Element

declare function Preparer1Street1(props: PreparerTextFieldProps): JSX_2.Element

declare function Preparer1Street2(props: PreparerTextFieldProps): JSX_2.Element

declare function Preparer1Zip(props: PreparerTextFieldProps): JSX_2.Element

export declare const PREPARER_FIELDS_BY_INDEX: SignEmployeeFormField[][]

export declare type PreparerCheckboxFieldProps = HookFieldProps<
  CheckboxHookFieldProps<SignEmployeeFormRequiredValidation>
>

export declare type PreparerFieldGroup = typeof preparer1Fields

export declare function preparerFieldName(index: PreparerIndex, field: PreparerFieldSuffix): string

export declare type PreparerFieldSuffix =
  | 'FirstName'
  | 'LastName'
  | 'Street1'
  | 'Street2'
  | 'City'
  | 'State'
  | 'Zip'
  | 'Signature'
  | 'Agree'

export declare type PreparerIndex = 1 | 2 | 3 | 4

declare type PreparerSelectFieldProps = HookFieldProps<
  SelectHookFieldProps<SignEmployeeFormRequiredValidation, string>
>

export declare type PreparerTextFieldProps = HookFieldProps<
  TextInputHookFieldProps<SignEmployeeFormRequiredValidation>
>

declare function Profile({
  FallbackComponent,
  isAdmin,
  ...props
}: ProfileProps & BaseComponentInterface): JSX_2.Element

declare function Profile_2({
  FallbackComponent,
  ...props
}: ProfileProps_2 & Pick<BaseComponentInterface, 'FallbackComponent'>): JSX_2.Element

declare type ProfileDefaultValues = RequireAtLeastOne<{
  employee?: RequireAtLeastOne<{
    firstName?: string
    middleInitial?: string
    lastName?: string
    email?: string
    dateOfBirth?: string
  }>
  homeAddress?: RequireAtLeastOne<{
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
  }>
  inviteEmployeeDefault?: boolean
}>

declare interface ProfileProps extends CommonComponentInterface<'Employee.Profile'> {
  employeeId?: string
  companyId: string
  defaultValues?: ProfileDefaultValues
  isAdmin?: boolean
  isSelfOnboardingEnabled?: boolean
  onEvent: BaseComponentInterface['onEvent']
}

declare interface ProfileProps_2 extends CommonComponentInterface<'Employee.Profile'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

export declare interface ProgressBarProps {
  /**
   * Total number of steps in the progress sequence
   */
  totalSteps: number
  /**
   * Current step in the progress sequence
   */
  currentStep: number
  /**
   * Additional CSS class name for the progress bar container
   */
  className?: string
  /**
   * Accessible label describing the progress bar's purpose
   */
  label: string
  /**
   * Component to render as the progress bar's CTA
   */
  cta?: React.ComponentType | null
}

declare interface QueryWithError {
  error: Error | null
}

declare type QueryWithRefetch = Pick<UseQueryResult, 'error' | 'refetch'>

export declare function RadioGroupHookField<TErrorCode extends string, TEntry = unknown>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  getOptionLabel,
  FieldComponent,
}: RadioGroupHookFieldProps<TErrorCode, TEntry>): ReactElement<
  unknown,
  string | JSXElementConstructor<any>
>

export declare interface RadioGroupHookFieldProps<
  TErrorCode extends string = never,
  TEntry = unknown,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  getOptionLabel?: (entry: TEntry) => string
  FieldComponent?: ComponentType<RadioGroupProps>
}

export declare interface RadioGroupOption {
  /**
   * Label text or content for the radio option
   */
  label: React.ReactNode
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
  /**
   * Disables this specific radio option
   */
  isDisabled?: boolean
  /**
   * Optional description text for the radio option
   */
  description?: React.ReactNode
}

export declare interface RadioGroupProps
  extends SharedFieldLayoutProps, Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables all radio options in the group
   */
  isDisabled?: boolean
  /**
   * Array of radio options to display
   */
  options: Array<RadioGroupOption>
  /**
   * Currently selected value
   */
  value?: string | null
  /**
   * Initially selected value
   */
  defaultValue?: string
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void
  /**
   * React ref for the first radio input element
   */
  inputRef?: Ref<HTMLInputElement>
}

export declare interface RadioProps
  extends
    SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id' | 'className' | 'onBlur'> {
  /**
   * Current checked state of the radio button
   */
  value?: boolean
  /**
   * Callback when radio button state changes
   */
  onChange?: (checked: boolean) => void
  /**
   * React ref for the radio input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the radio button and prevents interaction
   */
  isDisabled?: boolean
}

export declare type RadioStateTaxFieldProps = BaseStateTaxFieldProps & {
  FieldComponent?: ComponentType<RadioGroupProps>
}

declare type RateBasedAccrualMethod =
  | 'perPayPeriod'
  | 'perCalendarYear'
  | 'perAnniversaryYear'
  | 'perHourWorked'
  | 'perHourWorkedNoOvertime'
  | 'perHourPaid'
  | 'perHourPaidNoOvertime'

declare interface RateBasedPolicyDetails {
  policyType: PolicyTypeKey
  accrualMethod: RateBasedAccrualMethod
  accrualRate: number
  accrualRateUnit?: number
  resetDate?: string
}

declare function RateField(props: RateFieldProps): JSX_2.Element

export declare type RateFieldProps = HookFieldProps<NumberInputHookFieldProps<RateValidation>>

export declare type RateValidation = (typeof CompensationErrorCodes)[
  | 'REQUIRED'
  | 'RATE_MINIMUM'
  | 'RATE_EXEMPT_THRESHOLD']

declare function RecoveryCases({ onEvent, ...props }: RecoveryCasesInternalProps): JSX_2.Element

declare interface RecoveryCasesInternalProps
  extends Omit<BaseComponentInterface, 'onEvent'>, RecoveryCasesProps {}

declare interface RecoveryCasesProps {
  companyId: string
  onEvent?: BaseComponentInterface['onEvent']
}

declare function RecurringField(props: RecurringFieldProps): JSX_2.Element

export declare type RecurringFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<DeductionFormRequiredValidation, boolean>
>

declare function RemittanceNumberField(props: RemittanceNumberFieldProps): JSX_2.Element

export declare type RemittanceNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<ChildSupportGarnishmentRequiredValidation>
>

declare interface RemoveDialogState {
  isOpen: boolean
  employeeName: string
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}

declare type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>
}[keyof T]

declare const requiredFieldsConfig: {
  totalAmount: 'never'
  annualMaximum: 'never'
}

declare const requiredFieldsConfig_10: {
  twoJobs: 'never'
  dependentsAmount: 'never'
  otherIncome: 'never'
  deductions: 'never'
  extraWithholding: 'never'
}

declare const requiredFieldsConfig_11: {
  customTwicePerMonth: 'never'
  day1: typeof needsDay1
  day2: typeof needsDay2
}

declare const requiredFieldsConfig_12: {}

declare const requiredFieldsConfig_2: {
  title: 'never'
  flsaStatus: 'create'
  paymentUnit: 'create'
  rate: 'create'
  effectiveDate: 'create'
  minimumWageId: (data: {
    title: string
    flsaStatus:
      | 'Exempt'
      | 'Salaried Nonexempt'
      | 'Nonexempt'
      | 'Owner'
      | 'Commission Only Exempt'
      | 'Commission Only Nonexempt'
      | undefined
    paymentUnit: 'Hour' | 'Week' | 'Month' | 'Year' | 'Paycheck'
    rate: number
    effectiveDate: string | null
    adjustForMinimumWage: boolean
    minimumWageId: string
  }) => boolean
}

declare const requiredFieldsConfig_3: {
  title: 'create'
  hireDate: 'create'
  twoPercentShareholder: 'never'
  stateWcCovered: 'never'
  stateWcClassCode: (data: {
    title: string
    hireDate: string | null
    twoPercentShareholder: boolean
    stateWcCovered: boolean
    stateWcClassCode: string
  }) => boolean
}

declare const requiredFieldsConfig_4: {
  firstName: 'create'
  lastName: 'create'
  middleInitial: 'never'
  email: 'never'
  dateOfBirth: 'never'
  ssn: 'never'
}

declare const requiredFieldsConfig_5: {}

declare const requiredFieldsConfig_6: {
  street2: 'never'
  effectiveDate: 'never'
}

declare const requiredFieldsConfig_7: {}

declare const requiredFieldsConfig_8: {}

declare const requiredFieldsConfig_9: {}

declare type ResetDateType = 'per_anniversary_year' | 'per_calendar_year'

declare type ResourceDictionary<K extends keyof Resources | undefined = undefined> =
  K extends keyof Resources
    ? Record<SupportedLanguages, DeepPartial<Resources[K]>>
    : Record<SupportedLanguages, Partial<{ [Key in keyof Resources]: DeepPartial<Resources[Key]> }>>

/**
 * I18N related types
 */
declare type Resources = CustomTypeOptions['resources']

declare function RoutingNumberField(props: RoutingNumberFieldProps): JSX_2.Element

export declare type RoutingNumberFieldProps = HookFieldProps<
  TextInputHookFieldProps<RoutingNumberValidation>
>

export declare type RoutingNumberValidation = (typeof BankFormErrorCodes)[keyof Pick<
  typeof BankFormErrorCodes,
  'REQUIRED' | 'INVALID_ROUTING_NUMBER'
>]

/**
 * Configuration for data sanitization in observability hooks
 */
export declare interface SanitizationConfig {
  /**
   * Whether to sanitize error data. Default: true
   */
  enabled?: boolean
  /**
   * Whether to include the raw error object on SDKError. Default: false
   * WARNING: Raw errors may contain sensitive data from form inputs or API responses
   */
  includeRawError?: boolean
  /**
   * Custom sanitization function for errors
   */
  customErrorSanitizer?: (error: ObservabilityError) => ObservabilityError
  /**
   * Custom sanitization function for metrics
   */
  customMetricSanitizer?: (metric: ObservabilityMetric) => ObservabilityMetric
  /**
   * Additional field names to treat as sensitive (case-insensitive)
   */
  additionalSensitiveFields?: string[]
}

/**
 * The unified SDK error type for all error scenarios.
 *
 * This is the core error shape exposed through partner-facing hooks. For
 * observability telemetry (which includes component context), see
 * `ObservabilityError` in `@/types/observability`.
 *
 * @example
 * ```tsx
 * const { error } = useEmployeeForm({ employeeId })
 *
 * if (error) {
 *   console.log(error.category)    // 'api_error'
 *   console.log(error.httpStatus)  // 422
 *   console.log(error.fieldErrors) // [{ field: 'firstName', ... }]
 * }
 * ```
 */
export declare interface SDKError {
  /** High-level error classification */
  category: SDKErrorCategory
  /** Human-readable error summary */
  message: string
  /** HTTP status code (undefined for non-HTTP errors like network or validation) */
  httpStatus?: number
  /** Flattened field-level errors from API responses. Empty array for non-field errors. */
  fieldErrors: SDKFieldError[]
  /**
   * The original error object for advanced use cases.
   * May be stripped by sanitization (controlled by `sanitization.includeRawError`).
   */
  raw?: unknown
}

/**
 * High-level classification of where/how the error originated.
 *
 * - `api_error` — HTTP error response from the Gusto API (422, 404, 409, 500, etc.)
 * - `validation_error` — Client-side Zod schema validation before the request was sent
 * - `network_error` — Network connectivity failure (connection refused, timeout, abort)
 * - `internal_error` — Unexpected runtime error (unhandled exception, initialization failure)
 */
declare const SDKErrorCategories: {
  readonly API_ERROR: 'api_error'
  readonly VALIDATION_ERROR: 'validation_error'
  readonly NETWORK_ERROR: 'network_error'
  readonly INTERNAL_ERROR: 'internal_error'
}

export declare type SDKErrorCategory = (typeof SDKErrorCategories)[keyof typeof SDKErrorCategories]

/**
 * A flattened, field-level error extracted from an API response.
 *
 * For API errors with `errors[]`, nested structures are recursively flattened
 * into leaf entries. The `field` property is the dot-separated camelCase path
 * (e.g. `"states.CA.filingStatus.value"`).
 */
export declare interface SDKFieldError {
  /** Dot-separated camelCase field path (e.g. "firstName", "states.CA.filingStatus.value") */
  field: string
  /** API error category (e.g. "invalid_attribute_value", "invalid_operation", "payroll_blocker") */
  category: string
  /** Human-readable error message from the API */
  message: string
  /** Additional metadata from the API (e.g. `{ key: "missing_bank_info" }` for payroll blockers) */
  metadata?: Record<string, unknown>
}

export declare function SDKFormProvider<
  TFormData extends FieldValues = FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = Record<string, FieldMetadata | FieldMetadataWithOptions>,
>({ formHookResult, children }: SDKFormProviderProps<TFormData, TFieldsMetadata>): JSX_2.Element

declare interface SDKFormProviderProps<
  TFormData extends FieldValues = FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = Record<string, FieldMetadata | FieldMetadataWithOptions>,
> {
  formHookResult: {
    errorHandling: {
      errors: SDKError[]
    }
    form: {
      fieldsMetadata: TFieldsMetadata
      hookFormInternals: HookFormInternals<TFormData>
    }
  }
  children: ReactNode
}

/**
 * SDK hooks interface for consumers
 *
 * This interface defines the supported hook types that can be passed to the GustoProvider.
 * Each hook type must implement the corresponding interface from `@gusto/embedded-api/hooks/types`.
 *
 * Only the following hook types are supported:
 * - beforeCreateRequest: Hooks executed before creating a Request object
 * - beforeRequest: Hooks executed after Request creation but before sending
 * - afterSuccess: Hooks executed after successful responses (2xx status codes)
 * - afterError: Hooks executed after error responses (4xx, 5xx) or network failures
 *
 * @example
 * ```typescript
 * const hooks: SDKHooks = {
 *   beforeRequest: [{
 *     beforeRequest: (context, request) => {
 *       request.headers.set('Authorization', 'Bearer token')
 *       return request
 *     }
 *   }]
 * }
 * ```
 */
export declare interface SDKHooks {
  /** Hooks executed before creating a Request object */
  beforeCreateRequest?: BeforeCreateRequestHook[]
  /** Hooks executed after Request creation but before sending */
  beforeRequest?: BeforeRequestHook[]
  /** Hooks executed after successful responses (2xx status codes) */
  afterSuccess?: AfterSuccessHook[]
  /** Hooks executed after error responses (4xx, 5xx) or network failures */
  afterError?: AfterErrorHook[]
}

/**
 * An error thrown by internal SDK logic that should be caught and normalized
 * by `baseSubmitHandler` rather than propagating to the ErrorBoundary.
 *
 * Use this for guard clauses and data integrity checks inside submit handler
 * callbacks where the error should surface as an inline banner, not a crash.
 *
 * @example
 * ```typescript
 * await baseSubmitHandler(data, async () => {
 *   const response = await createPayroll({ ... })
 *   if (!response.payrollId) {
 *     throw new SDKInternalError('Missing payroll ID in response')
 *   }
 * })
 * ```
 */
export declare class SDKInternalError extends Error {
  readonly category: SDKErrorCategory
  constructor(message: string, category?: SDKErrorCategory)
}

export declare function SelectHookField<TErrorCode extends string, TEntry = unknown>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  getOptionLabel,
  placeholder,
  FieldComponent,
  portalContainer,
}: SelectHookFieldProps<TErrorCode, TEntry>): ReactElement<
  unknown,
  string | JSXElementConstructor<any>
>

export declare interface SelectHookFieldProps<TErrorCode extends string = never, TEntry = unknown>
  extends BaseFieldProps, Pick<SelectProps, 'portalContainer'> {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  getOptionLabel?: (entry: TEntry) => string
  placeholder?: string
  FieldComponent?: ComponentType<SelectProps>
  /** When used inside a modal, pass the modal backdrop ref’s element so the listbox stacks correctly. */
  portalContainer?: SelectProps['portalContainer']
}

declare type SelectionMode_2 = 'multiple' | 'single'

export declare interface SelectOption {
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
  /**
   * Display text for the option
   */
  label: string
}

export declare interface SelectProps
  extends
    SharedFieldLayoutProps,
    Pick<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name' | 'className'> {
  /**
   * Disables the select and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Label text for the select field
   */
  label: string
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Array of options to display in the select dropdown
   */
  options: SelectOption[]
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string
  /**
   * Currently selected value
   */
  value?: string | null
  /**
   * React ref for the select button element
   */
  inputRef?: Ref<HTMLButtonElement>
  /**
   * Element to use as the portal container
   */
  portalContainer?: HTMLElement
}

declare interface SelectReasonPayload {
  reason: OffCycleReason
  defaults: OffCycleReasonDefaults
}

export declare type SelectStateTaxFieldProps = BaseStateTaxFieldProps & {
  placeholder?: string
  FieldComponent?: ComponentType<SelectProps>
}

declare function SelfOnboardingField(props: SelfOnboardingFieldProps): JSX_2.Element

export declare type SelfOnboardingFieldProps = HookFieldProps<SwitchHookFieldProps>

declare const SelfOnboardingFlow: ({
  companyId,
  employeeId,
  withEmployeeI9,
  onEvent,
}: SelfOnboardingFlowProps) => JSX_2.Element

declare interface SelfOnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  employeeId: string
  withEmployeeI9?: boolean
}

declare interface SharedFieldLayoutProps extends DataAttributes {
  /**
   * Optional description text for the field
   */
  description?: ReactNode
  /**
   * Error message to display when the field is invalid
   */
  errorMessage?: string
  /**
   * Indicates if the field is required
   */
  isRequired?: boolean
  /**
   * Label text for the field
   */
  label: ReactNode
  /**
   * Hides the label visually while keeping it accessible to screen readers
   */
  shouldVisuallyHideLabel?: boolean
}

declare type SharedHorizontalFieldLayoutProps = SharedFieldLayoutProps

declare interface SharedQuestionMetadata {
  /** Stable identifier for this question (camelCase form of the API key). */
  questionId: string
  /** API-supplied label; default text for the rendered Field. */
  label: string
  /** API-supplied description (raw HTML, sanitized internally before render). */
  description: string | null
}

declare function SignatureField(props: SignEmployeeFormSignatureFieldProps): JSX_2.Element

declare function SignatureField_2(props: SignatureFieldProps): JSX_2.Element

export declare type SignatureFieldProps = HookFieldProps<
  TextInputHookFieldProps<SignCompanyFormRequiredValidation>
>

declare function SignatureForm(props: SignatureFormProps): JSX_2.Element

declare interface SignatureFormProps extends BaseComponentInterface<'Company.SignatureForm'> {
  formId: string
  companyId: string
}

export declare type SignCompanyFormData = {
  [K in keyof typeof fieldValidators_14]: z.infer<(typeof fieldValidators_14)[K]>
}

export declare type SignCompanyFormErrorCode =
  (typeof SignCompanyFormErrorCodes)[keyof typeof SignCompanyFormErrorCodes]

export declare const SignCompanyFormErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
}

export declare type SignCompanyFormField = keyof typeof fieldValidators_14

export declare interface SignCompanyFormFields {
  Signature: typeof SignatureField_2
  ConfirmSignature: typeof ConfirmSignatureField_2
}

export declare type SignCompanyFormFieldsMetadata =
  UseSignCompanyFormReady['form']['fieldsMetadata']

export declare type SignCompanyFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_12
>

export declare type SignCompanyFormOutputs = SignCompanyFormData

export declare type SignCompanyFormRequiredValidation = typeof SignCompanyFormErrorCodes.REQUIRED

declare interface SignCompanyFormSchemaOptions {
  optionalFieldsToRequire?: SignCompanyFormOptionalFieldsToRequire
}

export declare type SignEmployeeFormConfirmSignatureFieldProps = HookFieldProps<
  CheckboxHookFieldProps<SignEmployeeFormRequiredValidation>
>

export declare type SignEmployeeFormData = {
  [K in keyof typeof fieldValidators_12]: z.infer<(typeof fieldValidators_12)[K]>
}

export declare type SignEmployeeFormErrorCode =
  (typeof SignEmployeeFormErrorCodes)[keyof typeof SignEmployeeFormErrorCodes]

export declare const SignEmployeeFormErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
}

export declare type SignEmployeeFormField = keyof typeof fieldValidators_12

export declare interface SignEmployeeFormFieldComponents {
  Signature: typeof SignatureField
  ConfirmSignature: typeof ConfirmSignatureField
  UsedPreparer: typeof UsedPreparerField | undefined
  Preparer1: PreparerFieldGroup | undefined
  Preparer2: PreparerFieldGroup | undefined
  Preparer3: PreparerFieldGroup | undefined
  Preparer4: PreparerFieldGroup | undefined
}

export declare type SignEmployeeFormFields = UseSignEmployeeFormReady['form']['Fields']

export declare type SignEmployeeFormFieldsMetadata =
  UseSignEmployeeFormReady['form']['fieldsMetadata']

export declare type SignEmployeeFormOutputs = SignEmployeeFormData

export declare type SignEmployeeFormRequiredValidation = typeof SignEmployeeFormErrorCodes.REQUIRED

declare interface SignEmployeeFormSchemaOptions {
  isI9?: boolean
  preparerCount?: number
}

export declare type SignEmployeeFormSignatureFieldProps = HookFieldProps<
  TextInputHookFieldProps<SignEmployeeFormRequiredValidation>
>

declare type SingleSelectionProps<T> = {
  selectionMode: 'single'
  onSelect: (item: T, checked: boolean) => void
  onSelectAll?: undefined
  getIsItemSelected?: (item: T) => boolean
}

export declare const SPLIT_BY_VALUES: readonly ['Percentage', 'Amount']

export declare type SplitByFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<SplitPaymentsFormRequiredValidation, SplitByValue>
>

export declare type SplitByValue = (typeof SPLIT_BY_VALUES)[number]

export declare interface SplitFieldEntry {
  uuid: string
  name: string | null
  hiddenAccountNumber: string | null
  Field: ComponentType<SplitFieldProps>
}

/**
 * Props accepted by a bound split-amount Field exposed on
 * `form.Fields.splits[i].Field`. The Field is pre-bound to its split; it
 * formats values as currency in Amount mode and as a percentage in
 * Percentage mode. The remainder split is auto-disabled and treated as not
 * required by the hook; the rest are required.
 */
export declare interface SplitFieldProps {
  label: string
  description?: ReactNode
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<SplitFieldValidation>
  min?: NumberInputProps['min']
  max?: NumberInputProps['max']
  placeholder?: NumberInputProps['placeholder']
  FieldComponent?: ComponentType<NumberInputProps>
}

/**
 * Validation codes a bound split-amount Field can emit at submit time:
 * `REQUIRED` (every non-remainder split must have a value), `INVALID_AMOUNT`
 * (Amount mode, `value < 0`), `INVALID_PERCENTAGE` (Percentage mode, non-integer
 * or out of `0..100`). Supply translations for all three via `validationMessages`.
 * The sum-to-100 invariant is surfaced separately via `status.hasPercentageImbalance`.
 */
export declare type SplitFieldValidation =
  | typeof SplitPaymentsFormErrorCodes.REQUIRED
  | typeof SplitPaymentsFormErrorCodes.INVALID_AMOUNT
  | typeof SplitPaymentsFormErrorCodes.INVALID_PERCENTAGE

export declare type SplitPaymentsFormData = {
  splitBy: SplitByValue
  splitAmount: Record<string, number | null>
  priority: Record<string, number>
}

export declare type SplitPaymentsFormErrorCode =
  (typeof SplitPaymentsFormErrorCodes)[keyof typeof SplitPaymentsFormErrorCodes]

export declare const SplitPaymentsFormErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
  readonly INVALID_PERCENTAGE: 'INVALID_PERCENTAGE'
  readonly INVALID_AMOUNT: 'INVALID_AMOUNT'
  readonly DUPLICATE_PRIORITIES: 'DUPLICATE_PRIORITIES'
  readonly PERCENTAGE_TOTAL_MISMATCH: 'PERCENTAGE_TOTAL_MISMATCH'
}

export declare type SplitPaymentsFormField = keyof typeof fieldValidators_10

export declare interface SplitPaymentsFormFields {
  SplitBy: ComponentType<SplitByFieldProps>
  splits: SplitFieldEntry[]
}

export declare type SplitPaymentsFormFieldsMetadata =
  UseSplitPaymentsFormReady['form']['fieldsMetadata']

export declare type SplitPaymentsFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_9
>

export declare type SplitPaymentsFormOutputs = SplitPaymentsFormData

export declare type SplitPaymentsFormRequiredValidation =
  typeof SplitPaymentsFormErrorCodes.REQUIRED

declare interface SplitPaymentsFormSchemaOptions {
  optionalFieldsToRequire?: SplitPaymentsFormOptionalFieldsToRequire
}

declare function SsnField(props: SsnFieldProps): JSX_2.Element

export declare type SsnFieldProps = HookFieldProps<
  TextInputHookFieldProps<SsnValidation, SsnRequiredValidation>
>

declare type SsnRequiredValidation = typeof EmployeeDetailsErrorCodes.REQUIRED

export declare type SsnValidation = typeof EmployeeDetailsErrorCodes.INVALID_SSN

declare function StateField(props: ChildSupportGarnishmentStateFieldProps): JSX_2.Element

declare function StateField_2(props: StateFieldProps): JSX_2.Element

export declare type StateFieldEntry = {
  state: string
  name: string
  manualPaymentRequired?: boolean
}

export declare type StateFieldProps = HookFieldProps<
  SelectHookFieldProps<HomeAddressRequiredValidation, string>
>

declare function StateTaxes({ companyId, onEvent, dictionary }: StateTaxesProps): JSX_2.Element

declare function StateTaxes_2({
  FallbackComponent,
  ...props
}: StateTaxesProps_2 & Pick<BaseComponentInterface, 'FallbackComponent'>): JSX_2.Element

declare function StateTaxes_3({
  FallbackComponent,
  ...props
}: StateTaxesProps_3 & Pick<BaseComponentInterface, 'FallbackComponent'>): JSX_2.Element

declare function StateTaxesForm(props: StateTaxesFormProps & BaseComponentInterface): JSX_2.Element

declare interface StateTaxesFormProps extends CommonComponentInterface {
  companyId: string
  state: string
}

declare function StateTaxesList(props: StateTaxesListProps): JSX_2.Element

declare interface StateTaxesListProps extends BaseComponentInterface {
  companyId: string
}

declare interface StateTaxesProps extends BaseComponentInterface<'Company.StateTaxes'> {
  companyId: string
}

declare type StateTaxesProps_2 = Omit<
  CommonComponentInterface<'Employee.StateTaxes'>,
  'children'
> & {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

declare type StateTaxesProps_3 = Omit<
  CommonComponentInterface<'Employee.StateTaxes'>,
  'children'
> & {
  employeeId: string
  /** Render admin-only questions and submit them. Defaults to `false`. */
  isAdmin?: boolean
  onEvent: BaseComponentInterface['onEvent']
}

export declare interface StateTaxFieldsGroup {
  state: string
  questions: StateTaxQuestionFieldEntry[]
}

export declare type StateTaxQuestionFieldEntry =
  | ({
      type: 'select'
      Field: ComponentType<SelectStateTaxFieldProps>
    } & SharedQuestionMetadata)
  | ({
      type: 'radio'
      Field: ComponentType<RadioStateTaxFieldProps>
    } & SharedQuestionMetadata)
  | ({
      type: 'text'
      Field: ComponentType<TextStateTaxFieldProps>
    } & SharedQuestionMetadata)
  | ({
      type: 'number'
      Field: ComponentType<NumberStateTaxFieldProps>
    } & SharedQuestionMetadata)
  | ({
      type: 'currency'
      Field: ComponentType<CurrencyStateTaxFieldProps>
    } & SharedQuestionMetadata)
  | ({
      type: 'date'
      Field: ComponentType<DateStateTaxFieldProps>
    } & SharedQuestionMetadata)

/**
 * Lowercase post-mapping variant that decides which UI primitive renders
 * a given state-tax question. Mirrors the existing `QuestionInput` switch
 * in `src/components/Common/TaxInputs/TaxInputs.tsx`, narrowed to the
 * cases that apply to the employee state-tax endpoint.
 */
export declare type StateTaxQuestionVariant =
  | 'select'
  | 'radio'
  | 'text'
  | 'number'
  | 'currency'
  | 'date'

declare type StateTaxValidationMessages = ValidationMessages<
  typeof EmployeeStateTaxesErrorCodes.REQUIRED
>

export declare type StateTaxValue = string | number | boolean | Date | null | undefined

declare function StateWcClassCodeField(props: StateWcClassCodeFieldProps): JSX_2.Element

export declare type StateWcClassCodeFieldProps = HookFieldProps<
  SelectHookFieldProps<JobRequiredValidation, WARiskClassCode>
>

declare function StateWcCoveredField(props: StateWcCoveredFieldProps): JSX_2.Element

export declare type StateWcCoveredFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, boolean>
>

declare function Street1Field(props: Street1FieldProps): JSX_2.Element

export declare type Street1FieldProps = HookFieldProps<
  TextInputHookFieldProps<HomeAddressRequiredValidation>
>

declare function Street2Field(props: Street2FieldProps): JSX_2.Element

export declare type Street2FieldProps = HookFieldProps<
  TextInputHookFieldProps<HomeAddressRequiredValidation>
>

/**
 * Submit-side error state to merge with query errors. From `useBaseSubmit`, destructure
 * `{ error: submitError, setError: setSubmitError }` and pass `{ submitError, setSubmitError }`.
 */
export declare type SubmitStateForErrorHandling = {
  submitError: SDKError | null
  setSubmitError: (error: SDKError | null) => void
}

declare interface SummaryProps extends CommonComponentInterface<'Employee.OnboardingSummary'> {
  employeeId: string
  isAdmin?: boolean
}

declare interface SummaryProps_2 extends CommonComponentInterface<'Employee.Landing'> {
  employeeId: string
  companyId: string
}

/**
 * Agencies declare which child-support attributes they need via
 * `required_attributes[].key`. The legacy form only mapped three keys;
 * unknown keys are ignored both there and here.
 */
export declare const SUPPORTED_REQUIRED_ATTR_KEYS: readonly [
  'case_number',
  'order_number',
  'remittance_number',
]

declare type SupportedLanguages = 'en'

export declare type SupportedRequiredAttrKey = (typeof SUPPORTED_REQUIRED_ATTR_KEYS)[number]

export declare function SwitchHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  FieldComponent,
}: SwitchHookFieldProps<TErrorCode>): ReactElement<unknown, string | JSXElementConstructor<any>>

export declare interface SwitchHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<SwitchProps>
}

export declare interface SwitchProps
  extends
    SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id'>,
    Pick<AriaAttributes, 'aria-controls'> {
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Callback when switch state changes
   */
  onChange?: (checked: boolean) => void
  /**
   * Current checked state of the switch
   */
  value?: boolean
  /**
   * React ref for the switch input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the switch and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Additional CSS class name for the switch container
   */
  className?: string
  /**
   * Label text for the switch
   */
  label: string
}

export declare interface TableData {
  /**
   * Unique identifier for the table cell
   */
  key: string
  /**
   * Content to be displayed in the table cell
   */
  content: ReactNode
}

export declare interface TableProps extends Pick<
  TableHTMLAttributes<HTMLTableElement>,
  'className' | 'aria-label' | 'id' | 'role' | 'aria-labelledby' | 'aria-describedby'
> {
  /**
   * Array of header cells for the table
   */
  headers: TableData[]
  /**
   * Array of rows to be displayed in the table
   */
  rows: TableRow[]
  /**
   * Array of footer cells for the table
   */
  footer?: TableData[]
  /**
   * Content to display when the table has no rows
   */
  emptyState?: ReactNode
  /**
   * Removes borders and background for use inside a Box component
   */
  isWithinBox?: boolean
  /**
   * Whether the first column contains checkboxes (affects which column gets leading variant)
   */
  hasCheckboxColumn?: boolean
}

export declare interface TableRow {
  /**
   * Unique identifier for the table row
   */
  key: string
  /**
   * Array of cells to be displayed in the row
   */
  data: TableData[]
}

/**
 * Individual tab configuration
 */
declare interface TabProps {
  /**
   * Unique identifier for the tab
   */
  id: string
  /**
   * Label to display in the tab button
   */
  label: ReactNode
  /**
   * Content to display in the tab panel
   */
  content: ReactNode
  /**
   * Whether the tab is disabled
   */
  isDisabled?: boolean
}

/**
 * Props for the Tabs component - provides accessible tab navigation (controlled only)
 *
 * Responsively adapts to container size:
 * - Below 640px (small breakpoint): renders as a dropdown select for mobile devices
 * - At or above 640px: renders as horizontal tabs for desktop views
 *
 * This adaptive behavior ensures WCAG 2.2 compliance by avoiding horizontal scrolling
 * without positional meaning, while maintaining a familiar tab interface on larger screens.
 */
export declare interface TabsProps {
  /**
   * Array of tab configuration objects
   */
  tabs: TabProps[]
  /**
   * Currently selected tab id
   */
  selectedId?: string
  /**
   * Callback when tab selection changes
   */
  onSelectionChange: (id: string) => void
  /**
   * Accessible label for the tabs
   */
  'aria-label'?: string
  /**
   * ID of element that labels the tabs
   */
  'aria-labelledby'?: string
  /**
   * Additional CSS class name
   */
  className?: string
}

/**
 * @deprecated The Taxes component has been deprecated and will be removed in a future release.
 * The component has been split into separate components for state and federal. Use Employee.FederalTaxes
 * and Employee.StateTaxes components instead.
 */
declare function Taxes(props: TaxesProps & BaseComponentInterface): JSX_2.Element

declare interface TaxesProps extends CommonComponentInterface<'Employee.Taxes'> {
  employeeId: string
  isAdmin?: boolean
}

declare function TerminateEmployee(props: TerminateEmployeeProps): JSX_2.Element

declare interface TerminateEmployeeProps extends BaseComponentInterface<'Employee.Terminations.TerminateEmployee'> {
  employeeId: string
  companyId: string
}

declare const TerminationFlow: ({
  companyId,
  employeeId,
  onEvent,
}: TerminationFlowProps) => JSX_2.Element

declare interface TerminationFlowProps extends BaseComponentInterface {
  companyId: string
  employeeId: string
}

declare function TerminationSummary(props: TerminationSummaryProps): JSX_2.Element

declare interface TerminationSummaryProps extends BaseComponentInterface<'Employee.Terminations.TerminationSummary'> {
  employeeId: string
  companyId: string
  payrollOption?: PayrollOption
  payrollUuid?: string
}

export declare interface TextAreaProps
  extends
    SharedFieldLayoutProps,
    Pick<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      'name' | 'id' | 'placeholder' | 'className' | 'rows' | 'cols'
    >,
    Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, 'aria-describedby'> {
  /**
   * React ref for the textarea element
   */
  inputRef?: Ref<HTMLTextAreaElement>
  /**
   * Current value of the textarea
   */
  value?: string
  /**
   * Callback when textarea value changes
   */
  onChange?: (value: string) => void
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the textarea and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Handler for blur events
   */
  onBlur?: () => void
}

export declare function TextInputHookField<
  TErrorCode extends string,
  TOptionalErrorCode extends string = never,
>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  transform,
  placeholder,
  FieldComponent,
}: TextInputHookFieldProps<TErrorCode, TOptionalErrorCode>): ReactElement<
  unknown,
  string | JSXElementConstructor<any>
>

export declare interface TextInputHookFieldProps<
  TErrorCode extends string = never,
  TOptionalErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode, TOptionalErrorCode>
  transform?: (value: string) => string
  placeholder?: string
  FieldComponent?: ComponentType<TextInputProps>
}

export declare interface TextInputProps
  extends
    SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'id' | 'placeholder' | 'className' | 'type' | 'min' | 'max' | 'maxLength'
    >,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'aria-describedby' | 'aria-labelledby'> {
  /**
   * React ref for the input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Current value of the input
   */
  value?: string
  /**
   * Callback when input value changes
   */
  onChange?: (value: string) => void
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the input and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Element to display at the start of the input
   */
  adornmentStart?: InputProps['adornmentStart']
  /**
   * Element to display at the end of the input
   */
  adornmentEnd?: InputProps['adornmentEnd']
}

export declare interface TextProps extends Pick<
  HTMLAttributes<HTMLParagraphElement>,
  'className' | 'id'
> {
  /**
   * HTML element to render the text as
   */
  as?: 'p' | 'span' | 'div' | 'pre'
  /**
   * Size variant of the text
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /**
   * Text alignment within the container
   */
  textAlign?: 'start' | 'center' | 'end'
  /**
   * Font weight of the text
   */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  /**
   * Content to be displayed
   */
  children?: ReactNode
  /**
   * Visual style variant of the text
   */
  variant?: 'supporting' | 'leading'
}

export declare type TextStateTaxFieldProps = BaseStateTaxFieldProps & {
  placeholder?: string
  FieldComponent?: ComponentType<TextInputProps>
}

export declare namespace TimeOff {
  export {
    PolicyList,
    PolicyListProps,
    PolicyTypeSelector,
    PolicyTypeSelectorProps,
    PolicyConfigurationForm,
    PolicyConfigurationFormProps,
    PolicySettingsPresentation as PolicySettings,
    PolicySettingsPresentationProps as PolicySettingsProps,
    AddEmployeesToPolicy,
    AddEmployeesToPolicyProps,
    HolidaySelectionForm,
    HolidaySelectionFormProps,
    AddEmployeesHoliday,
    AddEmployeesHolidayProps,
    ViewHolidayEmployees,
    ViewHolidayEmployeesProps,
    ViewHolidayPolicyDetails,
    ViewHolidayPolicyDetailsProps,
    ViewHolidaySchedule,
    ViewHolidayScheduleProps,
    HolidayPolicyDetailPresentationProps,
    HolidayPolicyDetailEmployee,
    TimeOffPolicyDetailPresentation,
    TimeOffPolicyDetailPresentationProps,
    TimeOffPolicyDetailEmployee,
    PolicyDetails,
    PolicySettingsDisplay,
    TimeOffFlow,
    TimeOffFlowProps,
  }
}

declare const TimeOffFlow: ({ companyId, onEvent }: TimeOffFlowProps) => JSX_2.Element

declare interface TimeOffFlowProps extends BaseComponentInterface {
  companyId: string
}

declare interface TimeOffPolicyDetailEmployee extends EmployeeTableItem {
  uuid: string
  balance: number | null
}

declare function TimeOffPolicyDetailPresentation({
  title,
  subtitle,
  onBack,
  backLabel,
  actions,
  policyDetails,
  policySettings,
  onChangeSettings,
  selectedTabId,
  onTabChange,
  employees,
  onAddEmployee,
  removeDialog,
  successAlert,
  onDismissAlert,
}: TimeOffPolicyDetailPresentationProps): JSX_2.Element

declare interface TimeOffPolicyDetailPresentationBaseProps {
  title: string
  subtitle?: string
  onBack: () => void
  backLabel: string
  actions?: ReactNode[]
  selectedTabId: string
  onTabChange: (id: string) => void
  employees: Pick<
    EmployeeTableProps<TimeOffPolicyDetailEmployee>,
    | 'data'
    | 'searchValue'
    | 'onSearchChange'
    | 'onSearchClear'
    | 'searchPlaceholder'
    | 'itemMenu'
    | 'pagination'
    | 'isFetching'
    | 'emptyState'
  >
  onAddEmployee?: () => void
  removeDialog: RemoveDialogState
  successAlert?: string
  onDismissAlert?: () => void
}

declare type TimeOffPolicyDetailPresentationProps = TimeOffPolicyDetailPresentationBaseProps &
  (
    | {
        policyDetails: UnlimitedPolicyDetails
        policySettings?: never
        onChangeSettings?: never
      }
    | {
        policyDetails: RateBasedPolicyDetails
        policySettings: PolicySettingsDisplay
        onChangeSettings?: () => void
      }
  )

declare function TitleField(props: CompensationTitleFieldProps): JSX_2.Element

declare function TotalAmountField(props: TotalAmountFieldProps): JSX_2.Element

export declare type TotalAmountFieldProps = HookFieldProps<
  NumberInputHookFieldProps<DeductionFormCapValidation>
>

declare function TransitionCreation(props: TransitionCreationProps): JSX_2.Element

declare interface TransitionCreationFormData {
  checkDate: Date | null
  skipRegularDeductions: boolean
}

declare interface TransitionCreationProps extends BaseComponentInterface<'Payroll.TransitionCreation'> {
  companyId: string
  startDate: string
  endDate: string
  payScheduleUuid: string
}

declare function TransitionFlow({
  companyId,
  startDate,
  endDate,
  payScheduleUuid,
  payrollUuid,
  onEvent,
}: TransitionFlowProps): JSX_2.Element

declare interface TransitionFlowContextInterface extends FlowContextInterface {
  companyId: string
  startDate: string
  endDate: string
  payScheduleUuid: string
  payrollUuid?: string
}

declare interface TransitionFlowProps {
  companyId: string
  startDate: string
  endDate: string
  payScheduleUuid: string
  payrollUuid?: string
  onEvent: OnEventType<EventType, unknown>
}

declare function TwoJobsField(props: TwoJobsFieldProps): JSX_2.Element

export declare type TwoJobsFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<FederalTaxesRequiredValidation, boolean>
>

declare function TwoPercentShareholderField(props: TwoPercentShareholderFieldProps): JSX_2.Element

export declare type TwoPercentShareholderFieldProps = HookFieldProps<CheckboxHookFieldProps>

declare function TypeField(props: TypeFieldProps): JSX_2.Element

export declare type TypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<PaymentMethodFormRequiredValidation, PaymentMethodType>
>

declare interface UnlimitedPolicyDetails {
  policyType: PolicyTypeKey
  accrualMethod: 'unlimited'
}

export declare type UnorderedListProps = BaseListProps

export declare function useBankForm({
  employeeId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UseBankFormProps): HookLoadingResult | UseBankFormReady

export declare interface UseBankFormProps {
  /** Employee for whom to create the bank account. May be supplied later via `BankFormSubmitOptions.employeeId`. */
  employeeId?: string
  optionalFieldsToRequire?: BankFormOptionalFieldsToRequire
  defaultValues?: Partial<BankFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UseBankFormReady extends BaseFormHookReady<
  FieldsMetadata,
  BankFormData,
  BankFormFields
> {
  data: Record<string, never>
  status: {
    isPending: boolean
    mode: 'create'
  }
  actions: {
    onSubmit: (
      options?: BankFormSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeBankAccount> | undefined>
  }
}

export declare type UseBankFormResult = HookLoadingResult | UseBankFormReady

export declare function useChildSupportGarnishmentForm({
  employeeId,
  garnishmentId,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UseChildSupportGarnishmentFormProps): UseChildSupportGarnishmentFormResult

export declare interface UseChildSupportGarnishmentFormProps {
  employeeId: string
  /**
   * When set, loads that garnishment via the list query and updates it (PUT).
   * When omitted, the form is in create mode (POST).
   */
  garnishmentId?: string
  defaultValues?: Partial<ChildSupportGarnishmentFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UseChildSupportGarnishmentFormReady extends BaseFormHookReady<
  FieldsMetadata,
  ChildSupportGarnishmentFormData,
  ChildSupportGarnishmentFormFields
> {
  data: {
    /** Agencies offered as `State` options; raw entries the consumer can use
     *  with `getOptionLabel` for translated names. */
    agencies: StateFieldEntry[]
    /** Counties for the currently selected state. Empty array when no state
     *  is selected. */
    counties: CountyEntry[]
    /** The garnishment loaded for update; `null` in create mode. */
    deduction: Garnishment | null
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
    /** The agency record matching the currently selected `state`. */
    selectedAgency: Agencies | null
    /** Mirrors `selectedAgency.manualPaymentRequired`; convenient for showing
     *  a warning alert. */
    isManualPaymentRequired: boolean
    /** Which `required_attributes` keys the selected agency declares. */
    requiredAttrKeys: ReadonlySet<SupportedRequiredAttrKey>
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Garnishment> | undefined>
  }
}

export declare type UseChildSupportGarnishmentFormResult =
  | HookLoadingResult
  | UseChildSupportGarnishmentFormReady

export declare function useCompensationForm({
  employeeId,
  jobId,
  compensationId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
  withEffectiveDateField,
}: UseCompensationFormProps): HookLoadingResult | UseCompensationFormReady

export declare interface UseCompensationFormProps {
  employeeId?: string
  /** The parent job's UUID. Required in create mode (scopes `POST /v1/jobs/:jobId/compensations`). Optional in update mode — the parent job is derived from the loaded compensation. */
  jobId?: string
  /** Present → update mode (PUT /v1/compensations/:id). Omitted → create mode (POST /v1/jobs/:jobId/compensations). */
  compensationId?: string
  optionalFieldsToRequire?: CompensationOptionalFieldsToRequire
  defaultValues?: Partial<CompensationFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
  /**
   * When `false`, hides `Fields.EffectiveDate` (becomes `undefined`) and
   * removes `effectiveDate` from schema validation. In this mode the hook
   * does not read any form value at submit time — `effective_date` is
   * omitted from the request body unless explicitly supplied via
   * `CompensationSubmitOptions.effectiveDate`. This matches the
   * options-only convention of `useWorkAddressForm` /
   * `useHomeAddressForm` / `useJobForm`, and means the
   * `willDeleteSecondaryJobs` carve-out's form-state side effects do not
   * leak onto the wire (there is no field to render them in anyway).
   * Defaults to `true`.
   */
  withEffectiveDateField?: boolean
}

export declare interface UseCompensationFormReady extends BaseFormHookReady<
  FieldsMetadata,
  CompensationFormData,
  CompensationFormFields
> {
  data: {
    /** The compensation row loaded for update; `null` in create mode. */
    compensation: Compensation | null
    /** The parent job. In update mode it's derived from the loaded compensation; in create mode it's looked up by `jobId`. `null` if neither resolves. */
    currentJob: Job | null
    minimumWages: MinimumWage[]
    /** Lower bound for `effectiveDate` (typically the parent job's hire date). */
    minimumEffectiveDate: string | null
    /** Upper bound for `effectiveDate` — the next scheduled future compensation's effective date, when one exists. */
    maximumEffectiveDate: string | null
    /** True when at least one future-dated compensation already exists for this job. */
    hasPendingFutureCompensation: boolean
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
    /**
     * True when submitting the form right now would delete the employee's
     * secondary jobs server-side (the "carve-out" branch). Reactive:
     * derived from the current `flsaStatus` form value, the loaded
     * compensation, and the other-jobs count, so this flips as you change
     * inputs.
     *
     * Conditions: update mode, the loaded compensation is Nonexempt, the
     * form's `flsaStatus` has been changed to a non-Nonexempt value, and
     * the employee has at least one secondary job.
     *
     * While this flag is true the hook also takes the `effectiveDate`
     * field over: it forces the form value to today (so submits route
     * through a PUT that immediately deletes secondaries) and exposes
     * `fieldsMetadata.effectiveDate.isDisabled = true` so `Fields.EffectiveDate`
     * renders as disabled. On revert (FLSA back to Nonexempt) the prior
     * `effectiveDate` is restored. Render an inline warning keyed off
     * this flag — no separate confirmation step is needed.
     */
    willDeleteSecondaryJobs: boolean
  }
  actions: {
    onSubmit: (
      options?: CompensationSubmitOptions,
    ) => Promise<HookSubmitResult<Compensation> | undefined>
  }
}

export declare type UseCompensationFormResult = HookLoadingResult | UseCompensationFormReady

declare interface UseContractorProfileProps {
  companyId: string
  contractorId?: string
  defaultValues?: Partial<ContractorProfileFormData>
  existingContractor?: Contractor_2
}

export declare function useCurrentHomeAddressForm(
  props: UseCurrentHomeAddressFormProps,
): UseHomeAddressFormResult

export declare type UseCurrentHomeAddressFormProps = Omit<
  UseHomeAddressFormProps,
  'homeAddressUuid'
>

export declare function useCurrentWorkAddressForm(
  props: UseCurrentWorkAddressFormProps,
): UseWorkAddressFormResult

export declare type UseCurrentWorkAddressFormProps = Omit<
  UseWorkAddressFormProps,
  'workAddressUuid'
>

declare type useDataViewProp<T> = BaseDataViewProps<T> &
  (NoSelectionProps | SingleSelectionProps<T> | MultipleSelectionProps<T>)

export declare function useDeductionForm({
  employeeId,
  garnishmentId,
  courtOrdered,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UseDeductionFormProps): UseDeductionFormResult

export declare interface UseDeductionFormProps {
  employeeId: string
  /**
   * When set, loads that garnishment via the list query and updates it (PUT).
   * When omitted, the form is in create mode (POST).
   */
  garnishmentId?: string
  /**
   * Court-ordered deductions are stored as garnishments with `courtOrdered: true` and require a `garnishmentType` (Federal Tax Lien, Student Loan,
   * etc.). When `false`, the form is for a "custom" post-tax deduction —
   * `garnishmentType` is excluded from the schema and submit payload.
   *
   * Note: this hook does NOT handle `garnishmentType: 'child_support'`. Use
   * `useChildSupportGarnishmentForm` for child-support agency-keyed payloads.
   */
  courtOrdered: boolean
  optionalFieldsToRequire?: DeductionFormOptionalFieldsToRequire
  defaultValues?: Partial<DeductionFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UseDeductionFormReady extends BaseFormHookReady<
  FieldsMetadata,
  DeductionFormData,
  DeductionFormFields
> {
  data: {
    /** The garnishment loaded for update; `null` in create mode. */
    deduction: Garnishment | null
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
    /**
     * Mirrors the watched `recurring` value. Cap fields (`TotalAmount`,
     * `AnnualMaximum`) are only included on `Fields` when this is true — the
     * consumer can render them unconditionally and the gating happens in the
     * hook.
     */
    isRecurring: boolean
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Garnishment> | undefined>
  }
}

export declare type UseDeductionFormResult = HookLoadingResult | UseDeductionFormReady

/**
 * Resolves dynamic field metadata (e.g. `isRequired` driven by predicate
 * rules) by watching only the form fields that predicates actually read.
 *
 * `buildFormSchema` auto-detects predicate dependencies via a recording
 * Proxy and exposes them as `predicateDeps`. This hook subscribes to only
 * those fields, so typing into unrelated inputs does not trigger re-renders
 * — preserving react-hook-form's per-field optimization.
 *
 * When no predicates exist (`predicateDeps` is empty), the hook skips
 * `useWatch` entirely and returns static metadata.
 */
export declare function useDeriveFieldsMetadata<
  T extends Record<string, z.ZodType>,
  TFormData extends FieldValues = FieldValues,
>(
  metadataConfig: FieldsMetadataConfig<T>,
  control: Control<TFormData>,
): Record<keyof T, FieldMetadata>

declare function UsedPreparerField(props: UsedPreparerFieldProps): JSX_2.Element

export declare type UsedPreparerFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<SignEmployeeFormRequiredValidation>
>

export declare function useEmployeeDetailsForm({
  companyId,
  employeeId,
  withSelfOnboardingField,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UseEmployeeDetailsFormProps): HookLoadingResult | UseEmployeeDetailsFormReady

export declare type UseEmployeeDetailsFormProps =
  | (UseEmployeeDetailsFormSharedProps & {
      companyId: string
      employeeId?: never
    })
  | (UseEmployeeDetailsFormSharedProps & {
      employeeId: string
      companyId?: string
    })

export declare interface UseEmployeeDetailsFormReady extends BaseFormHookReady<
  FieldsMetadata,
  EmployeeDetailsFormData,
  EmployeeDetailsFields
> {
  data: {
    employee: Employee_2 | null
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (
      callbacks?: EmployeeDetailsSubmitCallbacks,
    ) => Promise<HookSubmitResult<Employee_2> | undefined>
  }
}

export declare type UseEmployeeDetailsFormResult = HookLoadingResult | UseEmployeeDetailsFormReady

declare type UseEmployeeDetailsFormSharedProps = {
  withSelfOnboardingField?: boolean
  optionalFieldsToRequire?: EmployeeDetailsOptionalFieldsToRequire
  defaultValues?: Partial<EmployeeDetailsFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare function useEmployeeStateTaxesForm({
  employeeId,
  isAdmin,
  validationMode,
  shouldFocusError,
}: UseEmployeeStateTaxesFormProps): UseEmployeeStateTaxesFormResult

export declare interface UseEmployeeStateTaxesFormProps {
  employeeId: string
  /**
   * When `true`, admin-only questions are visible and submitted. When
   * `false`, they are filtered out and the surfaced answer for those
   * questions is preserved unchanged on submit.
   */
  isAdmin?: boolean
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UseEmployeeStateTaxesFormReady extends BaseFormHookReady<
  FieldsMetadata,
  EmployeeStateTaxesFormData,
  StateTaxFieldsGroup[]
> {
  data: {
    employeeStateTaxes: EmployeeStateTaxesList[]
  }
  status: {
    isPending: boolean
    mode: 'update'
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeeStateTaxesList[]> | undefined>
  }
  form: BaseFormHookReady<
    FieldsMetadata,
    EmployeeStateTaxesFormData,
    StateTaxFieldsGroup[]
  >['form'] & {
    /** Iterable, render-ready group + question entries with bound Field components. */
    Fields: StateTaxFieldsGroup[]
  }
}

export declare type UseEmployeeStateTaxesFormResult =
  | HookLoadingResult
  | UseEmployeeStateTaxesFormReady

export declare function useFederalTaxesForm({
  employeeId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UseFederalTaxesFormProps): HookLoadingResult | UseFederalTaxesFormReady

export declare interface UseFederalTaxesFormProps {
  employeeId: string
  optionalFieldsToRequire?: FederalTaxesOptionalFieldsToRequire
  defaultValues?: Partial<FederalTaxesFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UseFederalTaxesFormReady extends BaseFormHookReady<
  FieldsMetadata,
  FederalTaxesFormData,
  FederalTaxesFields
> {
  data: {
    employeeFederalTax: EmployeeFederalTax
  }
  status: {
    isPending: boolean
    mode: 'update'
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeeFederalTax> | undefined>
  }
}

export declare type UseFederalTaxesFormResult = HookLoadingResult | UseFederalTaxesFormReady

export declare function useFieldErrorMessage<TErrorCode extends string>(
  fieldName: string,
  validationMessages?: ValidationMessages<TErrorCode>,
): string | undefined

export declare function useHomeAddressForm({
  employeeId,
  homeAddressUuid,
  withEffectiveDateField,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UseHomeAddressFormProps): HookLoadingResult | UseHomeAddressFormReady

export declare interface UseHomeAddressFormProps {
  employeeId: string
  /**
   * When set, loads that home address via GET `/v1/home_addresses/{uuid}` and updates it (PUT).
   * When omitted, the form is in create mode (POST).
   */
  homeAddressUuid?: string
  withEffectiveDateField?: boolean
  optionalFieldsToRequire?: HomeAddressOptionalFieldsToRequire
  defaultValues?: Partial<HomeAddressFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UseHomeAddressFormReady extends BaseFormHookReady<
  FieldsMetadata,
  HomeAddressFormData,
  HomeAddressFields
> {
  data: {
    /** The address row loaded for update; `null` in create mode. */
    homeAddress: EmployeeAddress | null
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (
      options?: HomeAddressSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeAddress> | undefined>
  }
}

export declare type UseHomeAddressFormResult = HookLoadingResult | UseHomeAddressFormReady

export declare function useJobForm({
  employeeId,
  jobId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
  withHireDateField,
}: UseJobFormProps): HookLoadingResult | UseJobFormReady

export declare interface UseJobFormProps {
  employeeId?: string
  /** Present → update mode (PUT /v1/jobs/:id with `version`). Omitted → create mode (POST /v1/employees/:id/jobs). */
  jobId?: string
  optionalFieldsToRequire?: JobOptionalFieldsToRequire
  defaultValues?: Partial<JobFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
  /**
   * When `false`, hides `Fields.HireDate` (becomes `undefined`) and removes
   * `hireDate` from schema validation. Partners supply the value via
   * `JobSubmitOptions.hireDate` at submit time, or rely on the loaded job's
   * existing value on update. Use this when the date is driven by external
   * context rather than user input (e.g. the employee's `startDate`).
   * Defaults to `true`.
   */
  withHireDateField?: boolean
}

export declare interface UseJobFormReady extends BaseFormHookReady<
  FieldsMetadata,
  JobFormData,
  JobFormFields
> {
  data: {
    /** The job row loaded for update; `null` in create mode. */
    currentJob: Job | null
    /** All jobs for the employee, when employeeId is set. Useful for screen-level cross-checks across jobs. */
    jobs: Job[] | undefined
    employee: Employee_2 | null
    currentWorkAddress: EmployeeWorkAddress | null
    /** True when the company is taxable as an S-Corp; partners use this to decide whether to render `TwoPercentShareholder`. */
    showTwoPercentShareholder: boolean
    /**
     * True when the active work-address state is WA; partners use this to decide whether to render
     * `StateWcCovered`. `Fields.StateWcClassCode` is additionally gated on `stateWcCovered === true`,
     * so partners typically only need to check `Fields.StateWcCovered` / `Fields.StateWcClassCode`
     * truthiness rather than this flag directly.
     */
    showStateWc: boolean
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (options?: JobSubmitOptions) => Promise<HookSubmitResult<Job> | undefined>
  }
}

export declare type UseJobFormResult = HookLoadingResult | UseJobFormReady

export declare const useObservability: () => ObservabilityContextValue

export declare function usePaymentMethodForm({
  employeeId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UsePaymentMethodFormProps): HookLoadingResult | UsePaymentMethodFormReady

export declare interface UsePaymentMethodFormProps {
  employeeId: string
  optionalFieldsToRequire?: PaymentMethodFormOptionalFieldsToRequire
  defaultValues?: Partial<PaymentMethodFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UsePaymentMethodFormReady extends BaseFormHookReady<
  FieldsMetadata,
  PaymentMethodFormData,
  PaymentMethodFormFields
> {
  data: {
    paymentMethod: EmployeePaymentMethod
  }
  status: {
    isPending: boolean
    mode: 'update'
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeePaymentMethod> | undefined>
  }
}

export declare type UsePaymentMethodFormResult = HookLoadingResult | UsePaymentMethodFormReady

export declare function usePayScheduleForm({
  companyId,
  payScheduleId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UsePayScheduleFormProps): HookLoadingResult | UsePayScheduleFormReady

export declare interface UsePayScheduleFormProps {
  companyId: string
  payScheduleId?: string
  optionalFieldsToRequire?: PayScheduleOptionalFieldsToRequire
  defaultValues?: Partial<PayScheduleFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UsePayScheduleFormReady extends BaseFormHookReady<
  FieldsMetadata,
  PayScheduleFormData,
  PayScheduleFields
> {
  data: {
    paySchedule: PayScheduleShow | null
    payPeriodPreview: PaySchedulePreviewPayPeriod[] | null
    payPreviewLoading: boolean
    paymentSpeedDays: number | null
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<PayScheduleShow> | undefined>
  }
}

export declare type UsePayScheduleFormResult = HookLoadingResult | UsePayScheduleFormReady

export declare function useSignCompanyForm({
  formId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UseSignCompanyFormProps): HookLoadingResult | UseSignCompanyFormReady

export declare interface UseSignCompanyFormProps {
  formId: string
  optionalFieldsToRequire?: SignCompanyFormOptionalFieldsToRequire
  defaultValues?: Partial<SignCompanyFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UseSignCompanyFormReady extends BaseFormHookReady<
  FieldsMetadata,
  SignCompanyFormData,
  SignCompanyFormFields
> {
  data: {
    companyForm: Form
    pdfUrl: string | null
  }
  status: {
    isPending: boolean
    mode: 'create'
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Form> | undefined>
  }
}

export declare type UseSignCompanyFormResult = HookLoadingResult | UseSignCompanyFormReady

export declare function useSignEmployeeForm({
  employeeId,
  formId,
}: UseSignEmployeeFormProps): HookLoadingResult | UseSignEmployeeFormReady

export declare interface UseSignEmployeeFormProps {
  employeeId: string
  formId: string
}

export declare interface UseSignEmployeeFormReady extends BaseFormHookReady<
  FieldsMetadata,
  SignEmployeeFormData,
  SignEmployeeFormFieldComponents
> {
  data: {
    form: Form
    pdfUrl: string | null | undefined
  }
  status: {
    isPending: boolean
    mode: 'create'
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Form> | undefined>
    addPreparer?: () => void
    removePreparer?: () => void
  }
  form: BaseFormHookReady<
    FieldsMetadata,
    SignEmployeeFormData,
    SignEmployeeFormFieldComponents
  >['form'] & {
    preparers?: {
      count: number
      canAdd: boolean
      canRemove: boolean
    }
  }
}

export declare type UseSignEmployeeFormResult = HookLoadingResult | UseSignEmployeeFormReady

export declare function useSplitPaymentsForm({
  employeeId,
  optionalFieldsToRequire,
  validationMode,
  shouldFocusError,
}: UseSplitPaymentsFormProps): HookLoadingResult | UseSplitPaymentsFormReady

export declare interface UseSplitPaymentsFormProps {
  employeeId: string
  optionalFieldsToRequire?: SplitPaymentsFormOptionalFieldsToRequire
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UseSplitPaymentsFormReady extends BaseFormHookReady<
  FieldsMetadata,
  SplitPaymentsFormData,
  SplitPaymentsFormFields
> {
  data: {
    paymentMethod: EmployeePaymentMethod
    bankAccounts: EmployeeBankAccount[]
    splits: WorkingSplit[]
    /** UUID of the split that absorbs the remainder in Amount mode (always the last by priority). */
    remainderId: string
  }
  status: {
    isPending: boolean
    mode: 'update'
    /** Current `splitBy` value, reactively tracked. */
    splitBy: SplitByValue
    /** Live sum of `splitAmount` values; useful for displaying the current total in Percentage mode. */
    percentageTotal: number
    /**
     * Mirrors the schema-emitted `PERCENTAGE_TOTAL_MISMATCH` error at the
     * synthetic form path. Tracks `formState.errors` directly and follows
     * the standard react-hook-form validation lifecycle: with the default
     * `validationMode: 'onSubmit'`, becomes `true` after the first failed
     * Save attempt and clears live as the user corrects the total. Only
     * surfaces in Percentage mode.
     */
    hasPercentageImbalance: boolean
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeePaymentMethod> | undefined>
    /**
     * Reorder splits by uuid (Amount mode). Pass the ordered list of split
     * uuids; the last uuid becomes the remainder. The hook writes the new
     * priority map and re-anchors the remainder's `splitAmount` to `null`
     * (clearing the previous remainder to `0`).
     */
    reorderSplits: (orderedUuids: string[]) => void
  }
}

export declare type UseSplitPaymentsFormResult = HookLoadingResult | UseSplitPaymentsFormReady

/**
 * Memoization helper: state-tax data refetches will return new array
 * references even when the underlying questions are unchanged. Use this
 * inside a `useMemo` whose dependency is the raw `employeeStateTaxes` to
 * avoid rebuilding bound Field components on every render.
 */
export declare function useStateFields(
  employeeStateTaxes: EmployeeStateTaxesList[],
  isAdmin: boolean,
): StateTaxFieldsGroup[]

export declare function useWorkAddressForm({
  companyId,
  employeeId,
  workAddressUuid,
  withEffectiveDateField,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode,
  shouldFocusError,
}: UseWorkAddressFormProps): HookLoadingResult | UseWorkAddressFormReady

export declare interface UseWorkAddressFormProps {
  /** Company UUID for locations; omit or leave unset while resolving from the employee record. */
  companyId?: string
  employeeId: string
  /**
   * When set, loads that work address via GET `/v1/work_addresses/{work_address_uuid}` and updates it (PUT).
   * When omitted, the form is in create mode (POST).
   */
  workAddressUuid?: string
  withEffectiveDateField?: boolean
  optionalFieldsToRequire?: WorkAddressOptionalFieldsToRequire
  defaultValues?: Partial<WorkAddressFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export declare interface UseWorkAddressFormReady extends BaseFormHookReady<
  FieldsMetadata,
  WorkAddressFormData,
  WorkAddressFields
> {
  data: {
    /** The address row loaded for update; `null` in create mode. */
    workAddress: EmployeeWorkAddress | null
    companyLocations: Location_2[] | undefined
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (
      callbacks?: WorkAddressSubmitCallbacks,
      options?: WorkAddressSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeWorkAddress> | undefined>
  }
}

export declare type UseWorkAddressFormResult = HookLoadingResult | UseWorkAddressFormReady

/** Maps every error code a schema field can produce to a partner-supplied display string. */
export declare type ValidationMessages<
  TErrorCode extends string,
  TOptionalErrorCode extends string = never,
> = Record<TErrorCode, string> & Partial<Record<TOptionalErrorCode, string>>

declare function ViewHolidayEmployees(props: ViewHolidayEmployeesProps): JSX_2.Element

declare interface ViewHolidayEmployeesProps extends BaseComponentInterface {
  companyId: string
}

declare function ViewHolidayPolicyDetails(props: ViewHolidayPolicyDetailsProps): JSX_2.Element

declare interface ViewHolidayPolicyDetailsProps extends BaseComponentInterface {
  companyId: string
  defaultTab?: 'holidays' | 'employees'
}

declare function ViewHolidaySchedule(props: ViewHolidayScheduleProps): JSX_2.Element

declare interface ViewHolidayScheduleProps extends BaseComponentInterface {
  companyId: string
}

declare type WARiskClassCode = {
  code: string
  description: string
}

declare type WithholdingType = 'supplemental' | 'regular'

export declare function withOptions<TEntry = unknown>(
  base: FieldMetadata,
  options: Array<{
    label: string
    value: string
  }>,
  entries?: readonly TEntry[],
): FieldMetadataWithOptions<TEntry>

declare function WorkAddress({
  FallbackComponent,
  ...props
}: WorkAddressProps & BaseComponentInterface): JSX_2.Element

export declare type WorkAddressErrorCode =
  (typeof WorkAddressErrorCodes)[keyof typeof WorkAddressErrorCodes]

export declare const WorkAddressErrorCodes: {
  readonly REQUIRED: 'REQUIRED'
}

export declare type WorkAddressField = keyof typeof fieldValidators_6

declare interface WorkAddressFields {
  Location: typeof LocationField
  EffectiveDate: typeof EffectiveDateField_2 | undefined
}

export declare type WorkAddressFieldsMetadata = UseWorkAddressFormReady['form']['fieldsMetadata']

export declare type WorkAddressFormData = {
  [K in keyof typeof fieldValidators_6]: z.infer<(typeof fieldValidators_6)[K]>
}

export declare type WorkAddressFormFields = UseWorkAddressFormReady['form']['Fields']

export declare type WorkAddressFormOutputs = WorkAddressFormData

export declare type WorkAddressOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig_5
>

declare interface WorkAddressProps extends CommonComponentInterface<'Employee.WorkAddress.Management'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

export declare type WorkAddressRequiredValidation = typeof WorkAddressErrorCodes.REQUIRED

declare interface WorkAddressSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: WorkAddressOptionalFieldsToRequire
  withEffectiveDateField?: boolean
}

export declare interface WorkAddressSubmitCallbacks {
  onWorkAddressCreated?: (workAddress: EmployeeWorkAddress) => void
  onWorkAddressUpdated?: (workAddress: EmployeeWorkAddress) => void
}

export declare interface WorkAddressSubmitOptions {
  employeeId?: string
  effectiveDate?: string
}

export declare interface WorkingSplit {
  uuid: string
  name: string | null
  hiddenAccountNumber: string | null
  splitAmount: number | null
  priority: number
}

declare function ZipField(props: ZipFieldProps): JSX_2.Element

export declare type ZipFieldProps = HookFieldProps<TextInputHookFieldProps<ZipValidation>>

export declare type ZipValidation = (typeof HomeAddressErrorCodes)['REQUIRED' | 'INVALID_ZIP']

export {}
