import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useInformationRequestsGetInformationRequestsSuspense } from '@gusto/embedded-api/react-query/informationRequestsGetInformationRequests'
import { useInformationRequestsSubmitMutation } from '@gusto/embedded-api/react-query/informationRequestsSubmit'
import type { RequiredQuestions } from '@gusto/embedded-api/models/components/informationrequest'
import { ResponseType } from '@gusto/embedded-api/models/components/informationrequest'
import { ResponseType as SubmitResponseType } from '@gusto/embedded-api/models/operations/submitinformationrequest'
import { useBase } from '@/components/Base/useBase'
import { informationRequestEvents } from '@/shared/constants'

export const INFORMATION_REQUEST_FORM_ID = 'gusto-sdk-information-request-form'
export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

const InformationRequestFormSchema = z.record(
  z.string(),
  z.union([z.string().min(1), z.instanceof(File)]),
)

type InformationRequestFormValues = z.infer<typeof InformationRequestFormSchema>

const SUPPORTED_RESPONSE_TYPES: ResponseType[] = [ResponseType.Text, ResponseType.Document]

export function hasUnsupportedQuestionTypes(questions: RequiredQuestions[]) {
  return questions.some(
    question => question.responseType && !SUPPORTED_RESPONSE_TYPES.includes(question.responseType),
  )
}

function hasPersonaQuestionType(questions: RequiredQuestions[]) {
  return questions.some(question => question.responseType === ResponseType.Persona)
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

interface UseInformationRequestFormParams {
  companyId: string
  requestId: string
}

export function useInformationRequestForm({
  companyId,
  requestId,
}: UseInformationRequestFormParams) {
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = useInformationRequestsGetInformationRequestsSuspense({
    companyUuid: companyId,
  })

  const informationRequest = data.informationRequestList?.find(req => req.uuid === requestId)
  const requiredQuestions = informationRequest?.requiredQuestions ?? []
  const isBlockingPayroll = informationRequest?.blockingPayroll ?? false
  const hasUnsupportedTypes = hasUnsupportedQuestionTypes(requiredQuestions)
  const hasPersonaType = hasPersonaQuestionType(requiredQuestions)

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

  return {
    data: {
      informationRequest,
      requiredQuestions,
      questionUuids,
    },
    actions: {
      onSubmit,
    },
    meta: {
      isBlockingPayroll,
      hasUnsupportedTypes,
      hasPersonaType,
      formMethods,
    },
  }
}
