import { useState, useEffect, useRef } from 'react'
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

const ENTITY_FIELDS: { key: keyof EntityIds; label: string }[] = [
  { key: 'companyId', label: 'Company ID' },
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'contractorId', label: 'Contractor ID' },
  { key: 'payrollId', label: 'Payroll ID' },
  { key: 'requestId', label: 'Request ID' },
  { key: 'formId', label: 'Form ID' },
]

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

  useEffect(() => {
    if (!isOpen) {
      confirmedSnapshot.current = entities
    }
  }, [isOpen, entities])

  const hasChanges = ENTITY_FIELDS.some(
    ({ key }) => entities[key] !== confirmedSnapshot.current[key],
  )

  const env = typeof __SDK_APP_ENV__ !== 'undefined' ? __SDK_APP_ENV__ : 'demo'
  const build = typeof __SDK_APP_BUILD__ !== 'undefined' ? __SDK_APP_BUILD__ : 'dev'
  const mode = typeof __SDK_APP_PROXY_MODE__ !== 'undefined' ? __SDK_APP_PROXY_MODE__ : proxyMode

  if (!isOpen) return null

  const isFlowTokenMode = mode === 'flow-token'
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
          {ENTITY_FIELDS.map(({ key, label }) => (
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
