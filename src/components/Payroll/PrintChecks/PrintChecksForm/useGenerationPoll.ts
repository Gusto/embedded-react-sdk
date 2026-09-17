import { useCallback, useRef } from 'react'
import {
  buildGeneratedDocumentsGetQuery,
  type GeneratedDocumentsGetQueryData,
} from '@gusto/embedded-api/react-query/generatedDocumentsGet'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import { DocumentType } from '@gusto/embedded-api/models/operations/getv1generateddocumentsdocumenttyperequestuuid'
import { GeneratedDocumentStatus } from '@gusto/embedded-api/models/components/generateddocument'
import {
  usePollingTask,
  isNonRetryablePollError,
  type PollReadOutcome,
  type PollTickResult,
} from '@/hooks/usePollingTask/usePollingTask'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { normalizeToSDKError } from '@/types/sdkError'

const COMPONENT_NAME = 'Payroll.PrintChecksForm'

type PrintChecksOutcome = { type: 'succeeded'; url: string | null } | { type: 'failed' }

// Verify against the last-known data before reporting failure: a document that already
// finished generating must never be reported as a failure just because the deadline hit first.
const verifiedPrintChecksOutcome = (
  lastData: GeneratedDocumentsGetQueryData | null,
): PrintChecksOutcome => {
  const status = lastData?.generatedDocument?.status
  if (status === GeneratedDocumentStatus.Succeeded) {
    return { type: 'succeeded', url: lastData?.generatedDocument?.documentUrls?.[0] ?? null }
  }
  return { type: 'failed' }
}

const evaluatePrintChecksOutcome = (
  outcome: PollReadOutcome<GeneratedDocumentsGetQueryData>,
): PollTickResult<PrintChecksOutcome> => {
  if (!outcome.success) {
    return isNonRetryablePollError(outcome.error)
      ? { status: 'error', error: outcome.error }
      : { status: 'polling' }
  }

  const status = outcome.data.generatedDocument?.status
  if (status === GeneratedDocumentStatus.Succeeded) {
    return {
      status: 'done',
      value: { type: 'succeeded', url: outcome.data.generatedDocument?.documentUrls?.[0] ?? null },
    }
  }
  if (status === GeneratedDocumentStatus.Failed) {
    return { status: 'done', value: { type: 'failed' } }
  }
  return { status: 'polling' }
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
  const { observability } = useObservability()

  // Unlike the payroll polls, there's no sibling `useGeneratedDocumentsGet` rendering this data —
  // the result is only ever downloaded, never displayed — so there's no other observer of this
  // queryKey for this fetchQuery call to race against, and no `refetch` to reuse instead.
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
    // Unlike the payroll polls, print-checks generation has no equivalent to prepare/resubmit to
    // guard against, so a non-retryable read error can safely reuse the same failure path as a
    // real generation failure — same screen, same retry CTA.
    onError: error => {
      const sdkError = normalizeToSDKError(error)
      observability?.onError?.({
        ...sdkError,
        timestamp: Date.now(),
        componentName: COMPONENT_NAME,
      })
      onFailed()
    },
    onDeadline: lastData => {
      handleOutcome(verifiedPrintChecksOutcome(lastData))
    },
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
