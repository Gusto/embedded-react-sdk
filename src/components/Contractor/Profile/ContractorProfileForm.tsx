import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { useContractorProfile } from './useContractorProfile'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Form } from '@/components/Common/Form'
import { Grid } from '@/components/Common/Grid/Grid'
import { Flex } from '@/components/Common/Flex'
import { TextInputField } from '@/components/Common/Fields/TextInputField'
import { NumberInputField } from '@/components/Common/Fields/NumberInputField'
import { RadioGroupField } from '@/components/Common/Fields/RadioGroupField'
import { SwitchField } from '@/components/Common/Fields/SwitchField'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField'
import { normalizeSSN } from '@/helpers/ssn'
import { normalizeEin } from '@/helpers/federalEin'

// Pure presentation component - takes all data as props
export type ContractorProfileFormProps = ReturnType<typeof useContractorProfile> & {
  className?: string
}

export function ContractorProfileForm({
  formMethods,
  handleSubmit,
  formState,
  handleCancel,
  shouldShowEmailField,
  shouldShowBusinessFields,
  shouldShowIndividualFields,
  shouldShowHourlyRate,
  contractorTypeOptions,
  wageTypeOptions,
  isEditing,
  className,
}: ContractorProfileFormProps) {
  const Components = useComponentContext()
  useI18n('Contractor.Profile')
  const { t } = useTranslation('Contractor.Profile')

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={handleSubmit}>
          <Grid gridTemplateColumns="1fr" gap={24} className="mb-8">
            <header>
              <Components.Heading as="h2">{t('title')}</Components.Heading>
              <Components.Text>{t('subtitle')}</Components.Text>
            </header>

            {/* Invite Contractor Card */}
            <Components.Card>
              <Grid gap={16}>
                {/* Invite Contractor Toggle */}
                <SwitchField
                  name="inviteContractor"
                  label={t('fields.inviteContractor.label')}
                  description={t('fields.inviteContractor.description')}
                />

                {/* Email Field - shown when inviting contractor */}
                {shouldShowEmailField && (
                  <TextInputField
                    name="email"
                    label={t('fields.email.label')}
                    isRequired
                    type="email"
                  />
                )}
              </Grid>
            </Components.Card>

            {/* Contractor Type */}
            <RadioGroupField
              name="contractorType"
              isRequired
              label={t('fields.contractorType.label')}
              options={contractorTypeOptions}
            />

            {/* Individual Contractor Fields */}
            {shouldShowIndividualFields && (
              <>
                <Grid gridTemplateColumns={{ base: '1fr', medium: '1fr 1fr' }} gap={16}>
                  <TextInputField name="firstName" label={t('fields.firstName.label')} isRequired />
                  <TextInputField name="middleInitial" label={t('fields.middleInitial.label')} />
                </Grid>
                <TextInputField name="lastName" label={t('fields.lastName.label')} isRequired />
                <TextInputField
                  name="ssn"
                  label={t('fields.ssn.label')}
                  placeholder={t('fields.ssn.placeholder')}
                  transform={normalizeSSN}
                  isRequired
                />
              </>
            )}

            {/* Business Contractor Fields */}
            {shouldShowBusinessFields && (
              <>
                <TextInputField
                  name="businessName"
                  label={t('fields.businessName.label')}
                  isRequired
                />
                <TextInputField
                  name="ein"
                  label={t('fields.ein.label')}
                  placeholder={t('fields.ein.placeholder')}
                  transform={normalizeEin}
                  isRequired
                />
              </>
            )}

            {/* Wage Type */}
            <RadioGroupField
              name="wageType"
              isRequired
              label={t('fields.wageType.label')}
              options={wageTypeOptions}
            />

            {/* Hourly Rate - shown for hourly contractors */}
            {shouldShowHourlyRate && (
              <NumberInputField
                name="hourlyRate"
                label={t('fields.hourlyRate.label')}
                min={0}
                isRequired
                format="currency"
              />
            )}

            {/* Start Date */}
            <DatePickerField
              name="startDate"
              label={t('fields.startDate.label')}
              description={t('fields.startDate.description')}
              isRequired
            />
          </Grid>

          {/* Actions */}
          <Flex gap={12} justifyContent="flex-end">
            <Components.Button type="button" variant="secondary" onClick={handleCancel}>
              {t('buttons.cancel')}
            </Components.Button>
            <Components.Button type="submit" variant="primary" isDisabled={formState.isSubmitting}>
              {formState.isSubmitting
                ? isEditing
                  ? t('buttons.updating')
                  : t('buttons.creating')
                : isEditing
                  ? t('buttons.update')
                  : t('buttons.create')}
            </Components.Button>
          </Flex>
        </Form>
      </FormProvider>
    </section>
  )
}
