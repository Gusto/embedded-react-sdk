import styles from './RropApiVerification.module.scss'
import { EarningTypesVerification } from './EarningTypesVerification'
import { PaySchedulesVerification } from './PaySchedulesVerification'
import { PayrollsVerification } from './PayrollsVerification'

/**
 * Live harness that exercises the Regular Rate of Pay (RRoP) endpoints through
 * the generated `@gusto/embedded-api` React Query hooks. Its purpose is to prove
 * the pinned client parses real RRoP responses without a zod type mismatch — a
 * mismatch surfaces inline as a red "failed zod validation" panel on the step
 * that hit it, instead of crashing a real screen.
 */
export function RropApiVerification({
  companyId,
  payrollId,
}: {
  companyId: string
  payrollId?: string
}) {
  return (
    <div className={styles.page}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Regular Rate of Pay — API verification</h2>
        <p className={styles.sectionIntro}>
          Each step below runs one generated hook against the live demo API and reports{' '}
          <strong>Parsed OK</strong> when the response deserializes cleanly, or a red panel listing
          the offending field paths when it doesn&apos;t. The RRoP fields require the{' '}
          <code>emb_regular_rate_of_pay</code> feature flag to be enabled for the partner backing
          this demo; without it the endpoints still respond and parse, but the RRoP-specific fields
          come back empty.
        </p>
      </div>

      <EarningTypesVerification companyId={companyId} />
      <PayrollsVerification companyId={companyId} initialPayrollId={payrollId} />
      <PaySchedulesVerification companyId={companyId} />
    </div>
  )
}
