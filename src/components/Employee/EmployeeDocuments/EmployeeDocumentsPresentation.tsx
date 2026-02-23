import { Trans, useTranslation } from 'react-i18next'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import styles from './EmployeeDocumentsPresentation.module.scss'
import { Flex, CheckboxField, FlexItem } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const EMPLOYEE_DOCUMENTS_FORM_ID = 'gusto-sdk-employee-documents-form'

const EmployeeDocumentsSchema = z.object({
  includeI9: z.boolean(),
})

export type EmployeeDocumentsFormValues = z.infer<typeof EmployeeDocumentsSchema>

export interface EmployeeDocumentsPresentationProps {
  isSelfOnboarding: boolean
  currentI9Status: boolean
  onSubmit: (formData: EmployeeDocumentsFormValues) => Promise<void>
  onContinue: () => void
  isPending: boolean
}

export const EmployeeDocumentsPresentation = ({
  isSelfOnboarding,
  currentI9Status,
  onSubmit,
  onContinue,
  isPending,
}: EmployeeDocumentsPresentationProps) => {
  useI18n('Employee.EmployeeDocuments')
  const { t } = useTranslation('Employee.EmployeeDocuments')
  const { Alert, Heading, Text, Button, Link, UnorderedList } = useComponentContext()

  const formMethods = useForm<EmployeeDocumentsFormValues>({
    resolver: zodResolver(EmployeeDocumentsSchema),
    defaultValues: {
      includeI9: currentI9Status,
    },
  })

  const includeI9 = formMethods.watch('includeI9')

  const renderSelfOnboarding = () => (
    <FormProvider {...formMethods}>
      <Form id={EMPLOYEE_DOCUMENTS_FORM_ID} onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={16}>
          <FlexItem>
            <Heading as="h2">{t('selfOnboarding.title')}</Heading>
            <Text variant="supporting">{t('selfOnboarding.description')}</Text>
          </FlexItem>

          <Heading as="h3">{t('selfOnboarding.documentsIncludedLabel')}</Heading>
          <FlexItem>
            <Text weight="medium">{t('selfOnboarding.taxWithholdingLabel')}</Text>
            <Text variant="supporting">{t('selfOnboarding.taxWithholdingDescription')}</Text>
          </FlexItem>
          <FlexItem>
            <Text weight="medium">{t('selfOnboarding.directDepositLabel')}</Text>
            <Text variant="supporting">{t('selfOnboarding.directDepositDescription')}</Text>
          </FlexItem>

          <Heading as="h3">{t('selfOnboarding.includeI9Heading')}</Heading>
          <CheckboxField
            name="includeI9"
            label={t('selfOnboarding.includeI9Label')}
            description={t('selfOnboarding.includeI9Description')}
          />

          {includeI9 ? (
            <Alert status="warning" label={t('selfOnboarding.alerts.includedTitle')}>
              <UnorderedList
                items={[
                  t('selfOnboarding.alerts.includedDescription'),
                  t('selfOnboarding.alerts.includedDescription2'),
                ]}
              />
            </Alert>
          ) : (
            <Alert status="info" label={t('selfOnboarding.alerts.notIncludedTitle')}>
              <Trans
                i18nKey={'selfOnboarding.alerts.notIncludedDescription'}
                t={t}
                components={{
                  Link: <Link />,
                }}
              />
            </Alert>
          )}
        </Flex>
      </Form>
    </FormProvider>
  )

  const renderNotSelfOnboarding = () => (
    <Flex flexDirection="column" gap={16}>
      <FlexItem>
        <Heading as="h2">{t('notSelfOnboarding.title')}</Heading>
        <Text>{t('notSelfOnboarding.description')}</Text>
      </FlexItem>

      <FlexItem>
        <Text weight="medium">{t('notSelfOnboarding.employmentEligibilityLabel')}</Text>
        <Text>{t('notSelfOnboarding.employmentEligibilityDescription')}</Text>
      </FlexItem>

      <FlexItem>
        <Text weight="medium">{t('notSelfOnboarding.taxWithholdingLabel')}</Text>
        <Text>{t('notSelfOnboarding.taxWithholdingDescription')}</Text>
      </FlexItem>

      <FlexItem>
        <Text weight="medium">{t('notSelfOnboarding.directDepositLabel')}</Text>
        <Text>{t('notSelfOnboarding.directDepositDescription')}</Text>
      </FlexItem>

      <Alert status="info" label={t('notSelfOnboarding.alertTitle')} disableScrollIntoView></Alert>
    </Flex>
  )

  return (
    <div className={styles.root}>
      <Flex flexDirection="column" gap={16}>
        {isSelfOnboarding ? renderSelfOnboarding() : renderNotSelfOnboarding()}

        <Flex justifyContent="flex-end" gap={12}>
          {isSelfOnboarding ? (
            <Button
              variant="primary"
              type="submit"
              form={EMPLOYEE_DOCUMENTS_FORM_ID}
              isLoading={isPending}
              onClick={onContinue}
            >
              {t('continueCta')}
            </Button>
          ) : (
            <Button variant="primary" onClick={onContinue}>
              {t('continueCta')}
            </Button>
          )}
        </Flex>
      </Flex>
    </div>
  )
}
