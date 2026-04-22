import { useTranslation, Trans } from 'react-i18next'
import type { AuthorizationStatus } from '@gusto/embedded-api/models/components/i9authorization'
import { useI9VerificationGetAuthorization } from '@gusto/embedded-api/react-query/i9VerificationGetAuthorization'
import { useSignEmployeeForm, type PreparerFieldGroup } from '../shared/useSignEmployeeForm'
import styles from './I9SignatureForm.module.scss'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { BaseLayout } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { ActionsLayout, Flex } from '@/components/Common'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { Form } from '@/components/Common/Form'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface I9SignatureFormProps extends CommonComponentInterface {
  employeeId: string
  formId: string
}

export function I9SignatureForm(props: I9SignatureFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ employeeId, formId, className }: I9SignatureFormProps) {
  useI18n('Employee.I9SignatureForm')
  const { t } = useTranslation('Employee.I9SignatureForm')
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const hookResult = useSignEmployeeForm({ employeeId, formId })

  const { data: i9AuthData } = useI9VerificationGetAuthorization({ employeeId })
  const authorizationStatus = i9AuthData?.i9Authorization?.authorizationStatus

  if (hookResult.isLoading) {
    return <BaseLayout isLoading error={hookResult.errorHandling.errors} />
  }

  const { form, pdfUrl } = hookResult.data
  const { isPending } = hookResult.status
  const { Fields } = hookResult.form
  const preparerCount = hookResult.form.preparers?.count ?? 0
  const canAddPreparer = hookResult.form.preparers?.canAdd ?? false
  const usedPreparer = hookResult.form.hookFormInternals.formMethods.watch('usedPreparer')

  const handleBack = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleChangeEligibility = () => {
    onEvent(componentEvents.EMPLOYEE_CHANGE_ELIGIBILITY_STATUS)
  }

  const handleSubmit = async () => {
    const result = await hookResult.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_SIGN_FORM, result.data)
    }
  }

  const handleAddPreparer = () => {
    hookResult.actions.addPreparer?.()
  }

  const handleRemovePreparer = () => {
    hookResult.actions.removePreparer?.()
  }

  const preparerFieldGroups = [
    Fields.Preparer1,
    Fields.Preparer2,
    Fields.Preparer3,
    Fields.Preparer4,
  ]

  return (
    <section className={className}>
      <BaseLayout error={hookResult.errorHandling.errors}>
        <SDKFormProvider formHookResult={hookResult}>
          <Form onSubmit={() => void handleSubmit()}>
            <Flex flexDirection="column" gap={20}>
              <section>
                <Components.Heading as="h2">{t('title')}</Components.Heading>
                <Components.Text>
                  <Trans
                    i18nKey="description"
                    t={t}
                    components={{
                      viewFormLink: pdfUrl ? (
                        <Components.Link
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`${form.title || 'form'}.pdf`}
                        />
                      ) : (
                        <span />
                      ),
                    }}
                  />
                </Components.Text>
              </section>

              {authorizationStatus && (
                <EligibilityStatusAlert
                  authorizationStatus={authorizationStatus}
                  onChangeStatus={handleChangeEligibility}
                />
              )}

              <DocumentViewer
                url={pdfUrl}
                title={form.title}
                downloadInstructions={t('downloadInstructions')}
                viewDocumentLabel={t('viewDocumentCta')}
              />

              <Flex flexDirection="column" gap={12}>
                <Fields.Signature
                  label={t('signatureLabel')}
                  description={t('signatureDescription')}
                  validationMessages={{ REQUIRED: t('signatureError') }}
                />
                <Fields.ConfirmSignature
                  label={t('confirmationLabel')}
                  validationMessages={{ REQUIRED: t('confirmationError') }}
                />
              </Flex>

              {Fields.UsedPreparer && (
                <Flex flexDirection="column" gap={20}>
                  <Fields.UsedPreparer
                    label={t('preparerQuestion')}
                    validationMessages={{ REQUIRED: t('preparerQuestion') }}
                  />

                  {usedPreparer === 'yes' &&
                    preparerFieldGroups.map((PreparerFields, index) => {
                      if (!PreparerFields) return null
                      const isLast = index === preparerCount - 1
                      return (
                        <Flex flexDirection="column" gap={0} key={index}>
                          <div className={styles.preparerAlert}>
                            <Components.Alert
                              label={t('preparerNote')}
                              status="info"
                              disableScrollIntoView
                            />
                          </div>
                          <PreparerSection
                            PreparerFields={PreparerFields}
                            showRemoveButton={index !== 0}
                            showAddButton={canAddPreparer && isLast}
                            onAdd={handleAddPreparer}
                            onRemove={handleRemovePreparer}
                          />
                        </Flex>
                      )
                    })}
                </Flex>
              )}

              <ActionsLayout>
                <Components.Button variant="secondary" type="button" onClick={handleBack}>
                  {t('cancelCta')}
                </Components.Button>
                <Components.Button type="submit" isLoading={isPending}>
                  {t('signCta')}
                </Components.Button>
              </ActionsLayout>
            </Flex>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}

interface EligibilityStatusAlertProps {
  authorizationStatus: AuthorizationStatus
  onChangeStatus: () => void
}

function EligibilityStatusAlert({
  authorizationStatus,
  onChangeStatus,
}: EligibilityStatusAlertProps) {
  const { t } = useTranslation('Employee.I9SignatureForm')
  const Components = useComponentContext()

  const alertLabelKeys = {
    citizen: 'eligibilityAlertLabel_citizen',
    permanent_resident: 'eligibilityAlertLabel_permanent_resident',
    noncitizen: 'eligibilityAlertLabel_noncitizen',
    alien: 'eligibilityAlertLabel_alien',
  } as const satisfies Record<AuthorizationStatus, string>

  const alertDescriptionKeys = {
    citizen: 'eligibilityAlertDescription_citizen',
    permanent_resident: 'eligibilityAlertDescription_permanent_resident',
    noncitizen: 'eligibilityAlertDescription_noncitizen',
    alien: 'eligibilityAlertDescription_alien',
  } as const satisfies Record<AuthorizationStatus, string>

  return (
    <Components.Alert
      status="info"
      label={t(alertLabelKeys[authorizationStatus])}
      disableScrollIntoView
    >
      <Flex flexDirection="column" gap={8}>
        <Components.Text>{t(alertDescriptionKeys[authorizationStatus])}</Components.Text>
        <div>
          <Components.Button variant="secondary" type="button" onClick={onChangeStatus}>
            {t('eligibilityAlertChangeStatusCta')}
          </Components.Button>
        </div>
      </Flex>
    </Components.Alert>
  )
}

interface PreparerSectionProps {
  PreparerFields: PreparerFieldGroup
  showRemoveButton: boolean
  showAddButton: boolean
  onAdd: () => void
  onRemove: () => void
}

function PreparerSection({
  PreparerFields,
  showRemoveButton,
  showAddButton,
  onAdd,
  onRemove,
}: PreparerSectionProps) {
  const { t } = useTranslation('Employee.I9SignatureForm')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={12}>
      <Components.Heading as="h3">{t('preparerSectionTitle')}</Components.Heading>

      <PreparerFields.FirstName
        label={t('preparerFirstNameLabel')}
        validationMessages={{ REQUIRED: t('preparerFirstNameError') }}
      />
      <PreparerFields.LastName
        label={t('preparerLastNameLabel')}
        validationMessages={{ REQUIRED: t('preparerLastNameError') }}
      />
      <PreparerFields.Street1
        label={t('preparerStreet1Label')}
        validationMessages={{ REQUIRED: t('preparerStreet1Error') }}
      />
      <PreparerFields.Street2 label={t('preparerStreet2Label')} />
      <PreparerFields.City
        label={t('preparerCityLabel')}
        validationMessages={{ REQUIRED: t('preparerCityError') }}
      />
      <PreparerFields.State
        label={t('preparerStateLabel')}
        placeholder={t('preparerStatePlaceholder')}
        validationMessages={{ REQUIRED: t('preparerStateError') }}
      />
      <PreparerFields.Zip
        label={t('preparerZipLabel')}
        validationMessages={{ REQUIRED: t('preparerZipError') }}
      />
      <PreparerFields.Signature
        label={t('preparerSignatureLabel')}
        description={t('preparerSignatureDescription')}
        validationMessages={{ REQUIRED: t('preparerSignatureError') }}
      />
      <PreparerFields.ConfirmSignature
        label={t('preparerConfirmationLabel')}
        validationMessages={{ REQUIRED: t('preparerConfirmationError') }}
      />

      {(showAddButton || showRemoveButton) && (
        <div className={styles.preparerActions}>
          {showAddButton && (
            <Components.Button type="button" variant="secondary" onClick={onAdd}>
              {t('addPreparerCta')}
            </Components.Button>
          )}
          {showRemoveButton && (
            <Components.Button type="button" variant="error" onClick={onRemove}>
              {t('removePreparerCta')}
            </Components.Button>
          )}
        </div>
      )}
    </Flex>
  )
}
