import { describe, test, expect } from 'vitest'
import {
  InformationRequestStatus,
  ResponseType,
} from '@gusto/embedded-api/models/components/informationrequest'
import { informationRequestEnumHook } from './informationRequestEnumHook'

const context = (operationID: string) =>
  ({ operationID }) as Parameters<typeof informationRequestEnumHook.afterSuccess>[0]

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })

const GET_INFORMATION_REQUESTS = 'get-information-requests'

describe('informationRequestEnumHook', () => {
  test('passes non-information-request operations through untouched', async () => {
    const response = jsonResponse([{ status: 'not_a_real_status' }])

    const result = await informationRequestEnumHook.afterSuccess(context('getPayroll'), response)

    expect(result).toBe(response)
  })

  test('leaves a response with only known enum values untouched', async () => {
    const response = jsonResponse([
      {
        uuid: 'rfi-1',
        type: 'company_onboarding',
        status: 'pending_response',
        required_questions: [
          { question_uuid: 'q1', question_text: 'Upload doc', response_type: 'document' },
        ],
      },
    ])

    const result = await informationRequestEnumHook.afterSuccess(
      context(GET_INFORMATION_REQUESTS),
      response,
    )

    expect(result).toBe(response)
  })

  test('remaps an unknown status to pending_response so the request stays visible', async () => {
    const response = jsonResponse([{ uuid: 'rfi-1', status: 'brand_new_status' }])

    const result = await informationRequestEnumHook.afterSuccess(
      context(GET_INFORMATION_REQUESTS),
      response,
    )

    expect(result).not.toBe(response)
    const body = (await result.json()) as Array<{ status: string }>
    expect(body[0]?.status).toBe(InformationRequestStatus.PendingResponse)
  })

  test('remaps an unknown type to null', async () => {
    const response = jsonResponse([{ uuid: 'rfi-1', type: 'brand_new_type', status: 'approved' }])

    const result = await informationRequestEnumHook.afterSuccess(
      context(GET_INFORMATION_REQUESTS),
      response,
    )

    const body = (await result.json()) as Array<{ type: string | null; status: string }>
    expect(body[0]?.type).toBeNull()
    // A known sibling value is preserved.
    expect(body[0]?.status).toBe('approved')
  })

  test('remaps an unknown required-question response_type to text', async () => {
    const response = jsonResponse([
      {
        uuid: 'rfi-1',
        status: 'pending_response',
        required_questions: [
          { question_uuid: 'q1', question_text: 'Known', response_type: 'text' },
          { question_uuid: 'q2', question_text: 'Unknown', response_type: 'biometric_scan' },
        ],
      },
    ])

    const result = await informationRequestEnumHook.afterSuccess(
      context(GET_INFORMATION_REQUESTS),
      response,
    )

    const body = (await result.json()) as Array<{
      required_questions: Array<{ response_type: string }>
    }>
    expect(body[0]?.required_questions[0]?.response_type).toBe('text')
    expect(body[0]?.required_questions[1]?.response_type).toBe(ResponseType.Text)
  })

  test('leaves a non-array body untouched', async () => {
    const response = jsonResponse({ message: 'not an array' })

    const result = await informationRequestEnumHook.afterSuccess(
      context(GET_INFORMATION_REQUESTS),
      response,
    )

    expect(result).toBe(response)
  })
})
