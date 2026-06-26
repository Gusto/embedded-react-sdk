import { Trans, useTranslation } from 'react-i18next'
import { useWatch } from 'react-hook-form'
import {
  useContractorSignatureForm,
  AGREE_FIELD,
  LLC_CLASSIFICATION_FIELD,
  LLC_CLASSIFICATION_OPTION,
  OTHER_CLASSIFICATION_OPTION,
  OTHER_TEXT_FIELD,
  TAX_CLASSIFICATION_FIELD,
  type ContractorSignatureSection,
  type UseContractorSignatureFormReady,
} from './useContractorSignatureForm'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent, BaseLayout } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { ActionsLayout, Flex } from '@/components/Common'
import { Form as FormLayout } from '@/components/Common/Form'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { contractorEvents, componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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

  const { document, pdfUrl, sections, hasFields } = hookResult.data
  const { isPending } = hookResult.status

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
            <section>
              <Flex flexDirection="column" gap={4}>
                <Components.Heading as="h2">
                  {document.title ?? t('signatureRequired')}
                </Components.Heading>
                <Components.Text variant="supporting">{t('instructions')}</Components.Text>
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
            </section>

            <DocumentViewer
              url={pdfUrl ?? undefined}
              title={document.title}
              viewDocumentLabel={t('viewDocumentCta')}
            />

            {sections.map(section => (
              <SectionFields key={section.section} section={section} hookResult={hookResult} />
            ))}

            <AgreeField hookResult={hookResult} />

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

interface SectionFieldsProps {
  section: ContractorSignatureSection
  hookResult: UseContractorSignatureFormReady
}

function SectionFields({ section, hookResult }: SectionFieldsProps) {
  const { t } = useTranslation('Contractor.SignatureForm')
  const Components = useComponentContext()
  const { Fields } = hookResult.form
  const copy = useSignatureFormCopy()

  const classification = useWatch({
    control: hookResult.form.hookFormInternals.formMethods.control,
    name: TAX_CLASSIFICATION_FIELD,
  })

  const isFieldVisible = (name: string): boolean => {
    if (name === LLC_CLASSIFICATION_FIELD) return classification === LLC_CLASSIFICATION_OPTION
    if (name === OTHER_TEXT_FIELD) return classification === OTHER_CLASSIFICATION_OPTION
    return true
  }

  const requiredMessages = {
    REQUIRED: t('validation.required'),
    AGREE_REQUIRED: t('validation.agreeRequired'),
  }

  return (
    <Flex flexDirection="column" gap={16}>
      {section.section !== 'classification' && (
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h3">{copy.sectionHeadings[section.section]}</Components.Heading>
          <Components.Text variant="supporting">
            {copy.sectionInstructions[section.section]}
          </Components.Text>
          {section.section === 'tin' && (
            <Components.Text variant="supporting">
              {t('sectionInstructions.tinSecondary')}
            </Components.Text>
          )}
        </Flex>
      )}

      {section.section === 'certification' && <CertificationDeclaration />}

      {section.fieldNames.filter(isFieldVisible).map(name => {
        const Field = Fields[name]
        if (!Field) return null

        const isClassification = name === TAX_CLASSIFICATION_FIELD
        const isLlc = name === LLC_CLASSIFICATION_FIELD
        const redactedPlaceholder = hookResult.form.fieldsMetadata[name]?.placeholder

        return (
          <Field
            key={name}
            label={copy.fieldLabels[name] ?? name}
            description={copy.fieldDescriptions[name] || undefined}
            validationMessages={requiredMessages}
            placeholder={isLlc ? copy.llcPlaceholder : redactedPlaceholder}
            getOptionLabel={
              isClassification
                ? value => copy.taxClassificationOptions[value] ?? value
                : isLlc
                  ? value => copy.llcClassificationOptions[value] ?? value
                  : undefined
            }
          />
        )
      })}
    </Flex>
  )
}

function CertificationDeclaration() {
  const { t } = useTranslation('Contractor.SignatureForm')
  const Components = useComponentContext()
  const points = Object.values(t('certificationPoints', { returnObjects: true }))

  return (
    <Flex flexDirection="column" gap={8}>
      <Components.Text>{t('certificationIntro')}</Components.Text>
      <ol>
        {points.map((point, index) => (
          <li key={index}>
            <Components.Text>{point}</Components.Text>
          </li>
        ))}
      </ol>
    </Flex>
  )
}

/**
 * Resolves the W-9 signing form copy into lookup maps keyed by field name and
 * option value. Each entry uses a static translation key so the typed `t`
 * surface stays sound while still allowing dynamic, API-driven field lists.
 */
function useSignatureFormCopy() {
  const { t } = useTranslation('Contractor.SignatureForm')

  const fieldLabels: Record<string, string> = {
    name: t('fields.name.label'),
    business_name: t('fields.business_name.label'),
    taxClassification: t('fields.taxClassification.label'),
    llcClassificationCode: t('fields.llcClassificationCode.label'),
    other_text: t('fields.other_text.label'),
    foreign_partners: t('fields.foreign_partners.label'),
    exempt_payee_code: t('fields.exempt_payee_code.label'),
    exemption_from_FATCA: t('fields.exemption_from_FATCA.label'),
    home_address_street_1: t('fields.home_address_street_1.label'),
    home_address_street_2: t('fields.home_address_street_2.label'),
    home_address_city: t('fields.home_address_city.label'),
    home_address_state: t('fields.home_address_state.label'),
    home_address_zip: t('fields.home_address_zip.label'),
    account_number: t('fields.account_number.label'),
    company_name: t('fields.company_name.label'),
    ssn: t('fields.ssn.label'),
    ein: t('fields.ein.label'),
    signature_text: t('fields.signature_text.label'),
  }

  const fieldDescriptions: Record<string, string> = {
    name: t('fields.name.description'),
    business_name: t('fields.business_name.description'),
    taxClassification: t('fields.taxClassification.description'),
    llcClassificationCode: t('fields.llcClassificationCode.description'),
    foreign_partners: t('fields.foreign_partners.description'),
    exemption_from_FATCA: t('fields.exemption_from_FATCA.description'),
  }

  const sectionHeadings: Record<string, string> = {
    exemptions: t('sections.exemptions'),
    address: t('sections.address'),
    tin: t('sections.tin'),
    certification: t('sections.certification'),
  }

  const sectionInstructions: Record<string, string> = {
    exemptions: t('sectionInstructions.exemptions'),
    address: t('sectionInstructions.address'),
    tin: t('sectionInstructions.tin'),
    certification: t('sectionInstructions.certification'),
  }

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
    fieldLabels,
    fieldDescriptions,
    sectionHeadings,
    sectionInstructions,
    taxClassificationOptions,
    llcClassificationOptions,
    llcPlaceholder: t('options.llcClassificationCode.placeholder'),
  }
}

interface AgreeFieldProps {
  hookResult: UseContractorSignatureFormReady
}

function AgreeField({ hookResult }: AgreeFieldProps) {
  const { t } = useTranslation('Contractor.SignatureForm')
  const Agree = hookResult.form.Fields[AGREE_FIELD]
  if (!Agree) return null

  return (
    <Agree
      label={t('agreeLabel')}
      validationMessages={{
        REQUIRED: t('validation.agreeRequired'),
        AGREE_REQUIRED: t('validation.agreeRequired'),
      }}
    />
  )
}
