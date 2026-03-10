import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { useEmployeeDetailsBase } from './useEmployeeDetailsBase'
import { TextInputField, DatePickerField, Grid } from '@/components/Common'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { useI18n } from '@/i18n'

const I18N_NS = 'Employee.EmployeeDetailsFields' as const

export type EmployeeDetailsFieldsMetadata = ReturnType<typeof useEmployeeDetailsBase>['fields']

interface EmployeeDetailsFieldsProps {
  fields: EmployeeDetailsFieldsMetadata
  showEmail?: boolean
}

export function EmployeeDetailsFields({ fields, showEmail = true }: EmployeeDetailsFieldsProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const {
    formState: { errors },
  } = useFormContext()
  const placeholderSSN = usePlaceholderSSN(fields.ssn.hasRedactedValue)

  const validationMessages: Record<string, string> = {
    REQUIRED: t('validations.REQUIRED'),
    INVALID_NAME_FORMAT: t('validations.INVALID_NAME_FORMAT'),
    INVALID_EMAIL_FORMAT: t('validations.INVALID_EMAIL_FORMAT'),
    INVALID_SSN_FORMAT: t('validations.INVALID_SSN_FORMAT'),
    INVALID_DATE_FORMAT: t('validations.INVALID_DATE_FORMAT'),
  }
  const v = (message: unknown) =>
    typeof message === 'string' ? validationMessages[message] : undefined

  return (
    <>
      <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
        <TextInputField
          name={fields.firstName.name}
          label={t('firstName')}
          isRequired={fields.firstName.isRequired}
          errorMessage={v(errors.firstName?.message)}
        />
        <TextInputField name={fields.middleInitial.name} label={t('middleInitial')} />
        <TextInputField
          name={fields.lastName.name}
          label={t('lastName')}
          isRequired={fields.lastName.isRequired}
          errorMessage={v(errors.lastName?.message)}
        />
        {showEmail && (
          <TextInputField
            name={fields.email.name}
            label={t('email')}
            description={t('emailDescription')}
            isRequired={fields.email.isRequired}
            errorMessage={v(errors.email?.message)}
            type="email"
          />
        )}
      </Grid>

      {fields.ssn.isRequired && (
        <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
          <TextInputField
            name={fields.ssn.name}
            label={t('ssn')}
            isRequired={fields.ssn.isRequired}
            transform={normalizeSSN}
            placeholder={placeholderSSN}
            errorMessage={v(errors.ssn?.message)}
          />
          <DatePickerField
            name={fields.dateOfBirth.name}
            label={t('dateOfBirth')}
            isRequired={fields.dateOfBirth.isRequired}
            errorMessage={v(errors.dateOfBirth?.message)}
          />
        </Grid>
      )}
    </>
  )
}
