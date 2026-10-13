import { ContractorWageType } from '@gusto/embedded-api/models/components/contractor'

/**
 * Builds the wage portion of a contractor create/update request body. `hourlyRate` is serialized
 * only for Hourly contractors with a finite rate; otherwise it is omitted.
 *
 * @param values - The submitted wage type and hourly rate.
 * @returns The `wageType` and wire-format `hourlyRate` string (or `undefined`).
 * @internal
 */
export function buildContractorWagePayload(values: {
  wageType: (typeof ContractorWageType)[keyof typeof ContractorWageType]
  hourlyRate?: number
}) {
  const { wageType, hourlyRate } = values
  const shouldSendRate =
    wageType === ContractorWageType.Hourly &&
    typeof hourlyRate === 'number' &&
    Number.isFinite(hourlyRate)
  return { wageType, hourlyRate: shouldSendRate ? String(hourlyRate) : undefined }
}
