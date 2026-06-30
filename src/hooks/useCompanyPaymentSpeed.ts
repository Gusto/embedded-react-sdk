import { usePaymentConfigsGet } from '@gusto/embedded-api-v-2026-06-15/react-query/paymentConfigsGet'
import type { PaymentSpeed } from '@gusto/embedded-api-v-2026-06-15/models/components/paymentconfigs'

const DEFAULT_PAYMENT_SPEED_DAYS = 2

/**
 * Extracts the leading day count from a {@link PaymentSpeed} value (e.g. `"2-day"` returns `2`).
 *
 * @remarks
 * Falls back to `2` when the value is missing or cannot be parsed as a positive finite number.
 *
 * @param paymentSpeed - The company's configured payment speed string.
 * @returns The number of payment days as an integer.
 * @internal
 */
export function parsePaymentSpeedDays(paymentSpeed?: PaymentSpeed): number {
  if (!paymentSpeed) return DEFAULT_PAYMENT_SPEED_DAYS
  const parsed = Number(paymentSpeed.split('-')[0])
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAYMENT_SPEED_DAYS
}

/**
 * Reads a company's configured payment speed and returns it alongside the parsed day count.
 *
 * @param companyUuid - The UUID of the company whose payment configuration to fetch.
 * @returns The raw `paymentSpeed` value from the API and `paymentSpeedDays` parsed via {@link parsePaymentSpeedDays}.
 * @internal
 */
export function useCompanyPaymentSpeed(companyUuid: string) {
  const { data: paymentConfigsResponse } = usePaymentConfigsGet({ companyUuid })
  const paymentSpeed = paymentConfigsResponse?.paymentConfigs?.paymentSpeed
  const paymentSpeedDays = parsePaymentSpeedDays(paymentSpeed)

  return {
    paymentSpeed,
    paymentSpeedDays,
  }
}
