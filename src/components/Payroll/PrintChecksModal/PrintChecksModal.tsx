import type { PrintChecksModalProps } from './PrintChecksModalTypes'
import { usePrintChecksModal } from './usePrintChecksModal'
import { PrintChecksModalPresentation } from './PrintChecksModalPresentation'

/** @internal */
export function PrintChecksModal({ isOpen, onClose, payrollUuid }: PrintChecksModalProps) {
  const bundle = usePrintChecksModal({ payrollUuid, isOpen })

  return <PrintChecksModalPresentation {...bundle} isOpen={isOpen} onClose={onClose} />
}
