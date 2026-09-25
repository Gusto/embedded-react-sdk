import {
  InformationRequestType,
  InformationRequestStatus,
  ResponseType,
} from '@gusto/embedded-api/models/components/informationrequest'
import type { AfterSuccessHook } from '@/types/hooks'

const GET_INFORMATION_REQUESTS_OPERATION_ID = 'get-information-requests'

const KNOWN_TYPES: ReadonlySet<string> = new Set(Object.values(InformationRequestType))
const KNOWN_STATUSES: ReadonlySet<string> = new Set(Object.values(InformationRequestStatus))
const KNOWN_RESPONSE_TYPES: ReadonlySet<string> = new Set(Object.values(ResponseType))

// `type` is nullable in the schema, so an unrecognized type collapses to `null` rather than an
// invented category. An unknown `status` falls back to `pending_response` so the request stays
// visible and actionable (never silently treated as `approved`, which would hide it). An unknown
// `response_type` falls back to `text`, a generic renderable input.
const FALLBACK_STATUS = InformationRequestStatus.PendingResponse
const FALLBACK_RESPONSE_TYPE = ResponseType.Text

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object'

const hasUnknownEnum = (value: unknown, known: ReadonlySet<string>): value is string =>
  typeof value === 'string' && !known.has(value)

const questionHasUnknownResponseType = (question: unknown): boolean =>
  isRecord(question) && hasUnknownEnum(question.response_type, KNOWN_RESPONSE_TYPES)

const requestNeedsRemap = (request: unknown): request is Record<string, unknown> =>
  isRecord(request) &&
  (hasUnknownEnum(request.type, KNOWN_TYPES) ||
    hasUnknownEnum(request.status, KNOWN_STATUSES) ||
    (Array.isArray(request.required_questions) &&
      request.required_questions.some(questionHasUnknownResponseType)))

const remapRequest = (request: Record<string, unknown>): Record<string, unknown> => {
  const next: Record<string, unknown> = { ...request }

  if (hasUnknownEnum(request.type, KNOWN_TYPES)) {
    next.type = null
  }

  if (hasUnknownEnum(request.status, KNOWN_STATUSES)) {
    next.status = FALLBACK_STATUS
  }

  if (Array.isArray(request.required_questions)) {
    next.required_questions = request.required_questions.map(question =>
      questionHasUnknownResponseType(question)
        ? { ...(question as Record<string, unknown>), response_type: FALLBACK_RESPONSE_TYPE }
        : question,
    )
  }

  return next
}

/**
 * Temporary workaround for a Gusto-Partner-API spec gap: `InformationRequest.type`, `.status`, and
 * `requiredQuestions[].responseType` are generated as closed enums (`z.nativeEnum`) in
 * `@gusto/embedded-api`, so a value the published OAS doesn't list makes the whole
 * `GetInformationRequests` response throw an `SDKValidationError` -- taking down every
 * `useInformationRequestsGetInformationRequestsSuspense` call site (including the payroll blocker
 * RFI surface, SDK-1347). This afterSuccess hook remaps any value outside those closed enums to a
 * safe known member before the SDK's zod parse, so the response still validates and the request
 * stays viewable. Remove once the client supports lax/open enum parsing for these fields.
 *
 * @internal
 */
export const informationRequestEnumHook: AfterSuccessHook = {
  afterSuccess: async (context, response) => {
    if (context.operationID !== GET_INFORMATION_REQUESTS_OPERATION_ID) {
      return response
    }

    // The endpoint's body is a bare array of information requests (Speakeasy wraps it under
    // `Information-Requests` before parsing), so read and rewrite that array directly.
    let body: unknown
    try {
      body = await response.clone().json()
    } catch {
      return response
    }

    if (!Array.isArray(body) || !body.some(requestNeedsRemap)) {
      return response
    }

    const remapped = body.map(request => (isRecord(request) ? remapRequest(request) : request))

    return new Response(JSON.stringify(remapped), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  },
}
