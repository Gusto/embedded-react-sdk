import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import type { EntityIds } from './useEntities'
import type { TokenStatus } from './useDemoManager'
import type { EntityCatalog } from './useEntityCatalog'
import type { EntityOption } from './entityFormatters'
import type { AppMode, ManualConfig, ManualConfigSaves } from './useManualConfig'
import { demoChromes } from './demoChromes/registry'
import styles from './DemoSettingsPanel.module.scss'

interface DemoSettingsPanelProps {
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
  entityCatalog: EntityCatalog
  mode: AppMode
  manualConfig: ManualConfig
  manualSaves: ManualConfigSaves
  onSwitchToAuto: () => Promise<void>
  onApplyManualConfig: (next: ManualConfig) => Promise<void>
  onSaveManualConfig: (name: string, config: ManualConfig) => void
  onDeleteManualSave: (name: string) => void
  chromeId: string
  onChromeIdChange: (next: string) => void
}

const MANUAL_FIELDS: { key: keyof ManualConfig; label: string; required?: boolean }[] = [
  { key: 'flowToken', label: 'Flow Token', required: true },
  { key: 'companyId', label: 'Company ID', required: true },
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'contractorId', label: 'Contractor ID' },
  { key: 'payrollId', label: 'Payroll ID' },
  { key: 'formId', label: 'Form ID' },
  { key: 'requestId', label: 'Request ID' },
]

const TEXT_FIELDS: { key: keyof EntityIds; label: string }[] = [
  { key: 'requestId', label: 'Request ID' },
  { key: 'formId', label: 'Form ID' },
]

interface EntityComboboxProps {
  label: string
  value: string
  options: EntityOption[]
  isLoading: boolean
  placeholder: string
  useFallback: boolean
  onChange: (value: string) => void
  trailing?: ReactNode
}

function filterOptions(options: EntityOption[], query: string): EntityOption[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return options
  return options.filter(
    option =>
      option.primary.toLowerCase().includes(trimmed) ||
      option.secondary.toLowerCase().includes(trimmed),
  )
}

interface CopyIdButtonProps {
  value: string
  ariaLabel: string
}

function CopyIdButton({ value, ariaLabel }: CopyIdButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied'>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const handleClick = useCallback(async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setStatus('copied')
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setStatus('idle')
      }, 1500)
    } catch {
      // Clipboard unavailable
    }
  }, [value])

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={handleClick}
      disabled={!value}
      aria-label={ariaLabel}
    >
      {status === 'copied' ? 'Copied' : 'Copy ID'}
    </button>
  )
}

function EntityCombobox({
  label,
  value,
  options,
  isLoading,
  placeholder,
  useFallback,
  onChange,
  trailing,
}: EntityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const optionRefs = useRef<Array<HTMLLIElement | null>>([])
  const inputId = `entity-${label.toLowerCase().replace(/\s+/g, '-')}-input`
  const optionId = (index: number) => `${inputId}-option-${index}`

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  const matched = useMemo(() => options.find(option => option.value === value), [options, value])
  const filtered = useMemo(() => filterOptions(options, query), [options, query])

  useEffect(() => {
    if (!isOpen) return
    const selectedIdx = filtered.findIndex(option => option.value === value)
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setActiveIndex(idx => {
      if (filtered.length === 0) return 0
      return Math.min(Math.max(idx, 0), filtered.length - 1)
    })
  }, [filtered.length])

  useEffect(() => {
    if (!isOpen) return
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen])

  if (useFallback) {
    return (
      <div className={styles.field}>
        <label htmlFor={inputId}>{label}</label>
        <div className={styles.copyRow}>
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={e => {
              onChange(e.target.value)
            }}
            placeholder={placeholder}
          />
          {trailing}
        </div>
      </div>
    )
  }

  const handleInputChange = (next: string) => {
    setQuery(next)
    onChange(next)
    setActiveIndex(0)
    if (!isOpen) setIsOpen(true)
  }

  const handleSelect = (option: EntityOption) => {
    onChange(option.value)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      if (filtered.length === 0) return
      setActiveIndex(idx => (idx + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      if (filtered.length === 0) return
      setActiveIndex(idx => (idx - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      if (isOpen && filtered[activeIndex]) {
        e.preventDefault()
        handleSelect(filtered[activeIndex])
      }
    } else if (e.key === 'Home' && isOpen) {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End' && isOpen) {
      e.preventDefault()
      setActiveIndex(Math.max(filtered.length - 1, 0))
    }
  }

  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>{label}</label>
      <div className={styles.copyRow}>
        <div className={styles.selectWrapper} ref={wrapperRef}>
          <div className={styles.comboboxInputWrapper}>
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              value={isOpen ? query : value}
              placeholder={value ? '' : placeholder}
              onFocus={() => {
                setQuery('')
              }}
              onMouseDown={() => {
                setIsOpen(open => !open)
              }}
              onChange={e => {
                handleInputChange(e.target.value)
              }}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={`${inputId}-listbox`}
              aria-activedescendant={
                isOpen && filtered[activeIndex] ? optionId(activeIndex) : undefined
              }
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
            />
            <button
              type="button"
              className={styles.comboboxChevron}
              tabIndex={-1}
              aria-label={isOpen ? 'Close options' : 'Open options'}
              onClick={() => {
                setIsOpen(open => !open)
                if (!isOpen) inputRef.current?.focus()
              }}
            >
              ▾
            </button>
          </div>

          {isOpen && (
            <ul
              id={`${inputId}-listbox`}
              className={styles.selectMenu}
              role="listbox"
              aria-label={label}
            >
              {isLoading && options.length === 0 ? (
                <li className={styles.selectStatus}>Loading…</li>
              ) : filtered.length === 0 ? (
                <li className={styles.selectStatus}>
                  {options.length === 0 ? 'No options available' : 'No matches'}
                </li>
              ) : (
                filtered.map((option, index) => {
                  const isSelected = option.value === value
                  const isActive = index === activeIndex
                  return (
                    <li
                      key={option.value}
                      id={optionId(index)}
                      ref={el => {
                        optionRefs.current[index] = el
                      }}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <button
                        type="button"
                        className={`${styles.selectOption} ${isActive ? styles.selectOptionActive : ''}`}
                        onMouseDown={e => {
                          e.preventDefault()
                        }}
                        onMouseEnter={() => {
                          setActiveIndex(index)
                        }}
                        onClick={() => {
                          handleSelect(option)
                        }}
                      >
                        <span className={styles.optionPrimaryRow}>
                          <span className={styles.optionPrimary}>{option.primary}</span>
                          {option.badge && (
                            <span
                              className={`${styles.optionBadge} ${
                                option.badge.tone === 'processed'
                                  ? styles.optionBadgeProcessed
                                  : styles.optionBadgeUnprocessed
                              }`}
                            >
                              {option.badge.label}
                            </span>
                          )}
                        </span>
                        <span className={styles.optionSecondary}>{option.secondary}</span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          )}
        </div>
        {trailing}
      </div>
      {matched && (
        <div
          className={`${styles.helperLine} ${isOpen ? styles.helperLineHidden : ''}`}
          aria-hidden={isOpen}
        >
          {matched.primary}
        </div>
      )}
    </div>
  )
}

export function DemoSettingsPanel({
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
  entityCatalog,
  mode,
  manualConfig,
  manualSaves,
  onSwitchToAuto,
  onApplyManualConfig,
  onSaveManualConfig,
  onDeleteManualSave,
  chromeId,
  onChromeIdChange,
}: DemoSettingsPanelProps) {
  const currentDemoType = import.meta.env.VITE_DEMO_TYPE || 'react_sdk_demo_company_onboarded'
  const [selectedDemoType, setSelectedDemoType] = useState(currentDemoType)
  const confirmedSnapshot = useRef(entities)
  const [manualDraft, setManualDraft] = useState<ManualConfig>(manualConfig)
  const [manualSubmitting, setManualSubmitting] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)
  const [manualBanner, setManualBanner] = useState<string | null>(null)
  const [tabMode, setTabMode] = useState<AppMode>(mode)
  const [selectedSaveName, setSelectedSaveName] = useState<string>('')
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState('')

  const saveNames = Object.keys(manualSaves).sort((a, b) => a.localeCompare(b))

  useEffect(() => {
    setManualDraft(manualConfig)
  }, [manualConfig])

  useEffect(() => {
    setTabMode(mode)
  }, [mode])

  const env = typeof __SDK_APP_ENV__ !== 'undefined' ? __SDK_APP_ENV__ : 'demo'
  const build = typeof __SDK_APP_BUILD__ !== 'undefined' ? __SDK_APP_BUILD__ : 'dev'
  const buildProxyMode =
    typeof __SDK_APP_PROXY_MODE__ !== 'undefined' ? __SDK_APP_PROXY_MODE__ : proxyMode

  const isManual = mode === 'manual'
  const showManualPanel = tabMode === 'manual'
  const isFlowTokenMode = !showManualPanel && buildProxyMode === 'flow-token'
  const displayProxyMode = isManual ? 'manual' : buildProxyMode

  const hasChanges =
    entities.employeeId !== confirmedSnapshot.current.employeeId ||
    entities.contractorId !== confirmedSnapshot.current.contractorId ||
    entities.payrollId !== confirmedSnapshot.current.payrollId ||
    TEXT_FIELDS.some(({ key }) => entities[key] !== confirmedSnapshot.current[key])

  const displayEnv = env === 'localzp' ? 'local' : env

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>Demo Settings</h2>
        <button className={styles.close} onClick={onClose} type="button">
          &times;
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.section}>
          <h3>Mode</h3>
          <div className={styles.modeToggle} role="tablist" aria-label="App mode">
            <button
              type="button"
              role="tab"
              aria-selected={!showManualPanel}
              className={`${styles.modeToggleBtn} ${!showManualPanel ? styles.modeToggleBtnActive : ''}`}
              onClick={() => {
                setTabMode('auto')
                setManualError(null)
                setManualBanner(null)
                if (isManual) {
                  void (async () => {
                    try {
                      await onSwitchToAuto()
                    } catch (err) {
                      setManualError(err instanceof Error ? err.message : String(err))
                    }
                  })()
                }
              }}
            >
              Auto
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showManualPanel}
              className={`${styles.modeToggleBtn} ${showManualPanel ? styles.modeToggleBtnActive : ''}`}
              onClick={() => {
                setTabMode('manual')
                if (!isManual) setManualBanner('Paste a flow token + company ID, then Apply.')
              }}
            >
              Manual
            </button>
          </div>
          <div className={`${styles.info} ${styles.modeHint}`}>
            {showManualPanel
              ? isManual
                ? 'Manual mode is active. Token polling and auto-provisioning are disabled.'
                : 'Configure a token + IDs below, then click Apply to switch to Manual mode.'
              : 'Auto mode auto-provisions demo tokens through GWS-Flows.'}
          </div>
        </div>

        {showManualPanel && (
          <div className={styles.section}>
            <h3>Manual Token</h3>
            <div className={`${styles.info} ${styles.infoSpaced}`}>
              Token must be valid for the active host (set at startup; can&apos;t be changed without
              restarting the dev server).
            </div>

            <div className={styles.field}>
              <label htmlFor="manual-save-select">Saved Presets</label>
              <div className={styles.copyRow}>
                <select
                  id="manual-save-select"
                  value={selectedSaveName}
                  onChange={e => {
                    const next = e.target.value
                    setSelectedSaveName(next)
                    if (next && manualSaves[next]) {
                      setManualDraft(manualSaves[next])
                      setManualError(null)
                      setManualBanner(`Loaded preset "${next}". Click Apply to activate.`)
                    }
                  }}
                >
                  <option value="">— Select a preset —</option>
                  {saveNames.map(name => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  className={styles.btn}
                  type="button"
                  onClick={() => {
                    setSaveDialogName(selectedSaveName)
                    setSaveDialogOpen(true)
                  }}
                  disabled={!manualDraft.flowToken || !manualDraft.companyId}
                  title="Save current fields as a named preset"
                >
                  Save…
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  type="button"
                  disabled={!selectedSaveName}
                  onClick={() => {
                    if (!selectedSaveName) return
                    onDeleteManualSave(selectedSaveName)
                    setSelectedSaveName('')
                    setManualBanner(`Deleted preset "${selectedSaveName}".`)
                  }}
                  title="Delete the selected preset"
                >
                  Delete
                </button>
              </div>
            </div>

            {saveDialogOpen && (
              <div className={styles.field}>
                <label htmlFor="manual-save-name-input">Preset name</label>
                <div className={styles.copyRow}>
                  <input
                    id="manual-save-name-input"
                    type="text"
                    value={saveDialogName}
                    onChange={e => {
                      setSaveDialogName(e.target.value)
                    }}
                    placeholder="e.g. Acme Test"
                    ref={el => {
                      if (el && document.activeElement !== el) el.focus()
                    }}
                  />
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    type="button"
                    disabled={!saveDialogName.trim()}
                    onClick={() => {
                      const name = saveDialogName.trim()
                      onSaveManualConfig(name, manualDraft)
                      setSelectedSaveName(name)
                      setSaveDialogOpen(false)
                      setSaveDialogName('')
                      setManualBanner(`Saved preset "${name}".`)
                    }}
                  >
                    Save
                  </button>
                  <button
                    className={styles.btn}
                    type="button"
                    onClick={() => {
                      setSaveDialogOpen(false)
                      setSaveDialogName('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {manualBanner && (
              <div className={`${styles.info} ${styles.modeHint}`}>{manualBanner}</div>
            )}
            {MANUAL_FIELDS.map(({ key, label, required }) => {
              const inputId = `manual-${key}-input`
              return (
                <div key={key} className={styles.field}>
                  <label htmlFor={inputId}>
                    {label}
                    {required && <span aria-hidden="true"> *</span>}
                  </label>
                  <input
                    id={inputId}
                    type="text"
                    value={manualDraft[key]}
                    onChange={e => {
                      setManualDraft(prev => ({ ...prev, [key]: e.target.value.trim() }))
                      if (selectedSaveName) setSelectedSaveName('')
                    }}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    autoComplete="off"
                    spellCheck={false}
                    data-1p-ignore="true"
                    data-lpignore="true"
                  />
                </div>
              )
            })}
            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                type="button"
                disabled={manualSubmitting || !manualDraft.flowToken || !manualDraft.companyId}
                onClick={() => {
                  void (async () => {
                    setManualSubmitting(true)
                    setManualError(null)
                    setManualBanner(null)
                    try {
                      await onApplyManualConfig(manualDraft)
                      setManualBanner('Manual config applied.')
                    } catch (err) {
                      setManualError(err instanceof Error ? err.message : String(err))
                    } finally {
                      setManualSubmitting(false)
                    }
                  })()
                }}
              >
                {manualSubmitting ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {manualError && <div className={styles.error}>{manualError}</div>}
          </div>
        )}

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

        {!showManualPanel && (
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
                <CopyIdButton value={entities.companyId} ariaLabel="Copy company ID" />
              </div>
            </div>

            <EntityCombobox
              label="Employee"
              value={entities.employeeId}
              options={entityCatalog.employees}
              isLoading={entityCatalog.isLoading}
              placeholder="Search or paste an employee id..."
              useFallback={!isFlowTokenMode}
              onChange={value => {
                onUpdateEntity('employeeId', value)
              }}
              trailing={<CopyIdButton value={entities.employeeId} ariaLabel="Copy employee ID" />}
            />

            <EntityCombobox
              label="Contractor"
              value={entities.contractorId}
              options={entityCatalog.contractors}
              isLoading={entityCatalog.isLoading}
              placeholder="Search or paste a contractor id..."
              useFallback={!isFlowTokenMode}
              onChange={value => {
                onUpdateEntity('contractorId', value)
              }}
              trailing={
                <CopyIdButton value={entities.contractorId} ariaLabel="Copy contractor ID" />
              }
            />

            <EntityCombobox
              label="Payroll"
              value={entities.payrollId}
              options={entityCatalog.payrolls}
              isLoading={entityCatalog.isLoading}
              placeholder="Search or paste a payroll id..."
              useFallback={!isFlowTokenMode}
              onChange={value => {
                onUpdateEntity('payrollId', value)
              }}
              trailing={<CopyIdButton value={entities.payrollId} ariaLabel="Copy payroll ID" />}
            />

            {TEXT_FIELDS.map(({ key, label }) => {
              const inputId = `entity-${key}-input`
              return (
                <div key={key} className={styles.field}>
                  <label htmlFor={inputId}>{label}</label>
                  <div className={styles.copyRow}>
                    <input
                      id={inputId}
                      type="text"
                      value={entities[key]}
                      onChange={e => {
                        onUpdateEntity(key, e.target.value)
                      }}
                      placeholder={`Enter ${label.toLowerCase()}...`}
                    />
                    <CopyIdButton value={entities[key]} ariaLabel={`Copy ${label.toLowerCase()}`} />
                  </div>
                </div>
              )
            })}

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
        )}

        <div className={styles.section}>
          <h3>Chrome</h3>
          <div className={styles.field}>
            <label htmlFor="demo-chrome-select">Demo chrome</label>
            <select
              id="demo-chrome-select"
              value={chromeId}
              onChange={e => {
                onChromeIdChange(e.target.value)
              }}
            >
              {demoChromes.map(entry => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.info}>
            {demoChromes.find(entry => entry.id === chromeId)?.description}
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
              Proxy: <code>{displayProxyMode}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
