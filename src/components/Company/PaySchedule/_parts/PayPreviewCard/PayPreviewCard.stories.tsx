import { PayPreviewCard } from './PayPreviewCard'

export const PayPreviewCardDefault = () => {
  return (
    <PayPreviewCard
      checkdate={new Date('2024-06-14').toISOString()}
      endDate={new Date('2024-06-30').toISOString()}
      startDate={new Date('2024-04-01').toISOString()}
      runPayrollBy={new Date('2024-06-12').toISOString()}
    />
  )
}
