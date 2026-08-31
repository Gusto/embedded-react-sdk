import { useMemo } from 'react'
import { useEarningTypesList } from '@gusto/embedded-api/react-query/earningTypesList'
import { useEarningTypesCreateMutation } from '@gusto/embedded-api/react-query/earningTypesCreate'
import { Category } from '@gusto/embedded-api/models/operations/postv1companiescompanyidearningtypes'
import type { EarningType } from '@gusto/embedded-api/models/components/earningtype'
import styles from './RropApiVerification.module.scss'
import {
  Field,
  JsonBlock,
  RunButton,
  StepCard,
  classifyError,
  useAsyncStep,
  type ClassifiedError,
  type StepPhase,
} from './shared'

function summarizeEarningType(entry: EarningType) {
  return (
    <div key={entry.uuid} className={styles.field}>
      <span className={styles.fieldLabel}>{entry.name ?? entry.uuid}</span>
      <span className={styles.fieldValue}>
        category={entry.category ?? '—'} · includedInOvertimePay=
        {String(entry.includedInOvertimePay ?? '—')}
      </span>
    </div>
  )
}

/**
 * Company Earning Types RRoP verification (Test Fest cases 1–2). Exercises the
 * `category` + `includedInOvertimePay` fields on both the read and create paths
 * so a type mismatch on either surfaces as a zod failure here instead of tanking
 * a real screen.
 */
export function EarningTypesVerification({ companyId }: { companyId: string }) {
  const listQuery = useEarningTypesList({ companyId }, { enabled: false, throwOnError: false })

  const listPhase: StepPhase = listQuery.isFetching
    ? 'running'
    : listQuery.error
      ? 'error'
      : listQuery.isFetched
        ? 'success'
        : 'idle'
  const listError: ClassifiedError | null = listQuery.error ? classifyError(listQuery.error) : null

  const earningTypes = useMemo(() => {
    const list = listQuery.data?.earningTypeList
    return [...(list?.default ?? []), ...(list?.custom ?? [])]
  }, [listQuery.data])

  const createMutation = useEarningTypesCreateMutation()
  const createOther = useAsyncStep<EarningType | undefined>()
  const createFixed = useAsyncStep<EarningType | undefined>()

  const runCreateOther = () =>
    void createOther.run(async () => {
      const response = await createMutation.mutateAsync({
        request: {
          companyId,
          requestBody: {
            name: `RRoP Other ${Date.now()}`,
            category: Category.Other,
            includedInOvertimePay: true,
          },
        },
      })
      return response.earningType
    })

  const runCreateFixed = () =>
    void createFixed.run(async () => {
      const response = await createMutation.mutateAsync({
        request: {
          companyId,
          requestBody: {
            name: `RRoP Commission ${Date.now()}`,
            category: Category.Commission,
          },
        },
      })
      return response.earningType
    })

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Company Earning Types</h3>
      <p className={styles.sectionIntro}>
        Verifies the new <code>category</code> and <code>included_in_overtime_pay</code> fields
        parse on both list and create. Creates leave real custom earning types on the company
        (earning types can&apos;t be deleted once used) — expect new rows to accumulate.
      </p>

      <StepCard
        title="List earning types"
        description="GET /v1/companies/:id/earning_types — reads category / includedInOvertimePay on every returned type."
        phase={listPhase}
        error={listError}
        actions={
          <RunButton onClick={() => void listQuery.refetch()} disabled={listQuery.isFetching}>
            {listQuery.isFetched ? 'Re-run' : 'Run'}
          </RunButton>
        }
      >
        {listPhase === 'success' && (
          <>
            <Field label="count" value={earningTypes.length} />
            {earningTypes.map(summarizeEarningType)}
            <JsonBlock label="Raw earningTypeList" value={listQuery.data?.earningTypeList} />
          </>
        )}
      </StepCard>

      <StepCard
        title={'Create — category "Other", includedInOvertimePay: true'}
        description="Case 2: both fields are settable together only when category is Other; the sent value should be echoed back."
        phase={createOther.phase}
        error={createOther.error}
        actions={
          <RunButton onClick={runCreateOther} disabled={createOther.phase === 'running'}>
            Run
          </RunButton>
        }
      >
        {createOther.phase === 'success' && createOther.result && (
          <>
            <Field label="uuid" value={createOther.result.uuid} />
            <Field label="category" value={String(createOther.result.category)} />
            <Field
              label="includedInOvertimePay"
              value={String(createOther.result.includedInOvertimePay)}
            />
            <JsonBlock label="Raw earningType" value={createOther.result} />
          </>
        )}
      </StepCard>

      <StepCard
        title={'Create — fixed category "Commission" (omit includedInOvertimePay)'}
        description="Case 1a: a fixed category returns its hardcoded includedInOvertimePay default (true for Commission)."
        phase={createFixed.phase}
        error={createFixed.error}
        actions={
          <RunButton onClick={runCreateFixed} disabled={createFixed.phase === 'running'}>
            Run
          </RunButton>
        }
      >
        {createFixed.phase === 'success' && createFixed.result && (
          <>
            <Field label="uuid" value={createFixed.result.uuid} />
            <Field label="category" value={String(createFixed.result.category)} />
            <Field
              label="includedInOvertimePay (default)"
              value={String(createFixed.result.includedInOvertimePay)}
            />
            <JsonBlock label="Raw earningType" value={createFixed.result} />
          </>
        )}
      </StepCard>
    </section>
  )
}
