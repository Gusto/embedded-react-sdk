import { usePaymentConfigsGet } from '@gusto/embedded-api/react-query/paymentConfigsGet'
import type { PaymentSpeed } from '@gusto/embedded-api/models/components/paymentconfigs'

const DEFAULT_PAYMENT_SPEED_DAYS = 2

export function parsePaymentSpeedDays(paymentSpeed?: PaymentSpeed): number {
  if (!paymentSpeed) return DEFAULT_PAYMENT_SPEED_DAYS
  const parsed = Number(paymentSpeed.split('-')[0])
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAYMENT_SPEED_DAYS
}

export function useCompanyPaymentSpeed(companyUuid: string) {
  const { data: paymentConfigsResponse } = usePaymentConfigsGet({ companyUuid })
  const paymentSpeed = paymentConfigsResponse?.paymentConfigs?.paymentSpeed
  const paymentSpeedDays = parsePaymentSpeedDays(paymentSpeed)

  return {
    paymentSpeed,
    paymentSpeedDays,
  }
}
