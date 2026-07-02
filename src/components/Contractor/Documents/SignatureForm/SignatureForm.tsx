import { Trans, useTranslation } from 'react-i18next'
import {
  useContractorSignatureForm,
  type UseContractorSignatureFormReady,
} from './useContractorSignatureForm'
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

            {hasFields && <W9Fields hookResult={hookResult} />}

            <Agree
              label={t('agreeLabel')}
              validationMessages={{ AGREE_REQUIRED: t('validation.agreeRequired') }}
            />

            <ActionsLayout>
              <Components.Button variant="secondary" type="button" onClick={handleBack}>
                {t('backCta')}
              </Components.Button>
              <Components.Button type="submit" isLoading={isPending}>
                {hasFields ? t('signCta') : t('acknowledgeCta')}
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

  const requiredMessages = {
    REQUIRED: t('validation.required'),
  }

  return (
    <>
      {/* Classification */}
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

      {/* Exemptions */}
      {(Fields.ExemptPayeeCode || Fields.ExemptionFromFatca) && (
        <Flex flexDirection="column" gap={16}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h3">{t('sections.exemptions')}</Components.Heading>
            <Components.Text variant="supporting">
              {t('sectionInstructions.exemptions')}
            </Components.Text>
          </Flex>
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
      )}

      {/* Address */}
      <Flex flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h3">{t('sections.address')}</Components.Heading>
          <Components.Text variant="supporting">{t('sectionInstructions.address')}</Components.Text>
        </Flex>
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

      {/* Taxpayer Identification Number */}
      {(Fields.Ssn || Fields.Ein) && (
        <Flex flexDirection="column" gap={16}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h3">{t('sections.tin')}</Components.Heading>
            <Components.Text variant="supporting">{t('sectionInstructions.tin')}</Components.Text>
            <Components.Text variant="supporting">
              {t('sectionInstructions.tinSecondary')}
            </Components.Text>
          </Flex>
          {Fields.Ssn && (
            <Fields.Ssn
              label={t('fields.ssn.label')}
              validationMessages={{ ...requiredMessages, INVALID_SSN: t('validation.invalidSsn') }}
              placeholder={fieldsMetadata.ssn?.placeholder}
            />
          )}
          {Fields.Ein && (
            <Fields.Ein
              label={t('fields.ein.label')}
              validationMessages={{ ...requiredMessages, INVALID_EIN: t('validation.invalidEin') }}
              placeholder={fieldsMetadata.ein?.placeholder}
            />
          )}
        </Flex>
      )}

      {/* Certification */}
      <Flex flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h3">{t('sections.certification')}</Components.Heading>
          <Components.Text variant="supporting">
            {t('sectionInstructions.certification')}
          </Components.Text>
        </Flex>
        <CertificationDeclaration />
        {Fields.SignatureText && (
          <Fields.SignatureText
            label={t('fields.signature_text.label')}
            validationMessages={requiredMessages}
          />
        )}
      </Flex>
    </>
  )
}

function CertificationDeclaration() {
  const { t } = useTranslation('Contractor.SignatureForm')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      <Components.Text>{t('certificationIntro')}</Components.Text>
      <ol>
        <li>
          <Components.Text>{t('certificationPoints.taxpayerId')}</Components.Text>
        </li>
        <li>
          <Components.Text>{t('certificationPoints.backupWithholding')}</Components.Text>
        </li>
        <li>
          <Components.Text>{t('certificationPoints.usPerson')}</Components.Text>
        </li>
        <li>
          <Components.Text>{t('certificationPoints.fatca')}</Components.Text>
        </li>
      </ol>
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
