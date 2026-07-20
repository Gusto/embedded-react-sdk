import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  useContractorSignatureForm,
  type UseContractorSignatureFormReady,
} from './useContractorSignatureForm'
import styles from './SignatureForm.module.scss'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent, BaseLayout } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { ActionsLayout, Flex } from '@/components/Common'
import { Form as FormLayout } from '@/components/Common/Form'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { contractorEvents, componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** IRS instructions page for completing Form W-9. */
const W9_INSTRUCTIONS_URL = 'https://www.irs.gov/forms-pubs/about-form-w-9'

/**
 * Props for {@link SignatureForm}.
 *
 * @public
 */
export interface SignatureFormProps extends BaseComponentInterface<'Contractor.SignatureForm'> {
  /** The UUID of the contractor document to sign. */
  documentUuid: string
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Standalone form for signing an individual contractor document (W-9).
 *
 * @remarks
 * Lower-level building block used internally by `ContractorDocumentSigner` for
 * its signing view. Use this component directly when you need full control over
 * navigation between the document list and the signature form.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/documents/sign` | Fired when the document is successfully signed | The signed document |
 * | `CANCEL` | Fired when the user navigates back from the signature form | — |
 *
 * @param props - See {@link SignatureFormProps}.
 * @returns The rendered signature form.
 * @public
 */
export function SignatureForm(props: SignatureFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ documentUuid, dictionary }: SignatureFormProps) {
  useComponentDictionary('Contractor.SignatureForm', dictionary)
  useI18n('Contractor.SignatureForm')
  const { t } = useTranslation('Contractor.SignatureForm')
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const hookResult = useContractorSignatureForm({ documentUuid })

  if (hookResult.isLoading) {
    return <BaseLayout isLoading error={hookResult.errorHandling.errors} />
  }

  const { document, pdfUrl, hasFields } = hookResult.data
  const { isPending } = hookResult.status
  const { Agree } = hookResult.form.Fields

  const handleFormSubmit = async () => {
    const result = await hookResult.actions.onSubmit()
    if (result) {
      onEvent(contractorEvents.CONTRACTOR_SIGN_DOCUMENT, result.data)
    }
  }

  const handleBack = () => {
    onEvent(componentEvents.CANCEL)
  }

  return (
    <BaseLayout error={hookResult.errorHandling.errors}>
      <SDKFormProvider formHookResult={hookResult}>
        <FormLayout onSubmit={handleFormSubmit}>
          <Flex flexDirection="column" gap={32} alignItems="stretch">
            <Flex flexDirection="column" gap={4}>
              <Components.Heading as="h2">
                {document.title ?? t('signatureRequired')}
              </Components.Heading>
              <Components.Text variant="supporting">
                <Components.Link
                  href={W9_INSTRUCTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('instructions')}
                </Components.Link>
              </Components.Text>
              {pdfUrl && (
                <Components.Text variant="supporting">
                  <Trans
                    t={t}
                    i18nKey="downloadPrompt"
                    components={{
                      downloadLink: (
                        <Components.Link
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`${document.title || 'document'}.pdf`}
                        />
                      ),
                    }}
                  />
                </Components.Text>
              )}
            </Flex>

            {hasFields ? (
              <W9Fields hookResult={hookResult} />
            ) : (
              <Agree
                label={t('agreeLabel')}
                validationMessages={{ AGREE_REQUIRED: t('validation.agreeRequired') }}
              />
            )}

            <ActionsLayout>
              <Components.Button variant="secondary" type="button" onClick={handleBack}>
                {t('backCta')}
              </Components.Button>
              <Components.Button type="submit" isDisabled={isPending}>
                {hasFields
                  ? isPending
                    ? t('signingCta')
                    : t('signCta')
                  : isPending
                    ? t('acknowledgingCta')
                    : t('acknowledgeCta')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </FormLayout>
      </SDKFormProvider>
    </BaseLayout>
  )
}

interface W9FieldsProps {
  hookResult: UseContractorSignatureFormReady
}

function W9Fields({ hookResult }: W9FieldsProps) {
  const { t } = useTranslation('Contractor.SignatureForm')
  const Components = useComponentContext()
  const { Fields, fieldsMetadata } = hookResult.form
  const copy = useSignatureFormCopy()

  // A TIN already on file is shown masked and locked until the signer opts to
  // replace it; nothing on file starts editable. Editing reveals the empty input
  // so an untouched value is omitted on submit and the server keeps the real TIN.
  const [isEditingSsn, setIsEditingSsn] = useState(!fieldsMetadata.ssn.hasRedactedValue)
  const [isEditingEin, setIsEditingEin] = useState(!fieldsMetadata.ein.hasRedactedValue)

  const requiredMessages = {
    REQUIRED: t('validation.required'),
  }

  return (
    <>
      {/* Classification */}
      <Components.Box>
        <Flex flexDirection="column" gap={16}>
          {Fields.Name && (
            <Fields.Name
              label={t('fields.name.label')}
              description={t('fields.name.description')}
              validationMessages={requiredMessages}
            />
          )}
          {Fields.BusinessName && (
            <Fields.BusinessName
              label={t('fields.business_name.label')}
              description={t('fields.business_name.description')}
              validationMessages={requiredMessages}
            />
          )}
          {Fields.TaxClassification && (
            <Fields.TaxClassification
              label={t('fields.taxClassification.label')}
              description={t('fields.taxClassification.description')}
              validationMessages={requiredMessages}
              getOptionLabel={value => copy.taxClassificationOptions[value] ?? value}
            />
          )}
          {Fields.LlcClassificationCode && (
            <Fields.LlcClassificationCode
              label={t('fields.llcClassificationCode.label')}
              description={t('fields.llcClassificationCode.description')}
              validationMessages={requiredMessages}
              placeholder={copy.llcPlaceholder}
              getOptionLabel={value => copy.llcClassificationOptions[value] ?? value}
            />
          )}
          {Fields.OtherText && (
            <Fields.OtherText
              label={t('fields.other_text.label')}
              validationMessages={requiredMessages}
            />
          )}
          {Fields.ForeignPartners && (
            <Fields.ForeignPartners
              label={t('fields.foreign_partners.label')}
              description={t('fields.foreign_partners.description')}
            />
          )}
        </Flex>
      </Components.Box>

      {/* Exemptions */}
      {(Fields.ExemptPayeeCode || Fields.ExemptionFromFatca) && (
        <Components.Box
          header={
            <Flex flexDirection="column" gap={2}>
              <Components.Heading as="h3">{t('sections.exemptions')}</Components.Heading>
              <Components.Text variant="supporting">
                {t('sectionInstructions.exemptions')}
              </Components.Text>
            </Flex>
          }
        >
          <Flex flexDirection="column" gap={16}>
            {Fields.ExemptPayeeCode && (
              <Fields.ExemptPayeeCode
                label={t('fields.exempt_payee_code.label')}
                validationMessages={requiredMessages}
              />
            )}
            {Fields.ExemptionFromFatca && (
              <Fields.ExemptionFromFatca
                label={t('fields.exemption_from_FATCA.label')}
                description={t('fields.exemption_from_FATCA.description')}
                validationMessages={requiredMessages}
              />
            )}
          </Flex>
        </Components.Box>
      )}

      {/* Address */}
      <Components.Box
        header={
          <Flex flexDirection="column" gap={2}>
            <Components.Heading as="h3">{t('sections.address')}</Components.Heading>
            <Components.Text variant="supporting">
              {t('sectionInstructions.address')}
            </Components.Text>
          </Flex>
        }
      >
        <Flex flexDirection="column" gap={16}>
          {Fields.HomeAddressStreet1 && (
            <Fields.HomeAddressStreet1
              label={t('fields.home_address_street_1.label')}
              validationMessages={requiredMessages}
            />
          )}
          {Fields.HomeAddressStreet2 && (
            <Fields.HomeAddressStreet2
              label={t('fields.home_address_street_2.label')}
              validationMessages={requiredMessages}
            />
          )}
          {Fields.HomeAddressCity && (
            <Fields.HomeAddressCity
              label={t('fields.home_address_city.label')}
              validationMessages={requiredMessages}
            />
          )}
          {Fields.HomeAddressState && (
            <Fields.HomeAddressState
              label={t('fields.home_address_state.label')}
              validationMessages={requiredMessages}
            />
          )}
          {Fields.HomeAddressZip && (
            <Fields.HomeAddressZip
              label={t('fields.home_address_zip.label')}
              validationMessages={requiredMessages}
            />
          )}
          {Fields.AccountNumber && (
            <Fields.AccountNumber
              label={t('fields.account_number.label')}
              validationMessages={requiredMessages}
            />
          )}
          {Fields.CompanyName && (
            <Fields.CompanyName
              label={t('fields.company_name.label')}
              validationMessages={requiredMessages}
            />
          )}
        </Flex>
      </Components.Box>

      {/* Taxpayer Identification Number */}
      {(Fields.Ssn || Fields.Ein) && (
        <Components.Box
          header={
            <Flex flexDirection="column" gap={2}>
              <Components.Heading as="h3">{t('sections.tin')}</Components.Heading>
              <Components.Text variant="supporting">
                {t('sectionInstructions.tin')} {t('sectionInstructions.tinSecondary')}
              </Components.Text>
            </Flex>
          }
        >
          <Flex flexDirection="column" gap={16}>
            {Fields.Ssn &&
              (fieldsMetadata.ssn.hasRedactedValue && !isEditingSsn ? (
                <MaskedTaxIdField
                  label={t('fields.ssn.label')}
                  maskedValue={fieldsMetadata.ssn.placeholder ?? ''}
                  changeLabel={t('fields.ssn.changeCta')}
                  onChange={() => {
                    setIsEditingSsn(true)
                  }}
                />
              ) : (
                <Fields.Ssn
                  label={t('fields.ssn.label')}
                  validationMessages={{
                    ...requiredMessages,
                    INVALID_SSN: t('validation.invalidSsn'),
                  }}
                />
              ))}
            {Fields.Ein &&
              (fieldsMetadata.ein.hasRedactedValue && !isEditingEin ? (
                <MaskedTaxIdField
                  label={t('fields.ein.label')}
                  maskedValue={fieldsMetadata.ein.placeholder ?? ''}
                  changeLabel={t('fields.ein.changeCta')}
                  onChange={() => {
                    setIsEditingEin(true)
                  }}
                />
              ) : (
                <Fields.Ein
                  label={t('fields.ein.label')}
                  validationMessages={{
                    ...requiredMessages,
                    INVALID_EIN: t('validation.invalidEin'),
                  }}
                />
              ))}
          </Flex>
        </Components.Box>
      )}

      {/* Certification */}
      <Components.Box
        header={
          <Flex flexDirection="column" gap={2}>
            <Components.Heading as="h3">{t('sections.certification')}</Components.Heading>
            <Components.Text variant="supporting">
              {t('sectionInstructions.certification')}
            </Components.Text>
          </Flex>
        }
      >
        <Flex flexDirection="column" gap={16}>
          <CertificationDeclaration />
          {Fields.SignatureText && (
            <Fields.SignatureText
              label={t('fields.signature_text.label')}
              validationMessages={requiredMessages}
            />
          )}
          <Fields.Agree
            label={t('agreeLabel')}
            validationMessages={{ AGREE_REQUIRED: t('validation.agreeRequired') }}
          />
        </Flex>
      </Components.Box>
    </>
  )
}

function CertificationDeclaration() {
  const { t } = useTranslation('Contractor.SignatureForm')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      <Components.Text weight="medium">{t('certificationIntro')}</Components.Text>
      <Flex flexDirection="column" gap={16}>
        <Components.OrderedList
          items={[
            <Components.Text key="taxpayerId">
              {t('certificationPoints.taxpayerId')}
            </Components.Text>,
            <Components.Text key="backupWithholding">
              {t('certificationPoints.backupWithholding')}
            </Components.Text>,
            <Components.Text key="usPerson">{t('certificationPoints.usPerson')}</Components.Text>,
            <Components.Text key="fatca">{t('certificationPoints.fatca')}</Components.Text>,
          ]}
        />
        <Components.Text variant="supporting" size="sm">
          {t('certificationPoints.usPersonDefinition')}
        </Components.Text>
      </Flex>
    </Flex>
  )
}

interface MaskedTaxIdFieldProps {
  /** Visible field label (also the disabled input's hidden accessible label). */
  label: string
  /** The server-provided mask (e.g. `XXX-XX-3123`) shown in the disabled input. */
  maskedValue: string
  /** Text for the button that reveals the editable input (e.g. "Change SSN"). */
  changeLabel: string
  /** Called when the signer opts to replace the value on file. */
  onChange: () => void
}

/**
 * Displays a taxpayer-ID value already on file as a disabled, masked input with
 * a button that reveals an empty editable input in its place. Submitting the
 * mask would stamp it verbatim onto the W-9, so replacing the value must go
 * through an empty input the server can backfill.
 */
function MaskedTaxIdField({ label, maskedValue, changeLabel, onChange }: MaskedTaxIdFieldProps) {
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={4} alignItems="stretch">
      <Components.Text weight="medium" size="sm">
        {label}
      </Components.Text>
      <div className={styles.tinRow}>
        <div className={styles.tinInput}>
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
          className={styles.tinButton}
          onClick={onChange}
        >
          {changeLabel}
        </Components.Button>
      </div>
    </Flex>
  )
}

/**
 * Resolves the W-9 classification option copy into lookup maps keyed by option
 * value. Each entry uses a static translation key so the typed `t` surface stays
 * sound.
 */
function useSignatureFormCopy() {
  const { t } = useTranslation('Contractor.SignatureForm')

  const taxClassificationOptions: Record<string, string> = {
    individual_proprietor: t('options.taxClassification.individual_proprietor'),
    c_corporation: t('options.taxClassification.c_corporation'),
    s_corporation: t('options.taxClassification.s_corporation'),
    partnership: t('options.taxClassification.partnership'),
    trust_estate: t('options.taxClassification.trust_estate'),
    limited_liability_company: t('options.taxClassification.limited_liability_company'),
    other: t('options.taxClassification.other'),
  }

  const llcClassificationOptions: Record<string, string> = {
    c: t('options.llcClassificationCode.c'),
    s: t('options.llcClassificationCode.s'),
    p: t('options.llcClassificationCode.p'),
  }

  return {
    taxClassificationOptions,
    llcClassificationOptions,
    llcPlaceholder: t('options.llcClassificationCode.placeholder'),
  }
}
