import { z } from 'zod'
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation, Trans } from 'react-i18next'
import { useEmployeeFormsGetPdfSuspense } from '@gusto/embedded-api/react-query/employeeFormsGetPdf'
import { useEmployeeFormsSignMutation } from '@gusto/embedded-api/react-query/employeeFormsSign'
import { useEmployeeFormsGetSuspense } from '@gusto/embedded-api/react-query/employeeFormsGet'
import { useI9VerificationGetAuthorization } from '@gusto/embedded-api/react-query/i9VerificationGetAuthorization'
import type { AuthorizationStatus } from '@gusto/embedded-api/models/components/i9authorization'
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

const MAX_PREPARERS = 4

const preparerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  signature: z.string().min(1),
  agree: z.boolean().refine(val => val),
})

export type PreparerInputs = z.infer<typeof preparerSchema>

const i9SignatureFormSchema = z.object({
  signature: z.string().min(1),
  agree: z.literal(true),
  usedPreparer: z.enum(['yes', 'no']),
  preparers: z.array(preparerSchema),
})

export type I9SignatureFormInputs = z.infer<typeof i9SignatureFormSchema>

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
  const { onEvent, baseSubmitHandler } = useBase()
  const Components = useComponentContext()

  const { data: formData } = useEmployeeFormsGetSuspense({ employeeId, formId })
  const form = formData.form!

  const {
    data: { formPdf },
  } = useEmployeeFormsGetPdfSuspense({ employeeId, formId: form.uuid })
  const pdfUrl = formPdf?.documentUrl

  const { data: i9AuthData } = useI9VerificationGetAuthorization({ employeeId })
  const authorizationStatus = i9AuthData?.i9Authorization?.authorizationStatus

  const { mutateAsync: signForm, isPending } = useEmployeeFormsSignMutation()

  const methods = useForm<I9SignatureFormInputs>({
    resolver: zodResolver(i9SignatureFormSchema),
    defaultValues: {
      signature: '',
      usedPreparer: 'no',
      preparers: [],
    },
  })

  const handleBack = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleChangeEligibility = () => {
    onEvent(componentEvents.EMPLOYEE_CHANGE_ELIGIBILITY_STATUS)
  }

  const handleSubmit = async (data: I9SignatureFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      const preparerPayload = buildPreparerPayload(payload)
      const { form: signFormResult } = await signForm({
        request: {
          employeeId,
          formId: form.uuid,
          requestBody: {
            signatureText: payload.signature,
            agree: payload.agree,
            ...preparerPayload,
          },
        },
      })
      onEvent(componentEvents.EMPLOYEE_SIGN_FORM, signFormResult)
    })
  }

  return (
    <section className={className}>
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(handleSubmit)}>
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
                name="agree"
                isRequired
                label={t('confirmationLabel')}
                errorMessage={t('confirmationError')}
              />
            </Flex>

            <PreparerSection />

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

const emptyPreparer = {
  firstName: '',
  lastName: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  signature: '',
  agree: false,
}

function PreparerSection() {
  const { t } = useTranslation('Employee.I9SignatureForm')
  const Components = useComponentContext()
  const { watch, control } = useFormContext<I9SignatureFormInputs>()
  const { fields, append, remove } = useFieldArray({ control, name: 'preparers' })

  const usedPreparer = watch('usedPreparer')
  const canAddPreparer = fields.length < MAX_PREPARERS

  const handlePreparerChange = (value: string) => {
    if (value === 'yes' && fields.length === 0) {
      append(emptyPreparer)
    }
    if (value === 'no' && fields.length > 0) {
      remove()
    }
  }

  const handleAddPreparer = () => {
    if (canAddPreparer) {
      append(emptyPreparer)
    }
  }

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
        onChange={handlePreparerChange}
      />

      {usedPreparer === 'yes' &&
        fields.map((field, index) => (
          <Flex flexDirection="column" gap={0} key={field.id}>
            <div className={styles.preparerAlert}>
              <Components.Alert label={t('preparerNote')} status="info" disableScrollIntoView />
            </div>
            <PreparerFields
              index={index}
              onRemove={() => {
                remove(index)
              }}
              showRemoveButton={index !== 0}
              showAddButton={canAddPreparer && index === fields.length - 1}
              onAdd={handleAddPreparer}
            />
          </Flex>
        ))}
    </Flex>
  )
}

interface PreparerFieldsProps {
  index: number
  onRemove: () => void
  showRemoveButton: boolean
  showAddButton: boolean
  onAdd: () => void
}

function PreparerFields({
  index,
  onRemove,
  showRemoveButton,
  showAddButton,
  onAdd,
}: PreparerFieldsProps) {
  const { t } = useTranslation('Employee.I9SignatureForm')
  const Components = useComponentContext()

  const stateOptions = STATES_ABBR.map(abbr => ({ label: abbr, value: abbr }))
  const fieldId = `preparers.${index}`

  return (
    <Flex flexDirection="column" gap={12}>
      <Components.Heading as="h3">{t('preparerSectionTitle')}</Components.Heading>

      <TextInputField
        name={`${fieldId}.firstName`}
        label={t('preparerFirstNameLabel')}
        errorMessage={t('preparerFirstNameError')}
        isRequired
      />
      <TextInputField
        name={`${fieldId}.lastName`}
        label={t('preparerLastNameLabel')}
        errorMessage={t('preparerLastNameError')}
        isRequired
      />
      <TextInputField
        name={`${fieldId}.street1`}
        label={t('preparerStreet1Label')}
        errorMessage={t('preparerStreet1Error')}
        isRequired
      />
      <TextInputField name={`${fieldId}.street2`} label={t('preparerStreet2Label')} />
      <TextInputField
        name={`${fieldId}.city`}
        label={t('preparerCityLabel')}
        errorMessage={t('preparerCityError')}
        isRequired
      />
      <SelectField
        name={`${fieldId}.state`}
        label={t('preparerStateLabel')}
        errorMessage={t('preparerStateError')}
        isRequired
        options={stateOptions}
        placeholder="Select a state..."
      />
      <TextInputField
        name={`${fieldId}.zip`}
        label={t('preparerZipLabel')}
        errorMessage={t('preparerZipError')}
        isRequired
      />
      <TextInputField
        name={`${fieldId}.signature`}
        label={t('preparerSignatureLabel')}
        description={t('preparerSignatureDescription')}
        errorMessage={t('preparerSignatureError')}
        isRequired
      />
      <CheckboxField
        name={`${fieldId}.agree`}
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

function buildPreparerPayload(payload: I9SignatureFormInputs) {
  if (payload.usedPreparer !== 'yes' || payload.preparers.length === 0) {
    return { preparer: false }
  }

  const result: Record<string, unknown> = { preparer: true }

  payload.preparers.forEach((preparer, index) => {
    const prefix = index === 0 ? 'preparer' : `preparer${index + 1}`
    if (index > 0) {
      result[`preparer${index + 1}`] = true
    }
    result[`${prefix}FirstName`] = preparer.firstName
    result[`${prefix}LastName`] = preparer.lastName
    result[`${prefix}Street1`] = preparer.street1
    if (preparer.street2) result[`${prefix}Street2`] = preparer.street2
    result[`${prefix}City`] = preparer.city
    result[`${prefix}State`] = preparer.state
    result[`${prefix}Zip`] = preparer.zip
    result[`${prefix}Agree`] = 'true'
  })

  return result
}
