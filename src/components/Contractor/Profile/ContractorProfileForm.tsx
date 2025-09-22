import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { useContractorProfile } from './useContractorProfile'
import styles from './ContractorProfileForm.module.scss'
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
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { normalizeEin, usePlaceholderEin } from '@/helpers/federalEin'
import { ContractorOnboardingStatus } from '@/shared/constants'

// Pure presentation component - takes all data as props
export type ContractorProfileFormProps = ReturnType<typeof useContractorProfile> & {
  className?: string
  existingContractor?: Contractor
}

export function ContractorProfileForm({
  formMethods,
  handleSubmit,
  formState,
  shouldShowEmailField,
  shouldShowBusinessFields,
  shouldShowIndividualFields,
  shouldShowHourlyRate,
  contractorTypeOptions,
  wageTypeOptions,
  isEditing,
  className,
  existingContractor,
}: ContractorProfileFormProps) {
  const Components = useComponentContext()
  useI18n('Contractor.Profile')
  const { t } = useTranslation('Contractor.Profile')
  const ssnPlaceholder = usePlaceholderSSN(existingContractor?.hasSsn ?? false)
  const einPlaceholder = usePlaceholderEin(existingContractor?.hasEin ?? false)

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
            <div className={styles.switchFieldContainer}>
              <Grid gap={16}>
                {/* Invite Contractor Toggle */}
                <SwitchField
                  name="selfOnboarding"
                  label={t('fields.selfOnboarding.label')}
                  description={t('fields.selfOnboarding.description')}
                  isDisabled={
                    existingContractor &&
                    existingContractor.onboardingStatus !==
                      ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE
                  }
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
            </div>

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
                  placeholder={ssnPlaceholder}
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
                  placeholder={einPlaceholder}
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
