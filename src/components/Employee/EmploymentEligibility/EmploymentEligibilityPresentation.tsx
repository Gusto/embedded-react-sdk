import { useTranslation, Trans } from 'react-i18next'
import { FormProvider, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Flex,
  SelectField,
  RadioGroupField,
  TextInputField,
  DatePickerField,
  ActionsLayout,
} from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const EligibilityStatusValues = [
  'citizen',
  'lawfulPermanentResident',
  'noncitizen',
  'noncitizen_authorized',
] as const
const AuthorizationDocumentValues = ['uscis', 'i94', 'foreignPassport'] as const

export const EmploymentEligibilitySchema = z.object({
  eligibilityStatus: z.enum(EligibilityStatusValues).optional(),
  authorizedToWorkUntil: z
    .date()
    .nullable()
    .optional()
    .refine(date => !date || date > new Date(), {
      message: 'Date must be in the future',
    }),
  authorizationDocumentType: z.enum(AuthorizationDocumentValues).optional(),
  uscisNumber: z.string().optional(),
  i94AdmissionNumber: z.string().optional(),
  foreignPassportNumber: z.string().optional(),
  countryOfIssuance: z.string().optional(),
})

export type EmploymentEligibilityInputs = z.infer<typeof EmploymentEligibilitySchema>

export type EligibilityStatus = (typeof EligibilityStatusValues)[number]
export type AuthorizationDocumentType = (typeof AuthorizationDocumentValues)[number]

interface EmploymentEligibilityPresentationProps {
  onSubmit: (data: EmploymentEligibilityInputs) => void
  defaultValues?: Partial<EmploymentEligibilityInputs>
}

const statusDescriptionKeys = {
  citizen: 'statusDescriptions.citizen',
  lawfulPermanentResident: 'statusDescriptions.lawfulPermanentResident',
  noncitizen: 'statusDescriptions.noncitizen',
  noncitizen_authorized: 'statusDescriptions.noncitizen_authorized',
} as const satisfies Record<EligibilityStatus, string>

export const EmploymentEligibilityPresentation = ({
  onSubmit,
  defaultValues,
}: EmploymentEligibilityPresentationProps) => {
  useI18n('Employee.EmploymentEligibility')
  const { Heading, Text, Alert, Button, Link } = useComponentContext()
  const { t } = useTranslation('Employee.EmploymentEligibility')

  const formMethods = useForm<EmploymentEligibilityInputs>({
    resolver: zodResolver(EmploymentEligibilitySchema),
    defaultValues: {
      authorizationDocumentType: 'uscis',
      ...defaultValues,
    },
  })

  const { control } = formMethods
  const selectedStatus = useWatch({ control, name: 'eligibilityStatus' })
  const authorizationDocumentType = useWatch({ control, name: 'authorizationDocumentType' })

  const handleSubmit: SubmitHandler<EmploymentEligibilityInputs> = data => {
    onSubmit(data)
  }

  const statusOptions = [
    { value: 'citizen' as const, label: t('select.options.citizen') },
    {
      value: 'lawfulPermanentResident' as const,
      label: t('select.options.lawfulPermanentResident'),
    },
    { value: 'noncitizen' as const, label: t('select.options.noncitizen') },
    { value: 'noncitizen_authorized' as const, label: t('select.options.noncitizen_authorized') },
  ]

  const authorizationDocumentOptions = [
    { value: 'uscis' as const, label: t('authorizationDocument.options.uscis') },
    { value: 'i94' as const, label: t('authorizationDocument.options.i94') },
    {
      value: 'foreignPassport' as const,
      label: t('authorizationDocument.options.foreignPassport'),
    },
  ]

  // TODO: Eng to handle Country values and validation

  const countryOptions = [
    { value: 'CA', label: 'Canada' },
    { value: 'MX', label: 'Mexico' },
    { value: 'US', label: 'United States' },
  ]

  const showUscisInput =
    selectedStatus === 'lawfulPermanentResident' ||
    (selectedStatus === 'noncitizen_authorized' && authorizationDocumentType === 'uscis')

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={formMethods.handleSubmit(handleSubmit)}>
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
            name="eligibilityStatus"
            label={t('select.label')}
            description={t('select.description')}
            placeholder={t('select.placeholder')}
            options={statusOptions}
            isRequired
          />

          {selectedStatus && (
            <Alert
              status="info"
              label={t(statusDescriptionKeys[selectedStatus])}
              disableScrollIntoView
            />
          )}

          {selectedStatus === 'noncitizen_authorized' && (
            <Flex flexDirection="column" gap={20}>
              <DatePickerField
                name="authorizedToWorkUntil"
                label={t('authorizedToWorkUntil.label')}
                isRequired
              />

              <RadioGroupField
                name="authorizationDocumentType"
                label={t('authorizationDocument.label')}
                options={authorizationDocumentOptions}
                isRequired
              />

              {authorizationDocumentType === 'i94' && (
                <TextInputField
                  name="i94AdmissionNumber"
                  label={t('i94AdmissionNumber.label')}
                  description={t('i94AdmissionNumber.description')}
                  isRequired
                />
              )}

              {authorizationDocumentType === 'foreignPassport' && (
                <>
                  <TextInputField
                    name="foreignPassportNumber"
                    label={t('foreignPassport.label')}
                    isRequired
                  />

                  <SelectField
                    name="countryOfIssuance"
                    label={t('countryOfIssuance.label')}
                    description={t('countryOfIssuance.description')}
                    options={countryOptions}
                    isRequired
                  />
                </>
              )}
            </Flex>
          )}

          {showUscisInput && (
            <TextInputField
              name="uscisNumber"
              label={t('uscisNumber.label')}
              description={t('uscisNumber.description')}
              isRequired
            />
          )}

          <ActionsLayout>
            <Button type="submit">{t('submit')}</Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
