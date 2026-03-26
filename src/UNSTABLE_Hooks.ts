export {
  // Compensation hook + component
  useCompensationForm,
  CompensationForm,
  CompensationErrorCodes,

  // Compensation types
  type CompensationFormProps,
  type CompensationSubmitCallbacks,
  type CompensationSubmitOptions,
  type CompensationRequiredFields,
  type UseCompensationFormProps,
  type UseCompensationFormResult,
  type UseCompensationFormReady,
  type CompensationFieldsMetadata,
  type CompensationFormFields,
  type CompensationErrorCode,
  type CompensationField,
  type CompensationFormData,
  type CompensationFormOutputs,

  // Compensation validation code types
  type RequiredValidation,
  type RateValidation,

  // Compensation field prop types
  type StartDateFieldProps,
  type JobTitleFieldProps,
  type FlsaStatusFieldProps,
  type RateFieldProps,
  type PaymentUnitFieldProps,
  type AdjustForMinimumWageFieldProps,
  type MinimumWageIdFieldProps,
  type TwoPercentShareholderFieldProps,
  type StateWcCoveredFieldProps,
  type StateWcClassCodeFieldProps,

  // Form infrastructure
  SDKFormProvider,
  FormFieldsMetadataProvider,
  composeSubmitHandler,
  useFieldsMetadata,
  useFieldErrorMessage,
  withOptions,
  deriveFieldsMetadata,
  collectErrors,

  // Generic hook field components
  TextInputHookField,
  SelectHookField,
  CheckboxHookField,
  NumberInputHookField,
  DatePickerHookField,
  RadioGroupHookField,

  // Error handling
  useErrorHandling,

  // Hook + form base types
  type HookFormInternals,
  type HookLoadingResult,
  type HookSubmitResult,
  type HookErrorHandling,
  type BaseHookReady,
  type BaseFormHookReady,

  // Field infrastructure types
  type FieldMetadata,
  type FieldMetadataWithOptions,
  type FieldsMetadata,
  type FormFieldsMetadataContextValue,
  type ValidationMessages,
  type BaseFieldProps,

  // Generic hook field prop types
  type TextInputHookFieldProps,
  type SelectHookFieldProps,
  type CheckboxHookFieldProps,
  type NumberInputHookFieldProps,
  type DatePickerHookFieldProps,
  type RadioGroupHookFieldProps,

  // UI component prop types (for custom FieldComponent implementations)
  type TextInputProps,
  type SelectProps,
  type SelectOption,
  type CheckboxProps,
  type NumberInputProps,
  type DatePickerProps,
  type RadioGroupProps,
  type RadioGroupOption,

  // Employee details hook + component
  useEmployeeDetailsForm,
  EmployeeDetailsForm,
  EmployeeDetailsErrorCodes,

  // Employee details types
  type EmployeeDetailsFormProps,
  type EmployeeDetailsSubmitCallbacks,
  type EmployeeDetailsRequiredFields,
  type UseEmployeeDetailsFormProps,
  type UseEmployeeDetailsFormResult,
  type UseEmployeeDetailsFormReady,
  type EmployeeDetailsFieldsMetadata,
  type EmployeeDetailsFormFields,
  type EmployeeDetailsErrorCode,
  type EmployeeDetailsFormData,
  type EmployeeDetailsFormOutputs,
  type EmployeeDetailsField,

  // Employee details validation code types
  type EmployeeDetailsRequiredValidation,
  type EmailValidation,
  type SsnValidation,

  // Employee details field prop types
  type FirstNameFieldProps,
  type MiddleInitialFieldProps,
  type LastNameFieldProps,
  type EmailFieldProps,
  type DateOfBirthFieldProps,
  type SsnFieldProps,
  type SelfOnboardingFieldProps,

  // Work address hook + component
  useWorkAddressForm,
  WorkAddressForm,
  WorkAddressErrorCodes,

  // Work address types
  type WorkAddressFormProps,
  type WorkAddressSubmitCallbacks,
  type WorkAddressSubmitOptions,
  type WorkAddressRequiredFields,
  type UseWorkAddressFormProps,
  type UseWorkAddressFormResult,
  type UseWorkAddressFormReady,
  type WorkAddressFieldsMetadata,
  type WorkAddressFormFields,
  type WorkAddressErrorCode,
  type WorkAddressFormData,
  type WorkAddressFormOutputs,
  type WorkAddressField,

  // Work address validation code types
  type WorkAddressRequiredValidation,

  // Work address field prop types
  type LocationFieldProps,
  type EffectiveDateFieldProps,
} from '@/components/UNSTABLE_Hooks'
