import type { CreateSignatoryFormData } from './schema'
import { SignatoryValidation } from './schema'
import { type FieldsConfig, ValidationCode } from '@/hooks/UNSTABLE/types'
import { SIGNATORY_TITLES, STATES_ABBR } from '@/shared/constants'
import { commonMasks } from '@/helpers/mask'

export const createSignatoryFields: FieldsConfig<CreateSignatoryFormData> = {
  firstName: {
    type: 'text',
    required: true,
    validations: [ValidationCode.Required, SignatoryValidation.NameInvalidCharacters],
  },
  lastName: {
    type: 'text',
    required: true,
    validations: [ValidationCode.Required, SignatoryValidation.NameInvalidCharacters],
  },
  email: {
    type: 'text',
    required: true,
    inputMode: 'email',
    validations: [ValidationCode.Required, ValidationCode.EmailInvalidFormat],
  },
  title: {
    type: 'select',
    required: true,
    options: Object.entries(SIGNATORY_TITLES).map(([key, value]) => ({
      value: key,
      label: value,
    })),
    validations: [ValidationCode.Required],
  },
  phone: {
    type: 'text',
    required: true,
    inputMode: 'tel',
    mask: commonMasks.phoneMask,
    validations: [ValidationCode.PhoneInvalidFormat],
  },
  ssn: {
    type: 'text',
    required: true,
    mask: commonMasks.ssnMask,
    validations: [ValidationCode.SsnInvalidFormat],
  },
  birthday: {
    type: 'date',
    required: true,
    validations: [ValidationCode.Required],
  },
  street1: {
    type: 'text',
    required: true,
    validations: [ValidationCode.Required],
  },
  street2: {
    type: 'text',
    required: false,
    validations: [],
  },
  city: {
    type: 'text',
    required: true,
    validations: [ValidationCode.Required],
  },
  state: {
    type: 'select',
    required: true,
    options: STATES_ABBR.map(stateAbbr => ({
      value: stateAbbr,
      label: stateAbbr,
    })),
    validations: [ValidationCode.Required],
  },
  zip: {
    type: 'text',
    required: true,
    inputMode: 'numeric',
    validations: [ValidationCode.ZipInvalidFormat],
  },
}
