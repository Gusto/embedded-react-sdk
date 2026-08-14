/** @internal */
export interface PrintChecksModalProps {
  /** Whether the modal is visible. */
  isOpen: boolean
  /** Closes the modal. */
  onClose: () => void
  /** The payroll to generate printable checks for. */
  payrollUuid: string
}
