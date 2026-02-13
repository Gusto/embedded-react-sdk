import { useTranslation } from 'react-i18next'
import { FormProvider } from 'react-hook-form'
import { useIsMutating } from '@tanstack/react-query'
import { useInformationRequestsGetInformationRequestsSuspense } from '@gusto/embedded-api/react-query/informationRequestsGetInformationRequests'
import { mutationKeyInformationRequestsSubmit } from '@gusto/embedded-api/react-query/informationRequestsSubmit'
import type { RequiredQuestions } from '@gusto/embedded-api/models/components/informationrequest'
import { ResponseType } from '@gusto/embedded-api/models/components/informationrequest'
import type { InformationRequestsContextInterface } from '../InformationRequestsComponents'
import styles from './InformationRequestForm.module.scss'
import {
  useInformationRequestForm,
  INFORMATION_REQUEST_FORM_ID,
  ACCEPTED_FILE_TYPES,
  hasUnsupportedQuestionTypes,
} from './useInformationRequestForm'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Flex, TextInputField } from '@/components/Common'
import { FileInputField } from '@/components/Common/Fields/FileInputField'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { informationRequestEvents, type EventType } from '@/shared/constants'
import { useFlow } from '@/components/Flow/useFlow'

interface InformationRequestFormProps extends BaseComponentInterface<'InformationRequests.InformationRequestForm'> {
  companyId: string
  requestId: string
  onEvent: OnEventType<EventType, unknown>
}

export function InformationRequestForm(props: InformationRequestFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, requestId, dictionary }: InformationRequestFormProps) {
  useComponentDictionary('InformationRequests.InformationRequestForm', dictionary)
  useI18n('InformationRequests.InformationRequestForm')
  const { t } = useTranslation('InformationRequests.InformationRequestForm')
  const { Alert, Heading, Text } = useComponentContext()

  const { data, actions, meta } = useInformationRequestForm({ companyId, requestId })

  const renderQuestion = (question: RequiredQuestions) => {
    if (!question.questionUuid || !question.responseType) return null

    const fieldName = question.questionUuid
    const isDocumentType = question.responseType === ResponseType.Document
    const isTextType = question.responseType === ResponseType.Text

    return (
      <div key={fieldName} className={styles.questionCard}>
        <div className={styles.questionDescription}>
          <Text weight="medium">
            {isDocumentType ? t('questionTypes.document') : t('questionTypes.answer')}
          </Text>
          <Text>{question.questionText}</Text>
        </div>

        <hr className={styles.divider} />

        {isTextType && (
          <div className={styles.textInputWrapper}>
            <TextInputField
              name={fieldName}
              label={t('fields.textAnswer.label')}
              placeholder={t('fields.textAnswer.placeholder')}
              isRequired
              errorMessage={t('validation.required')}
            />
          </div>
        )}

        {isDocumentType && (
          <div className={styles.fileInputWrapper}>
            <FileInputField
              name={fieldName}
              label={t('fields.fileUpload.label')}
              accept={ACCEPTED_FILE_TYPES}
              isRequired
              errorMessage={t('validation.required')}
            />
          </div>
        )}
      </div>
    )
  }

  const unsupportedPlaceholder = (
    <div className={styles.questionCard}>
      <div className={styles.questionDescription}>
        <Text weight="medium">
          {t(meta.hasPersonaType ? 'unsupported.persona.title' : 'unsupported.generic.title')}
        </Text>
        <Text>
          {t(
            meta.hasPersonaType
              ? 'unsupported.persona.description'
              : 'unsupported.generic.description',
          )}
        </Text>
      </div>

      <hr className={styles.divider} />

      <div className={styles.contactSupport}>
        <Text variant="supporting">{t('unsupported.contactSupport')}</Text>
      </div>
    </div>
  )

  return (
    <div className={styles.root}>
      <Flex flexDirection="column" gap={16}>
        <Heading as="h2">{t('title')}</Heading>

        {meta.isBlockingPayroll && (
          <Alert status="error" label={t('blockingAlert.title')} disableScrollIntoView>
            {t('blockingAlert.description')}
          </Alert>
        )}

        {meta.hasUnsupportedTypes ? (
          unsupportedPlaceholder
        ) : (
          <FormProvider {...meta.formMethods}>
            <Form
              id={INFORMATION_REQUEST_FORM_ID}
              onSubmit={meta.formMethods.handleSubmit(actions.onSubmit)}
            >
              <Flex flexDirection="column" gap={16}>
                {data.requiredQuestions.map(renderQuestion)}
              </Flex>
            </Form>
          </FormProvider>
        )}
      </Flex>
    </div>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('InformationRequests.InformationRequestForm')
  const { t } = useTranslation('InformationRequests.InformationRequestForm')
  const { Button } = useComponentContext()
  const { companyId, selectedRequestId } = useFlow<InformationRequestsContextInterface>()

  const { data } = useInformationRequestsGetInformationRequestsSuspense({
    companyUuid: companyId,
  })

  const informationRequest = data.informationRequestList?.find(
    req => req.uuid === selectedRequestId,
  )
  const requiredQuestions = informationRequest?.requiredQuestions ?? []
  const hasUnsupportedTypes = hasUnsupportedQuestionTypes(requiredQuestions)

  const isMutating = useIsMutating({
    mutationKey: mutationKeyInformationRequestsSubmit(),
  })
  const isPending = isMutating > 0

  const handleCancel = () => {
    onEvent(informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL)
  }

  if (hasUnsupportedTypes) {
    return (
      <Flex justifyContent="flex-end" gap={12}>
        <Button variant="secondary" onClick={handleCancel}>
          {t('cta.close')}
        </Button>
      </Flex>
    )
  }

  return (
    <Flex justifyContent="flex-end" gap={12}>
      <Button variant="secondary" onClick={handleCancel} isDisabled={isPending}>
        {t('cta.cancel')}
      </Button>
      <Button
        variant="primary"
        type="submit"
        form={INFORMATION_REQUEST_FORM_ID}
        isLoading={isPending}
      >
        {t('cta.submit')}
      </Button>
    </Flex>
  )
}

InformationRequestForm.Footer = Footer
