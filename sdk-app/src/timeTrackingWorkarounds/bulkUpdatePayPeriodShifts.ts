import type { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { timeTrackingPostCompaniesCompanyUuidTimeTrackingTimeSheetsBatches } from '@gusto/embedded-api/funcs/timeTrackingPostCompaniesCompanyUuidTimeTrackingTimeSheetsBatches'
import { timeTrackingGetTimeTrackingTimeSheetsBatchesTimeSheetsBatchUuid } from '@gusto/embedded-api/funcs/timeTrackingGetTimeTrackingTimeSheetsBatchesTimeSheetsBatchUuid'
import { unwrapAsync } from '@gusto/embedded-api/types/fp'
import { TimeSheetsBatchStatus } from '@gusto/embedded-api/models/components/timesheetsbatch'
import { EmbeddedTimeSheetsBatchCreateBodyStatus } from '@gusto/embedded-api/models/components/embeddedtimesheetsbatchcreatebody'

export interface BulkUpdateShiftRef {
  uuid: string
  version: string
}

export interface BulkUpdateOutcome {
  succeeded: { uuid: string; version: string }[]
  failed: { uuid: string; errors: string[] }[]
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const TERMINAL_STATUSES: ReadonlySet<TimeSheetsBatchStatus> = new Set([
  TimeSheetsBatchStatus.Success,
  TimeSheetsBatchStatus.Failed,
  TimeSheetsBatchStatus.PartialSuccess,
])

/**
 * Batches only accept explicit shift UUIDs/versions, not a pay-period identifier. Callers
 * resolve the period's shifts themselves (e.g. with {@link fetchPayPeriodShifts}) and pass the
 * ones they want updated here.
 *
 * Batch processing has no guaranteed item order and no rollback -- a completed batch can be
 * `partial_success`. This polls until the batch reaches a terminal status and reconciles
 * `results` back to the shifts passed in (threaded through `externalId`, since a failed item's
 * result doesn't otherwise carry the source UUID).
 */
export async function bulkUpdatePayPeriodShifts(
  client: GustoEmbeddedCore,
  params: {
    companyId: string
    shifts: BulkUpdateShiftRef[]
    status: 'approved' | 'pending' | 'rejected'
  },
  options: { pollIntervalMs?: number; maxPollAttempts?: number } = {},
): Promise<BulkUpdateOutcome> {
  const { companyId, shifts, status } = params
  if (shifts.length === 0) return { succeeded: [], failed: [] }

  const { pollIntervalMs = 2000, maxPollAttempts = 30 } = options

  const statusValue =
    status === 'approved'
      ? EmbeddedTimeSheetsBatchCreateBodyStatus.Approved
      : status === 'rejected'
        ? EmbeddedTimeSheetsBatchCreateBodyStatus.Rejected
        : EmbeddedTimeSheetsBatchCreateBodyStatus.Pending

  const created = await unwrapAsync(
    timeTrackingPostCompaniesCompanyUuidTimeTrackingTimeSheetsBatches(client, {
      companyUuid: companyId,
      embeddedTimeSheetsBatchCreateBody: {
        idempotencyKey: crypto.randomUUID(),
        batchAction: 'update',
        timeSheets: shifts.map(shift => ({
          externalId: shift.uuid,
          uuid: shift.uuid,
          version: shift.version,
          status: statusValue,
        })),
      },
    }),
  )

  const batchUuid = created.timeSheetsBatch?.uuid
  if (!batchUuid) {
    throw new Error('Batch creation did not return a batch UUID')
  }

  for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
    const { timeSheetsBatch } = await unwrapAsync(
      timeTrackingGetTimeTrackingTimeSheetsBatchesTimeSheetsBatchUuid(client, {
        timeSheetsBatchUuid: batchUuid,
      }),
    )

    if (timeSheetsBatch?.status && TERMINAL_STATUSES.has(timeSheetsBatch.status)) {
      const results = timeSheetsBatch.results ?? []
      return {
        succeeded: results
          .filter(r => r.status === 'success' && r.uuid && r.version)
          .map(r => ({ uuid: r.uuid as string, version: r.version as string })),
        failed: results
          .filter(r => r.status === 'failed')
          .map(r => ({
            uuid: r.externalId ?? 'unknown',
            errors: (r.errors ?? []).map(e => e.message ?? e.errorKey),
          })),
      }
    }

    await sleep(pollIntervalMs)
  }

  throw new Error(
    `Batch ${batchUuid} did not reach a terminal status after ${maxPollAttempts} polls -- use its UUID to check outcomes before resubmitting instead of retrying blind`,
  )
}
