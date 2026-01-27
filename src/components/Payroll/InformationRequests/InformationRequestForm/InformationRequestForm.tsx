import { useTranslation } from 'react-i18next'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useIsMutating } from '@tanstack/react-query'
import { useInformationRequestsGetInformationRequestsSuspense } from '@gusto/embedded-api/react-query/informationRequestsGetInformationRequests'
import {
  useInformationRequestsSubmitMutation,
  mutationKeyInformationRequestsSubmit,
} from '@gusto/embedded-api/react-query/informationRequestsSubmit'
import type { RequiredQuestions } from '@gusto/embedded-api/models/components/informationrequest'
import { ResponseType } from '@gusto/embedded-api/models/components/informationrequest'
import { ResponseType as SubmitResponseType } from '@gusto/embedded-api/models/operations/submitinformationrequest'
import styles from './InformationRequestForm.module.scss'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { ActionsLayout, Flex, TextInputField } from '@/components/Common'
import { FileInputField } from '@/components/Common/Fields/FileInputField'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { informationRequestEvents, type EventType } from '@/shared/constants'

const INFORMATION_REQUEST_FORM_ID = 'gusto-sdk-information-request-form'
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

const InformationRequestFormSchema = z.record(
  z.string(),
  z.union([z.string().min(1), z.instanceof(File)]),
)

type InformationRequestFormValues = z.infer<typeof InformationRequestFormSchema>

interface InformationRequestFormProps extends BaseComponentInterface<'Payroll.InformationRequestForm'> {
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

const convertFileToDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function Root({ companyId, requestId, dictionary }: InformationRequestFormProps) {
  useComponentDictionary('Payroll.InformationRequestForm', dictionary)
  useI18n('Payroll.InformationRequestForm')
  const { t } = useTranslation('Payroll.InformationRequestForm')
  const { Alert, Heading, Text } = useComponentContext()
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = useInformationRequestsGetInformationRequestsSuspense({
    companyUuid: companyId,
  })

  const informationRequest = data.informationRequestList?.find(req => req.uuid === requestId)
  const requiredQuestions = informationRequest?.requiredQuestions ?? []
  const isBlockingPayroll = informationRequest?.blockingPayroll ?? false

  const { mutateAsync: submitInformationRequest } = useInformationRequestsSubmitMutation()

  const defaultValues: Record<string, string | File | undefined> = {}
  const questionUuids: string[] = []

  requiredQuestions.forEach(question => {
    if (!question.questionUuid || !question.responseType) return

    if (question.responseType === ResponseType.Text) {
      questionUuids.push(question.questionUuid)
      defaultValues[question.questionUuid] = ''
    } else if (question.responseType === ResponseType.Document) {
      questionUuids.push(question.questionUuid)
      defaultValues[question.questionUuid] = undefined
    }
  })

  const formMethods = useForm<InformationRequestFormValues>({
    resolver: zodResolver(InformationRequestFormSchema),
    defaultValues,
  })

  const onSubmit = async (formData: InformationRequestFormValues) => {
    await baseSubmitHandler(formData, async () => {
      const questionResponses = await Promise.all(
        questionUuids.map(async uuid => {
          const value = formData[uuid]

          if (typeof value === 'string') {
            return {
              questionUuid: uuid,
              responseType: SubmitResponseType.Text,
              textResponse: value,
            }
          }

          if (value instanceof File) {
            const fileResponse = await convertFileToDataUrl(value)
            return {
              questionUuid: uuid,
              responseType: SubmitResponseType.Document,
              fileResponse,
              fileName: value.name,
            }
          }

          return null
        }),
      )

      const validResponses = questionResponses.filter(response => response !== null)

      const response = await submitInformationRequest({
        request: {
          informationRequestUuid: requestId,
          requestBody: {
            requiredQuestions: validResponses,
          },
        },
      })

      onEvent(informationRequestEvents.INFORMATION_REQUEST_FORM_DONE, response.informationRequest)
    })
  }

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

  return (
    <div className={styles.root}>
      <Flex flexDirection="column" gap={16}>
        <Heading as="h2">{t('title')}</Heading>

        {isBlockingPayroll && (
          <Alert status="error" label={t('blockingAlert.title')} disableScrollIntoView>
            {t('blockingAlert.description')}
          </Alert>
        )}

        <FormProvider {...formMethods}>
          <Form id={INFORMATION_REQUEST_FORM_ID} onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Flex flexDirection="column" gap={16}>
              {requiredQuestions.map(renderQuestion)}
            </Flex>
          </Form>
        </FormProvider>
      </Flex>
    </div>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.InformationRequestForm')
  const { t } = useTranslation('Payroll.InformationRequestForm')
  const { Button } = useComponentContext()
  const isMutating = useIsMutating({
    mutationKey: mutationKeyInformationRequestsSubmit(),
  })
  const isPending = isMutating > 0

  const handleCancel = () => {
    onEvent(informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL)
  }

  return (
    <ActionsLayout>
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
    </ActionsLayout>
  )
}

InformationRequestForm.Footer = Footer
