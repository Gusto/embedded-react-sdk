import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { FormProvider, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AuthorizationStatus,
  I9AuthorizationDocumentType,
} from '@gusto/embedded-api/models/components/i9authorization'
import {
  generateEmploymentEligibilitySchema,
  type EmploymentEligibilityInputs,
  type EmploymentEligibilityPayload,
} from './EmploymentEligibilitySchema'
import { COUNTRIES } from './countries'
import {
  Flex,
  SelectField,
  RadioGroupField,
  TextInputField,
  DatePickerField,
  ActionsLayout,
} from '@/components/Common'
import { ComboBoxField } from '@/components/Common/Fields/ComboBoxField/ComboBoxField'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface EmploymentEligibilityPresentationProps {
  onSubmit: SubmitHandler<EmploymentEligibilityPayload>
  defaultValues?: Partial<EmploymentEligibilityInputs>
  hasDocumentNumber?: boolean | null
  isPending?: boolean
}

const statusDescriptionKeys = {
  citizen: 'statusDescriptions.citizen',
  permanent_resident: 'statusDescriptions.permanent_resident',
  noncitizen: 'statusDescriptions.noncitizen',
  alien: 'statusDescriptions.alien',
} as const satisfies Record<AuthorizationStatus, string>

export const EmploymentEligibilityPresentation = ({
  onSubmit,
  defaultValues,
  hasDocumentNumber,
  isPending,
}: EmploymentEligibilityPresentationProps) => {
  useI18n('Employee.EmploymentEligibility')
  const { Heading, Text, Alert, Button, Link } = useComponentContext()
  const { t } = useTranslation('Employee.EmploymentEligibility')

  const [hasExistingDocumentNumber, setHasExistingDocumentNumber] = useState(!!hasDocumentNumber)

  const formMethods = useForm<EmploymentEligibilityInputs, unknown, EmploymentEligibilityPayload>({
    resolver: zodResolver(generateEmploymentEligibilitySchema(hasExistingDocumentNumber)),
    defaultValues,
  })

  const { control, setValue, clearErrors } = formMethods
  const authorizationStatus = useWatch({ control, name: 'authorizationStatus' })
  const documentType = useWatch({ control, name: 'documentType' })

  const statusOptions = Object.values(AuthorizationStatus).map(value => ({
    value,
    label: t(`select.options.${value}`),
  }))

  const authorizationDocumentOptions = Object.values(I9AuthorizationDocumentType).map(value => ({
    value,
    label: t(`authorizationDocument.options.${value}`),
  }))

  const handleAuthorizationStatusChange = () => {
    setValue('documentNumber', '')
    clearErrors('documentNumber')
    setHasExistingDocumentNumber(false)
  }

  const handleDocumentTypeChange = () => {
    setValue('documentNumber', '')
    clearErrors('documentNumber')
    setHasExistingDocumentNumber(false)
  }

  const showDocumentTypeRadio = authorizationStatus === 'alien'
  const showDocumentNumberInput =
    authorizationStatus === 'permanent_resident' ||
    (authorizationStatus === 'alien' && !!documentType)
  const activeDocumentType =
    authorizationStatus === 'permanent_resident' ? 'uscis_alien_registration_number' : documentType

  const documentNumberMaxLength: Partial<Record<I9AuthorizationDocumentType, number>> = {
    uscis_alien_registration_number: 9,
    form_i94: 11,
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={16}>
          <Flex flexDirection="column" gap={2}>
            <Heading as="h2">{t('title')}</Heading>
            <Text variant="supporting">
              <Trans
                i18nKey={'subtitle'}
                t={t}
                components={{
                  formI9Link: <Link />,
                }}
              />
            </Text>
          </Flex>

          <SelectField
            name="authorizationStatus"
            label={t('select.label')}
            description={t('select.description')}
            placeholder={t('select.placeholder')}
            options={statusOptions}
            isRequired
            onChange={handleAuthorizationStatusChange}
          />

          {authorizationStatus && (
            <Alert
              status="info"
              label={t(statusDescriptionKeys[authorizationStatus])}
              disableScrollIntoView
            />
          )}

          {authorizationStatus === 'alien' && (
            <DatePickerField name="expirationDate" label={t('expirationDate.label')} />
          )}

          {showDocumentTypeRadio && (
            <RadioGroupField
              name="documentType"
              label={t('authorizationDocument.label')}
              options={authorizationDocumentOptions}
              isRequired
              onChange={handleDocumentTypeChange}
            />
          )}

          {showDocumentNumberInput && activeDocumentType && (
            <TextInputField
              name="documentNumber"
              label={t(`documentNumber.${activeDocumentType}.label`)}
              description={
                activeDocumentType !== 'foreign_passport'
                  ? t(`documentNumber.${activeDocumentType}.description`)
                  : undefined
              }
              placeholder={
                hasExistingDocumentNumber
                  ? t(`documentNumber.${activeDocumentType}.placeholder`)
                  : undefined
              }
              maxLength={documentNumberMaxLength[activeDocumentType]}
              isRequired
            />
          )}

          {documentType === 'foreign_passport' && authorizationStatus === 'alien' && (
            <ComboBoxField
              name="country"
              label={t('country.label')}
              description={t('country.description')}
              options={COUNTRIES}
              placeholder={t('country.placeholder')}
              allowsCustomValue
              isRequired
            />
          )}

          <ActionsLayout>
            <Button type="submit" isLoading={isPending}>
              {t('submit')}
            </Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
