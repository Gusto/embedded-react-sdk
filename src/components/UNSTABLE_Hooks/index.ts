export {
  useHomeAddressForm,
  HomeAddressFormProvider,
  type UseHomeAddressFormResult,
  type HomeAddressFormReady,
  type HomeAddressData,
} from './hooks/useHomeAddress'

export {
  useWorkAddressForm,
  WorkAddressFormProvider,
  type UseWorkAddressFormResult,
  type WorkAddressFormReady,
  type WorkAddressData,
} from './hooks/useWorkAddress'

export {
  useEmployeeDetailsForm,
  EmployeeDetailsFormProvider,
  type UseEmployeeDetailsFormResult,
  type EmployeeDetailsFormReady,
  type EmployeeDetailsData,
} from './hooks/useEmployeeDetails'

export { composeSubmitHandler } from './hooks/composeSubmitHandler'

export {
  type HookFormInternals,
  type HookLoadingResult,
  type HookErrors,
  type HookSubmitResult,
} from './helpers'

export type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
export type { SelectProps, SelectOption } from '@/components/Common/UI/Select/SelectTypes'
export type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
export type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'

export type { TextInputFieldProps } from '@/components/Common/Fields/TextInputField'
export type { SelectFieldProps } from '@/components/Common/Fields/SelectField'
export type { CheckboxFieldProps } from '@/components/Common/Fields/CheckboxField'
