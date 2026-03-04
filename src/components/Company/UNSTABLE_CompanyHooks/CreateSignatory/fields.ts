import type { CreateSignatoryFormData } from './schema'
import { SignatoryValidation } from './schema'
import {
  type FieldsConfig,
  ValidationCode,
  textField,
  selectField,
  dateField,
} from '@/hooks/UNSTABLE/types'
import { SIGNATORY_TITLES, STATES_ABBR } from '@/shared/constants'
import { commonMasks } from '@/helpers/mask'

export const createSignatoryFields = {
  firstName: textField({
    isRequired: true,
    validations: [ValidationCode.Required, SignatoryValidation.NameInvalidCharacters],
  }),
  lastName: textField({
    isRequired: true,
    validations: [ValidationCode.Required, SignatoryValidation.NameInvalidCharacters],
  }),
  email: textField({
    isRequired: true,
    inputMode: 'email',
    validations: [ValidationCode.Required, ValidationCode.EmailInvalidFormat],
  }),
  title: selectField({
    isRequired: true,
    options: Object.entries(SIGNATORY_TITLES).map(([key, value]) => ({
      value: key,
      label: value,
    })),
    validations: [ValidationCode.Required],
  }),
  phone: textField({
    isRequired: true,
    inputMode: 'tel',
    mask: commonMasks.phoneMask,
    validations: [ValidationCode.PhoneInvalidFormat],
  }),
  ssn: textField({
    isRequired: true,
    mask: commonMasks.ssnMask,
    validations: [ValidationCode.Required, ValidationCode.SsnInvalidFormat],
  }),
  birthday: dateField({
    isRequired: true,
    validations: [ValidationCode.Required],
  }),
  street1: textField({
    isRequired: true,
    validations: [ValidationCode.Required],
  }),
  street2: textField({
    validations: [],
  }),
  city: textField({
    isRequired: true,
    validations: [ValidationCode.Required],
  }),
  state: selectField({
    isRequired: true,
    options: STATES_ABBR.map(stateAbbr => ({
      value: stateAbbr,
      label: stateAbbr,
    })),
    validations: [ValidationCode.Required],
  }),
  zip: textField({
    isRequired: true,
    inputMode: 'numeric',
    validations: [ValidationCode.ZipInvalidFormat],
  }),
} satisfies FieldsConfig<CreateSignatoryFormData>
