/** @internal */
export interface GrossUpModalProps {
  /** Whether the modal is visible. */
  isOpen: boolean
  /** Calculates the gross amount from the entered net pay and returns it as a string, or `null` when the calculation fails. */
  onCalculateGrossUp: (netPay: number) => Promise<string | null>
  /** Applies the calculated gross amount to the employee's compensation for the current payroll. */
  onApply: (grossAmount: string) => void | Promise<void>
  /** Closes the modal without applying a calculated gross amount. */
  onCancel: () => void
}
