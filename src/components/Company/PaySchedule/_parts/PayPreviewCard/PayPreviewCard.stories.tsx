import { PayPreviewCard } from './PayPreviewCard'

export const PayPreviewCardDefault = () => {
  return (
    <PayPreviewCard
      checkdate={new Date('2024-06-14')}
      endDate={new Date('2024-06-30')}
      startDate={new Date('2024-04-01')}
      runPayrollBy={new Date('2024-06-12')}
    />
  )
}
