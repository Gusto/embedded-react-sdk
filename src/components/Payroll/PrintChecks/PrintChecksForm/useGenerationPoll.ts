import { useCallback, useRef } from 'react'
import {
  buildGeneratedDocumentsGetQuery,
  type GeneratedDocumentsGetQueryData,
} from '@gusto/embedded-api/react-query/generatedDocumentsGet'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import { DocumentType } from '@gusto/embedded-api/models/operations/getv1generateddocumentsdocumenttyperequestuuid'
import { GeneratedDocumentStatus } from '@gusto/embedded-api/models/components/generateddocument'
import { usePollingTask, type PollTickResult } from '@/hooks/usePollingTask/usePollingTask'

const POLL_INTERVAL_MS = 5_000
const POLL_DEADLINE_MS = 3 * 60 * 1000

type PrintChecksOutcome = { type: 'succeeded'; url: string | null } | { type: 'failed' }

const evaluatePrintChecksOutcome = (
  data: GeneratedDocumentsGetQueryData,
): PollTickResult<PrintChecksOutcome> => {
  const status = data.generatedDocument?.status
  if (status === GeneratedDocumentStatus.Succeeded) {
    return {
      done: true,
      value: { type: 'succeeded', url: data.generatedDocument?.documentUrls?.[0] ?? null },
    }
  }
  if (status === GeneratedDocumentStatus.Failed) {
    return { done: true, value: { type: 'failed' } }
  }
  return { done: false }
}

const deadlinePrintChecksOutcome = (
  lastData: GeneratedDocumentsGetQueryData | null,
): PrintChecksOutcome => {
  const status = lastData?.generatedDocument?.status
  if (status === GeneratedDocumentStatus.Succeeded) {
    return { type: 'succeeded', url: lastData?.generatedDocument?.documentUrls?.[0] ?? null }
  }
  return { type: 'failed' }
}

/** @internal */
export interface UseGenerationPollOptions {
  onSucceeded: (url: string | null) => void
  onFailed: () => void
}

/** @internal */
export interface GenerationPoll {
  /** Starts polling the generated-document status for `requestUuid`. */
  start: (requestUuid: string) => void
}

/**
 * Polls a generated print-checks document until it reaches a terminal state, via
 * {@link usePollingTask}.
 *
 * @internal
 */
export function useGenerationPoll({
  onSucceeded,
  onFailed,
}: UseGenerationPollOptions): GenerationPoll {
  const gustoClient = useGustoEmbeddedContext()
  const queryClient = useQueryClient()
  const requestUuidRef = useRef<string | null>(null)

  const fetchGeneratedDocument = (signal: AbortSignal) => {
    const requestUuid = requestUuidRef.current
    if (!requestUuid) {
      throw new Error('usePollingTask started without a print-checks request in flight')
    }
    return queryClient.fetchQuery({
      ...buildGeneratedDocumentsGetQuery(
        gustoClient,
        { documentType: DocumentType.PrintablePayrollChecks, requestUuid },
        { signal },
      ),
      staleTime: 0,
    })
  }

  const handleOutcome = (outcome: PrintChecksOutcome) => {
    if (outcome.type === 'failed') {
      onFailed()
      return
    }
    onSucceeded(outcome.url)
  }

  const { start: startPoll } = usePollingTask<GeneratedDocumentsGetQueryData, PrintChecksOutcome>({
    fetch: fetchGeneratedDocument,
    evaluate: evaluatePrintChecksOutcome,
    onDone: handleOutcome,
    onDeadline: lastData => {
      handleOutcome(deadlinePrintChecksOutcome(lastData))
    },
    intervalMs: POLL_INTERVAL_MS,
    deadlineMs: POLL_DEADLINE_MS,
  })

  const start = useCallback(
    (requestUuid: string) => {
      requestUuidRef.current = requestUuid
      startPoll()
    },
    [startPoll],
  )

  return { start }
}
