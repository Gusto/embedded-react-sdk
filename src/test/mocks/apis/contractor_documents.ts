import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export const W9_DOCUMENT_UUID = 'w9-document-uuid'
export const SIGNED_DOCUMENT_UUID = 'signed-document-uuid'

/** The contractor documents list response (raw array). */
export function buildContractorDocumentsList(overrides?: Array<Record<string, unknown>>) {
  return (
    overrides ?? [
      {
        uuid: W9_DOCUMENT_UUID,
        title: 'W-9',
        name: 'taxpayer_identification_form_w_9',
        requires_signing: true,
        signed_at: null,
      },
      {
        uuid: SIGNED_DOCUMENT_UUID,
        title: 'Contractor handbook',
        name: 'contractor_handbook',
        requires_signing: false,
        signed_at: '2025-01-01T00:00:00Z',
      },
    ]
  )
}

export function handleGetContractorDocuments(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid/documents`, resolver)
}

export const getContractorDocuments = handleGetContractorDocuments(() =>
  HttpResponse.json(buildContractorDocumentsList()),
)

export default [getContractorDocuments]
