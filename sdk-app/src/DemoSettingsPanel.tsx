import { useState, useEffect, useRef, useCallback } from 'react'
import type { EntityIds } from './useEntities'
import type { TokenStatus } from './useDemoManager'
import styles from './DemoSettingsPanel.module.scss'

interface DemoSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  entities: EntityIds
  onUpdateEntity: (key: keyof EntityIds, value: string) => void
  onResetToDefaults: () => void
  tokenStatus: TokenStatus
  isCreatingDemo: boolean
  demoError: string | null
  proxyMode: string
  onCreateNewDemo: (demoType: string) => Promise<unknown>
  onRefreshToken: () => Promise<unknown>
}

const TEXT_FIELDS: { key: keyof EntityIds; label: string }[] = [
  { key: 'requestId', label: 'Request ID' },
  { key: 'formId', label: 'Form ID' },
]

interface EntityOption {
  value: string
  primary: string
  secondary: string
}

interface EntityLists {
  employees: EntityOption[]
  contractors: EntityOption[]
  payrolls: EntityOption[]
}

interface RawEmployee {
  uuid?: string
  first_name?: string | null
  last_name?: string | null
}

interface RawContractor {
  uuid?: string
  type?: string
  first_name?: string | null
  last_name?: string | null
  business_name?: string | null
}

interface RawPayroll {
  uuid?: string
  payroll_uuid?: string
  check_date?: string
  pay_period?: { start_date?: string; end_date?: string }
}

function formatPayPeriod(payroll: RawPayroll): string {
  const start = payroll.pay_period?.start_date
  const end = payroll.pay_period?.end_date
  if (start && end) return `${start} – ${end}`
  if (payroll.check_date) return `Check date ${payroll.check_date}`
  return 'Payroll'
}

function formatContractor(contractor: RawContractor): string {
  if (contractor.type === 'Business') {
    return contractor.business_name || 'Business contractor'
  }
  const name = [contractor.first_name, contractor.last_name].filter(Boolean).join(' ').trim()
  return name || 'Contractor'
}

function formatEmployee(employee: RawEmployee): string {
  const name = [employee.first_name, employee.last_name].filter(Boolean).join(' ').trim()
  return name || 'Employee'
}

async function fetchList<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(path)
    if (!res.ok) return []
    const data = (await res.json()) as unknown
    return Array.isArray(data) ? (data as T[]) : []
  } catch {
    return []
  }
}

interface EntitySelectProps {
  label: string
  value: string
  options: EntityOption[]
  isLoading: boolean
  placeholder: string
  fallbackPlaceholder: string
  useFallback: boolean
  onChange: (value: string) => void
}

function EntitySelect({
  label,
  value,
  options,
  isLoading,
  placeholder,
  fallbackPlaceholder,
  useFallback,
  onChange,
}: EntitySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  if (useFallback) {
    return (
      <div className={styles.field}>
        <label>{label}</label>
        <input
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value)
          }}
          placeholder={fallbackPlaceholder}
        />
      </div>
    )
  }

  const selected = options.find(option => option.value === value)
  const hasOptions = options.length > 0

  return (
    <div className={styles.field}>
      <label id={`${label}-label`}>{label}</label>
      <div className={styles.selectWrapper} ref={wrapperRef}>
        <button
          type="button"
          className={styles.selectButton}
          onClick={() => {
            setIsOpen(open => !open)
          }}
          disabled={isLoading || !hasOptions}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${label}-label`}
        >
          {selected ? (
            <span className={styles.selectButtonContent}>
              <span className={styles.optionPrimary}>{selected.primary}</span>
              <span className={styles.optionSecondary}>{selected.secondary}</span>
            </span>
          ) : (
            <span className={styles.selectPlaceholder}>
              {isLoading ? 'Loading...' : hasOptions ? placeholder : 'No options available'}
            </span>
          )}
          <span className={styles.selectChevron} aria-hidden="true">
            ▾
          </span>
        </button>

        {isOpen && hasOptions && (
          <ul className={styles.selectMenu} role="listbox" aria-labelledby={`${label}-label`}>
            {options.map(option => {
              const isSelected = option.value === value
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`${styles.selectOption} ${isSelected ? styles.selectOptionActive : ''}`}
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                  >
                    <span className={styles.optionPrimary}>{option.primary}</span>
                    <span className={styles.optionSecondary}>{option.secondary}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export function DemoSettingsPanel({
  isOpen,
  onClose,
  entities,
  onUpdateEntity,
  onResetToDefaults,
  tokenStatus,
  isCreatingDemo,
  demoError,
  proxyMode,
  onCreateNewDemo,
  onRefreshToken,
}: DemoSettingsPanelProps) {
  const currentDemoType = import.meta.env.VITE_DEMO_TYPE || 'react_sdk_demo_company_onboarded'
  const [selectedDemoType, setSelectedDemoType] = useState(currentDemoType)
  const confirmedSnapshot = useRef(entities)
  const [lists, setLists] = useState<EntityLists>({
    employees: [],
    contractors: [],
    payrolls: [],
  })
  const [listsLoading, setListsLoading] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  useEffect(() => {
    if (!isOpen) {
      confirmedSnapshot.current = entities
    }
  }, [isOpen, entities])

  const env = typeof __SDK_APP_ENV__ !== 'undefined' ? __SDK_APP_ENV__ : 'demo'
  const build = typeof __SDK_APP_BUILD__ !== 'undefined' ? __SDK_APP_BUILD__ : 'dev'
  const mode = typeof __SDK_APP_PROXY_MODE__ !== 'undefined' ? __SDK_APP_PROXY_MODE__ : proxyMode

  const isFlowTokenMode = mode === 'flow-token'
  const companyId = entities.companyId

  useEffect(() => {
    if (!isOpen || !isFlowTokenMode || !companyId) return

    let cancelled = false
    const load = async () => {
      setListsLoading(true)
      const base = `/api/v1/companies/${companyId}`
      const [employees, contractors, payrolls] = await Promise.all([
        fetchList<RawEmployee>(`${base}/employees`),
        fetchList<RawContractor>(`${base}/contractors`),
        fetchList<RawPayroll>(`${base}/payrolls`),
      ])

      if (cancelled) return

      setLists({
        employees: employees
          .filter(e => !!e.uuid)
          .map(e => ({
            value: e.uuid as string,
            primary: formatEmployee(e),
            secondary: e.uuid as string,
          })),
        contractors: contractors
          .filter(c => !!c.uuid)
          .map(c => ({
            value: c.uuid as string,
            primary: formatContractor(c),
            secondary: c.uuid as string,
          })),
        payrolls: payrolls
          .filter(p => !!(p.payroll_uuid || p.uuid))
          .map(p => {
            const id = (p.payroll_uuid || p.uuid) as string
            return {
              value: id,
              primary: formatPayPeriod(p),
              secondary: id,
            }
          }),
      })
      setListsLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [isOpen, isFlowTokenMode, companyId])

  const hasChanges =
    entities.employeeId !== confirmedSnapshot.current.employeeId ||
    entities.contractorId !== confirmedSnapshot.current.contractorId ||
    entities.payrollId !== confirmedSnapshot.current.payrollId ||
    TEXT_FIELDS.some(({ key }) => entities[key] !== confirmedSnapshot.current[key])

  const handleCopyCompanyId = useCallback(async () => {
    if (!companyId) return
    try {
      await navigator.clipboard.writeText(companyId)
      setCopyStatus('copied')
      setTimeout(() => {
        setCopyStatus('idle')
      }, 1500)
    } catch {
      // Clipboard unavailable
    }
  }, [companyId])

  if (!isOpen) return null

  const displayEnv = env === 'localzp' ? 'local' : env

  return (
    <>
      <div
        className={styles.overlay}
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === 'Escape') onClose()
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close settings"
      />
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2>Demo Settings</h2>
          <button className={styles.close} onClick={onClose} type="button">
            &times;
          </button>
        </div>

        {isFlowTokenMode && (
          <div className={styles.section}>
            <h3>Demo Management</h3>
            <div className={`${styles.info} ${styles.infoSpaced}`}>
              Token status:{' '}
              <strong>
                {tokenStatus === 'valid'
                  ? 'Valid'
                  : tokenStatus === 'expired'
                    ? 'Expired'
                    : tokenStatus === 'checking'
                      ? 'Checking...'
                      : 'Unknown'}
              </strong>
            </div>

            {tokenStatus === 'expired' && (
              <div className={styles.refreshWrapper}>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => onRefreshToken()}
                  disabled={isCreatingDemo}
                  type="button"
                >
                  {isCreatingDemo ? 'Refreshing...' : 'Refresh Token'}
                </button>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="demo-type-select">Demo Type</label>
              <select
                id="demo-type-select"
                value={selectedDemoType}
                onChange={e => {
                  setSelectedDemoType(e.target.value)
                }}
              >
                <option value="react_sdk_demo_company_onboarded">Onboarded Company</option>
                <option value="react_sdk_demo">New Company</option>
              </select>
            </div>

            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => onCreateNewDemo(selectedDemoType)}
              disabled={isCreatingDemo}
              type="button"
            >
              {isCreatingDemo ? 'Creating Demo...' : 'Create New Demo'}
            </button>

            {isCreatingDemo && (
              <div className={`${styles.info} ${styles.creatingHint}`}>
                This may take a few minutes. The page will reload when ready.
              </div>
            )}

            {demoError && <div className={styles.error}>{demoError}</div>}
          </div>
        )}

        <div className={styles.section}>
          <h3>Entity IDs</h3>

          <div className={styles.field}>
            <label htmlFor="company-id-input">Company ID</label>
            <div className={styles.copyRow}>
              <input
                id="company-id-input"
                type="text"
                value={entities.companyId}
                readOnly
                className={styles.readOnly}
              />
              <button
                className={styles.btn}
                onClick={handleCopyCompanyId}
                disabled={!entities.companyId}
                type="button"
              >
                {copyStatus === 'copied' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <EntitySelect
            label="Employee"
            value={entities.employeeId}
            options={lists.employees}
            isLoading={listsLoading}
            placeholder="Select an employee..."
            fallbackPlaceholder="Enter employee id..."
            useFallback={!isFlowTokenMode}
            onChange={value => {
              onUpdateEntity('employeeId', value)
            }}
          />

          <EntitySelect
            label="Contractor"
            value={entities.contractorId}
            options={lists.contractors}
            isLoading={listsLoading}
            placeholder="Select a contractor..."
            fallbackPlaceholder="Enter contractor id..."
            useFallback={!isFlowTokenMode}
            onChange={value => {
              onUpdateEntity('contractorId', value)
            }}
          />

          <EntitySelect
            label="Payroll"
            value={entities.payrollId}
            options={lists.payrolls}
            isLoading={listsLoading}
            placeholder="Select a payroll..."
            fallbackPlaceholder="Enter payroll id..."
            useFallback={!isFlowTokenMode}
            onChange={value => {
              onUpdateEntity('payrollId', value)
            }}
          />

          {TEXT_FIELDS.map(({ key, label }) => (
            <div key={key} className={styles.field}>
              <label>{label}</label>
              <input
                type="text"
                value={entities[key]}
                onChange={e => {
                  onUpdateEntity(key, e.target.value)
                }}
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
            </div>
          ))}

          <div className={styles.actions}>
            {hasChanges && (
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  confirmedSnapshot.current = { ...entities }
                  onClose()
                }}
                type="button"
              >
                Update
              </button>
            )}
            <button className={styles.btn} onClick={onResetToDefaults} type="button">
              Restore Default IDs
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Environment</h3>
          <div className={styles.info}>
            <p>
              API: <code>{displayEnv}</code>
            </p>
            <p>
              SDK build: <code>{build}</code>
            </p>
            <p>
              Proxy: <code>{mode}</code>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
