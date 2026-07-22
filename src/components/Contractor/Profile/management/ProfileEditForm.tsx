import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useContractorDetailsForm } from '../shared/useContractorDetailsForm'
import styles from './ProfileEditForm.module.scss'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { Grid } from '@/components/Common/Grid/Grid'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents, CONTRACTOR_TYPE } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link ProfileEditForm}.
 *
 * @public
 */
export interface ProfileEditFormProps extends BaseComponentInterface<'Contractor.Management.Profile'> {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Standalone edit form for a contractor's basic profile details.
 *
 * @remarks
 * Renders fields for the contractor's name (or business name), start date,
 * tax ID (SSN or EIN, depending on the contractor's type), and email — all
 * required on update except tax ID and email — and shows a success alert
 * when the save completes. An SSN/EIN already on file renders as a locked,
 * masked value with a "Change" action rather than a blank editable input.
 * Save and Cancel both emit events so the parent can return to the read view.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/profile/updated` | Fired after the contractor profile is successfully saved | {@link APIModels.Contractor} |
 * | `contractor/management/profile/editCancelled` | Fired when the user clicks Cancel | — |
 *
 * @param input - See {@link ProfileEditFormProps}.
 * @returns The contractor profile edit form.
 * @public
 */
export function ProfileEditForm({ FallbackComponent, ...props }: ProfileEditFormProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Management.Profile"
      FallbackComponent={FallbackComponent}
    >
      <ProfileEditFormRoot {...props} />
    </BaseBoundaries>
  )
}

function ProfileEditFormRoot({
  contractorId,
  className,
  dictionary,
  onEvent,
}: ProfileEditFormProps) {
  useI18n('Contractor.Management.Profile')
  useComponentDictionary('Contractor.Management.Profile', dictionary)
  const { t } = useTranslation('Contractor.Management.Profile')
  const Components = useComponentContext()

  const contractorDetails = useContractorDetailsForm({
    contractorId,
    withSelfOnboardingField: false,
    showEmailField: true,
    optionalFieldsToRequire: {
      update: ['firstName', 'lastName', 'businessName', 'startDate'],
    },
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditingSsn, setIsEditingSsn] = useState(false)
  const [isEditingEin, setIsEditingEin] = useState(false)

  if (contractorDetails.isLoading) {
    return <BaseLayout isLoading error={contractorDetails.errorHandling.errors} />
  }

  const contractor = contractorDetails.data.contractor
  if (!contractor) {
    return <BaseLayout error={contractorDetails.errorHandling.errors} />
  }

  const isBusiness = contractor.type === CONTRACTOR_TYPE.BUSINESS
  const Fields = contractorDetails.form.Fields
  const { setValue } = contractorDetails.form.hookFormInternals.formMethods

  const handleSubmit = async () => {
    setShowSuccess(false)
    const result = await contractorDetails.actions.onSubmit()
    if (!result) return
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_UPDATED, result.data)
    setShowSuccess(true)
  }

  const handleCancel = () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_EDIT_CANCELLED)
  }

  const alert = showSuccess ? (
    <Components.Alert
      status="success"
      label={t('form.successAlert')}
      onDismiss={() => {
        setShowSuccess(false)
      }}
    />
  ) : undefined

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={contractorDetails.errorHandling.errors}>
        <SDKFormProvider formHookResult={contractorDetails}>
          <Form onSubmit={handleSubmit}>
            {alert}
            <Components.Heading as="h1">{t('form.title')}</Components.Heading>
            {isBusiness ? (
              <>
                {Fields.BusinessName && (
                  <Fields.BusinessName
                    label={t('form.businessName')}
                    validationMessages={{ REQUIRED: t('form.validations.businessName') }}
                  />
                )}
                <Fields.StartDate
                  label={t('form.startDate')}
                  validationMessages={{ REQUIRED: t('form.validations.startDate') }}
                />
                {contractor.hasEin && !isEditingEin ? (
                  <LockedField
                    label={t('form.einLabel')}
                    maskedValue={t('form.einMask')}
                    hint={t('form.onFileHint')}
                    changeLabel={t('form.changeCta')}
                    onEdit={() => {
                      setIsEditingEin(true)
                      setValue('ein', '')
                    }}
                  />
                ) : (
                  Fields.Ein && (
                    <Fields.Ein
                      label={t('form.einLabel')}
                      validationMessages={{
                        INVALID_EIN: t('form.validations.ein'),
                        REQUIRED: t('form.validations.ein'),
                      }}
                    />
                  )
                )}
              </>
            ) : (
              <>
                <Grid
                  gap={{ base: 20, small: 8 }}
                  gridTemplateColumns={{ base: '1fr', small: ['1fr', 200] }}
                >
                  {Fields.FirstName && (
                    <Fields.FirstName
                      label={t('form.firstName')}
                      validationMessages={{
                        REQUIRED: t('form.validations.firstName'),
                        INVALID_NAME: t('form.validations.firstName'),
                      }}
                    />
                  )}
                  {Fields.MiddleInitial && <Fields.MiddleInitial label={t('form.middleInitial')} />}
                </Grid>
                {Fields.LastName && (
                  <Fields.LastName
                    label={t('form.lastName')}
                    validationMessages={{
                      REQUIRED: t('form.validations.lastName'),
                      INVALID_NAME: t('form.validations.lastName'),
                    }}
                  />
                )}
                <Fields.StartDate
                  label={t('form.startDate')}
                  validationMessages={{ REQUIRED: t('form.validations.startDate') }}
                />
                {contractor.hasSsn && !isEditingSsn ? (
                  <LockedField
                    label={t('form.ssnLabel')}
                    maskedValue={t('form.ssnMask')}
                    hint={t('form.onFileHint')}
                    changeLabel={t('form.changeCta')}
                    onEdit={() => {
                      setIsEditingSsn(true)
                      setValue('ssn', '')
                    }}
                  />
                ) : (
                  Fields.Ssn && (
                    <Fields.Ssn
                      label={t('form.ssnLabel')}
                      validationMessages={{
                        INVALID_SSN: t('form.validations.ssn'),
                        REQUIRED: t('form.validations.ssn'),
                      }}
                    />
                  )
                )}
              </>
            )}
            {Fields.Email && (
              <Fields.Email
                label={t('form.email')}
                description={t('form.emailDescription')}
                validationMessages={{
                  REQUIRED: t('form.validations.email'),
                  INVALID_EMAIL: t('form.validations.email'),
                }}
              />
            )}
            <ActionsLayout>
              <Components.Button variant="secondary" onClick={handleCancel} type="button">
                {t('form.cancelCta')}
              </Components.Button>
              <Components.Button type="submit" isLoading={contractorDetails.status.isPending}>
                {t('form.saveCta')}
              </Components.Button>
            </ActionsLayout>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}

function LockedField({
  label,
  maskedValue,
  hint,
  changeLabel,
  onEdit,
}: {
  label: string
  maskedValue: string
  hint: string
  changeLabel: string
  onEdit: () => void
}) {
  const Components = useComponentContext()

  return (
    <div className={styles.lockedField}>
      <Components.Text weight="medium" size="sm">
        {label}
      </Components.Text>
      <div className={styles.lockedFieldRow}>
        <div className={styles.lockedFieldInput}>
          <Components.TextInput
            name=""
            label={label}
            shouldVisuallyHideLabel
            value={maskedValue}
            isDisabled
          />
        </div>
        <Components.Button
          variant="secondary"
          type="button"
          className={styles.lockedFieldButton}
          onClick={onEdit}
        >
          {changeLabel}
        </Components.Button>
      </div>
      <Components.Text variant="supporting" size="sm">
        {hint}
      </Components.Text>
    </div>
  )
}
