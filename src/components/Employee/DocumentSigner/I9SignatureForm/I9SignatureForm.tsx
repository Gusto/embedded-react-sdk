import { useTranslation, Trans } from 'react-i18next'
import { FormProvider } from 'react-hook-form'
import type { AuthorizationStatus } from '@gusto/embedded-api/models/components/i9authorization'
import { useI9VerificationGetAuthorization } from '@gusto/embedded-api/react-query/i9VerificationGetAuthorization'
import { useSignEmployeeForm } from '../shared/useSignEmployeeForm'
import { PREPARERS_BY_INDEX } from '../shared/useSignEmployeeForm/signEmployeeFormSchema'
import styles from './I9SignatureForm.module.scss'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents, STATES_ABBR } from '@/shared/constants'
import {
  ActionsLayout,
  CheckboxField,
  Flex,
  RadioGroupField,
  SelectField,
  TextInputField,
} from '@/components/Common'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { Form } from '@/components/Common/Form'
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
    return null
  }

  const { form, pdfUrl } = hookResult.data
  const { isPending } = hookResult.status
  const { formMethods } = hookResult.form.hookFormInternals
  const preparerCount = hookResult.form.preparers?.count ?? 0
  const canAddPreparer = hookResult.form.preparers?.canAdd ?? false

  const handleBack = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleChangeEligibility = () => {
    onEvent(componentEvents.EMPLOYEE_CHANGE_ELIGIBILITY_STATUS)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await hookResult.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_SIGN_FORM, result.data)
    }
  }

  const handlePreparerChange = (value: string) => {
    if (value === 'yes' && preparerCount === 0) {
      hookResult.actions.addPreparer?.()
    }
    if (value === 'no' && preparerCount > 0) {
      for (let i = preparerCount; i > 0; i--) {
        hookResult.actions.removePreparer?.()
      }
    }
  }

  const handleAddPreparer = () => {
    hookResult.actions.addPreparer?.()
  }

  const handleRemovePreparer = (index: number) => {
    hookResult.actions.removePreparer?.()
  }

  const usedPreparer = formMethods.watch('usedPreparer')

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={handleFormSubmit}>
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
              <TextInputField
                name="signature"
                label={t('signatureLabel')}
                description={t('signatureDescription')}
                errorMessage={t('signatureError')}
                isRequired
              />
              <CheckboxField
                name="confirmSignature"
                isRequired
                label={t('confirmationLabel')}
                errorMessage={t('confirmationError')}
              />
            </Flex>

            <PreparerSection
              usedPreparer={usedPreparer}
              preparerCount={preparerCount}
              canAddPreparer={canAddPreparer}
              onPreparerChange={handlePreparerChange}
              onAddPreparer={handleAddPreparer}
              onRemovePreparer={handleRemovePreparer}
            />

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
      </FormProvider>
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
  usedPreparer: string | undefined
  preparerCount: number
  canAddPreparer: boolean
  onPreparerChange: (value: string) => void
  onAddPreparer: () => void
  onRemovePreparer: (index: number) => void
}

function PreparerSection({
  usedPreparer,
  preparerCount,
  canAddPreparer,
  onPreparerChange,
  onAddPreparer,
  onRemovePreparer,
}: PreparerSectionProps) {
  const { t } = useTranslation('Employee.I9SignatureForm')
  const Components = useComponentContext()

  const stateOptions = STATES_ABBR.map(abbr => ({ label: abbr, value: abbr }))

  return (
    <Flex flexDirection="column" gap={20}>
      <RadioGroupField
        name="usedPreparer"
        label={t('preparerQuestion')}
        isRequired
        options={[
          { label: t('preparerNo'), value: 'no' },
          { label: t('preparerYes'), value: 'yes' },
        ]}
        onChange={onPreparerChange}
      />

      {usedPreparer === 'yes' &&
        Array.from({ length: preparerCount }, (_, index) => {
          const preparer = PREPARERS_BY_INDEX[index]
          if (!preparer) return null
          return (
            <Flex flexDirection="column" gap={0} key={index}>
              <div className={styles.preparerAlert}>
                <Components.Alert label={t('preparerNote')} status="info" disableScrollIntoView />
              </div>
              <PreparerFields
                preparer={preparer}
                index={index}
                onRemove={() => { onRemovePreparer(index); }}
                showRemoveButton={index !== 0}
                showAddButton={canAddPreparer && index === preparerCount - 1}
                onAdd={onAddPreparer}
                stateOptions={stateOptions}
              />
            </Flex>
          )
        })}
    </Flex>
  )
}

interface PreparerFieldsProps {
  preparer: (typeof PREPARERS_BY_INDEX)[number]
  index: number
  onRemove: () => void
  showRemoveButton: boolean
  showAddButton: boolean
  onAdd: () => void
  stateOptions: Array<{ label: string; value: string }>
}

function PreparerFields({
  preparer,
  onRemove,
  showRemoveButton,
  showAddButton,
  onAdd,
  stateOptions,
}: PreparerFieldsProps) {
  const { t } = useTranslation('Employee.I9SignatureForm')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={12}>
      <Components.Heading as="h3">{t('preparerSectionTitle')}</Components.Heading>

      <TextInputField
        name={preparer.firstName}
        label={t('preparerFirstNameLabel')}
        errorMessage={t('preparerFirstNameError')}
        isRequired
      />
      <TextInputField
        name={preparer.lastName}
        label={t('preparerLastNameLabel')}
        errorMessage={t('preparerLastNameError')}
        isRequired
      />
      <TextInputField
        name={preparer.street1}
        label={t('preparerStreet1Label')}
        errorMessage={t('preparerStreet1Error')}
        isRequired
      />
      <TextInputField name={preparer.street2} label={t('preparerStreet2Label')} />
      <TextInputField
        name={preparer.city}
        label={t('preparerCityLabel')}
        errorMessage={t('preparerCityError')}
        isRequired
      />
      <SelectField
        name={preparer.state}
        label={t('preparerStateLabel')}
        errorMessage={t('preparerStateError')}
        isRequired
        options={stateOptions}
        placeholder="Select a state..."
      />
      <TextInputField
        name={preparer.zip}
        label={t('preparerZipLabel')}
        errorMessage={t('preparerZipError')}
        isRequired
      />
      <TextInputField
        name={preparer.signature}
        label={t('preparerSignatureLabel')}
        description={t('preparerSignatureDescription')}
        errorMessage={t('preparerSignatureError')}
        isRequired
      />
      <CheckboxField
        name={preparer.agree}
        isRequired
        label={t('preparerConfirmationLabel')}
        errorMessage={t('preparerConfirmationError')}
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
