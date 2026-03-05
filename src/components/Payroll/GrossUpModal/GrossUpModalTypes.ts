export interface GrossUpModalProps {
  isOpen: boolean
  onCalculateGrossUp: (netPay: number) => Promise<string | null>
  isPending: boolean
  onApply: (grossAmount: number) => void
  onCancel: () => void
}
