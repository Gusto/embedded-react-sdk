export interface GrossUpModalProps {
  isOpen: boolean
  onCalculateGrossUp: (netPay: number) => Promise<string | null>
  isPending: boolean
  onApply: (grossAmount: number) => void | Promise<void>
  onCancel: () => void
}
