import { useTranslation } from 'react-i18next'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useIsMutating } from '@tanstack/react-query'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import {
  useEmployeesUpdateOnboardingDocumentsConfigMutation,
  mutationKeyEmployeesUpdateOnboardingDocumentsConfig,
} from '@gusto/embedded-api/react-query/employeesUpdateOnboardingDocumentsConfig'
import styles from './EmployeeDocuments.module.scss'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Flex, CheckboxField, FlexItem } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

const EMPLOYEE_DOCUMENTS_FORM_ID = 'gusto-sdk-employee-documents-form'

const EmployeeDocumentsSchema = z.object({
  includeI9: z.boolean(),
})

type EmployeeDocumentsFormValues = z.infer<typeof EmployeeDocumentsSchema>

interface EmployeeDocumentsProps extends BaseComponentInterface<'Employee.EmployeeDocuments'> {
  employeeId: string
  isSelfOnboarding: boolean
  onEvent: OnEventType<EventType, unknown>
}

export function EmployeeDocuments(props: EmployeeDocumentsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ employeeId, isSelfOnboarding, dictionary }: EmployeeDocumentsProps) {
  useComponentDictionary('Employee.EmployeeDocuments', dictionary)
  useI18n('Employee.EmployeeDocuments')
  const { t } = useTranslation('Employee.EmployeeDocuments')
  const { Alert, Heading, Text } = useComponentContext()
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = useEmployeesGetSuspense({ employeeId })
  const employee = data.employee
  const currentI9Status = employee?.onboardingDocumentsConfig?.i9Document ?? false

  const { mutateAsync: updateOnboardingDocumentsConfig } =
    useEmployeesUpdateOnboardingDocumentsConfigMutation()

  const formMethods = useForm<EmployeeDocumentsFormValues>({
    resolver: zodResolver(EmployeeDocumentsSchema),
    defaultValues: {
      includeI9: currentI9Status,
    },
  })

  const includeI9 = formMethods.watch('includeI9')

  const onSubmit = async (formData: EmployeeDocumentsFormValues) => {
    await baseSubmitHandler(formData, async () => {
      const response = await updateOnboardingDocumentsConfig({
        request: {
          employeeId,
          requestBody: {
            i9Document: formData.includeI9,
          },
        },
      })

      onEvent(componentEvents.EMPLOYEE_ONBOARDING_DOCUMENTS_CONFIG_UPDATED, response)
    })
  }

  const renderSelfOnboarding = () => (
    <>
      <Heading as="h2">{t('selfOnboarding.withI9.title')}</Heading>

      <Text>{t('selfOnboarding.withI9.description')}</Text>

      <FormProvider {...formMethods}>
        <Form id={EMPLOYEE_DOCUMENTS_FORM_ID} onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Flex flexDirection="column" gap={16}>
            <div className={styles.documentsSection}>
              <Text weight="medium">{t('selfOnboarding.withI9.documentsIncluded')}</Text>
              <ul className={styles.documentList}>
                <li>
                  <Text>{t('selfOnboarding.withI9.documents.taxWithholding')}</Text>
                </li>
                <li>
                  <Text>{t('selfOnboarding.withI9.documents.federalWithholding')}</Text>
                </li>
                <li>
                  <Text>{t('selfOnboarding.withI9.documents.directDeposit')}</Text>
                </li>
              </ul>
            </div>

            <div className={styles.i9Section}>
              <CheckboxField
                name="includeI9"
                label={t('selfOnboarding.withI9.fields.includeI9.label')}
              />

              {includeI9 ? (
                <Alert status="info" label={t('selfOnboarding.withI9.alert.included.title')}>
                  {t('selfOnboarding.withI9.alert.included.description')}
                </Alert>
              ) : (
                <Alert status="warning" label={t('selfOnboarding.withI9.alert.notIncluded.title')}>
                  {t('selfOnboarding.withI9.alert.notIncluded.description')}
                </Alert>
              )}
            </div>
          </Flex>
        </Form>
      </FormProvider>
    </>
  )

  const renderNotSelfOnboarding = () => (
    <Flex flexDirection="column" gap={16}>
      <FlexItem>
        <Heading as="h2">{t('notSelfOnboarding.title')}</Heading>
        <Text>{t('notSelfOnboarding.description')}</Text>
      </FlexItem>

      <FlexItem>
        <Text weight="medium">{t('notSelfOnboarding.requirements.employmentEligibility')}</Text>
        <Text>{t('notSelfOnboarding.requirements.employmentEligibilityDescription')}</Text>
      </FlexItem>

      <FlexItem>
        <Text weight="medium">{t('notSelfOnboarding.requirements.taxWithholding')}</Text>
        <Text>{t('notSelfOnboarding.requirements.taxWithholdingDescription')}</Text>
      </FlexItem>

      <FlexItem>
        <Text weight="medium">{t('notSelfOnboarding.requirements.directDeposit')}</Text>
        <Text>{t('notSelfOnboarding.requirements.directDepositDescription')}</Text>
      </FlexItem>

      <Alert status="info" label={t('notSelfOnboarding.alert.title')} disableScrollIntoView></Alert>
    </Flex>
  )

  const renderContent = () => {
    if (!isSelfOnboarding) {
      return renderNotSelfOnboarding()
    }

    return renderSelfOnboarding()
  }

  return (
    <div className={styles.root}>
      <Flex flexDirection="column" gap={16}>
        {renderContent()}
      </Flex>
    </div>
  )
}

const Footer = ({
  isSelfOnboarding,
  onEvent,
}: {
  isSelfOnboarding: boolean
  onEvent: OnEventType<EventType, unknown>
}) => {
  useI18n('Employee.EmployeeDocuments')
  const { t } = useTranslation('Employee.EmployeeDocuments')
  const { Button } = useComponentContext()

  const isMutating = useIsMutating({
    mutationKey: mutationKeyEmployeesUpdateOnboardingDocumentsConfig(),
  })
  const isPending = isMutating > 0

  const handleContinue = () => {
    onEvent(componentEvents.EMPLOYEE_DOCUMENTS_CONTINUE)
  }

  if (!isSelfOnboarding) {
    return (
      <Flex justifyContent="flex-end" gap={12}>
        <Button variant="primary" onClick={handleContinue}>
          {t('cta.continue')}
        </Button>
      </Flex>
    )
  }

  return (
    <Flex justifyContent="flex-end" gap={12}>
      <Button
        variant="primary"
        type="submit"
        form={EMPLOYEE_DOCUMENTS_FORM_ID}
        isLoading={isPending}
        onClick={handleContinue}
      >
        {t('cta.continue')}
      </Button>
    </Flex>
  )
}

EmployeeDocuments.Footer = Footer
