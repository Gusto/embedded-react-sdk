import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { DemoSettingsPanel } from './DemoSettingsPanel'
import { TokenExpiredOverlay } from './TokenExpiredOverlay'
import { useEntities, type EntityIds } from './useEntities'
import { useEntityCatalog } from './useEntityCatalog'
import { useDemoManager } from './useDemoManager'
import { useAppMode } from './useAppMode'
import { useThemeMode, type ThemeMode } from './useThemeMode'
import { ThemeModeProvider } from './ThemeModeContext'
import { useManualConfig, type ManualConfig } from './useManualConfig'
import { useChromeVisibility } from './useChromeVisibility'
import { ShortcutHelper, useShortcutHelper } from './ShortcutHelper'
import { useGlobalShortcut } from './useGlobalShortcut'
import { useCodePanel } from './useCodePanel'
import { CodePanel } from './CodePanel'
import { CurrentComponentProvider } from './CurrentComponentContext'
import { useDemoChrome } from './useDemoChrome'
import { findDemoChrome, SDK_NATIVE_CHROME_ID } from './demoChromes/registry'

const THEME_CYCLE: ThemeMode[] = ['system', 'light', 'dark']

function entitiesFromManualConfig(config: ManualConfig): EntityIds {
  return {
    companyId: config.companyId,
    employeeId: config.employeeId,
    contractorId: config.contractorId,
    payrollId: config.payrollId,
    formId: config.formId,
    requestId: config.requestId,
  }
}

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const manual = useManualConfig()
  const isManual = manual.mode === 'manual'
  const { entities, updateEntity, replaceEntities, resetToDefaults } = useEntities()
  const activeEntities = isManual ? entitiesFromManualConfig(manual.config) : entities
  const entityCatalog = useEntityCatalog(isManual ? '' : entities.companyId)
  const demoManager = useDemoManager({ pollingDisabled: isManual })
  const appMode = useAppMode()
  const themeMode = useThemeMode()
  const { chromeHidden, showChrome } = useChromeVisibility()
  const shortcutHelper = useShortcutHelper()
  const navigate = useNavigate()
  const codePanel = useCodePanel()
  const { chromeId, setChromeId } = useDemoChrome()
  const customChrome = chromeId !== SDK_NATIVE_CHROME_ID ? findDemoChrome(chromeId) : undefined

  const openSettings = useCallback(() => {
    setSettingsOpen(true)
  }, [])

  const toggleAppMode = useCallback(() => {
    void navigate(appMode === 'design' ? '/' : '/design')
  }, [navigate, appMode])

  const cycleTheme = useCallback(() => {
    const current = THEME_CYCLE.indexOf(themeMode.mode)
    const next = THEME_CYCLE[(current + 1) % THEME_CYCLE.length]
    if (next) themeMode.setMode(next)
  }, [themeMode])

  useGlobalShortcut({
    key: ',',
    modifier: 'mod',
    onTrigger: event => {
      event.preventDefault()
      openSettings()
    },
  })
  useGlobalShortcut({
    key: '.',
    modifier: 'mod',
    onTrigger: event => {
      event.preventDefault()
      toggleAppMode()
    },
  })
  useGlobalShortcut({
    key: ';',
    modifier: 'mod',
    onTrigger: event => {
      event.preventDefault()
      cycleTheme()
    },
  })

  useEffect(() => {
    if (codePanel.isOpen && settingsOpen) setSettingsOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codePanel.isOpen])

  useEffect(() => {
    if (settingsOpen && codePanel.isOpen) codePanel.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen])

  const handleCreateNewDemo = async (demoType: string) => {
    const result = await demoManager.createNewDemo(demoType)
    if (result) {
      replaceEntities({
        companyId: result.companyId || '',
        employeeId: result.entities.employeeId || '',
        contractorId: result.entities.contractorId || '',
        payrollId: result.entities.payrollId || '',
        requestId: '',
      })
      window.location.reload()
    }
  }

  const handleApplyManualConfig = async (next: ManualConfig) => {
    await manual.applyManualConfig(next)
    replaceEntities(entitiesFromManualConfig(next))
  }

  if (!manual.isReady) {
    return (
      <ThemeModeProvider value={themeMode}>
        <div className="app-layout">
          <div style={{ padding: '2rem', fontSize: '0.875rem' }}>
            Restoring manual configuration…
          </div>
        </div>
      </ThemeModeProvider>
    )
  }

  const sidebarWidth = chromeHidden ? '0rem' : sidebarOpen ? '16.25rem' : '2.75rem'

  const outletEl = <Outlet context={{ entities: activeEntities, chromeHidden }} />
  const chromedOutlet = customChrome ? (
    <customChrome.Chrome onOpenSettings={openSettings}>{outletEl}</customChrome.Chrome>
  ) : (
    outletEl
  )
  const mainEl = (
    <main
      className="main-content"
      style={{ '--sidebar-width': sidebarWidth } as React.CSSProperties}
    >
      {chromedOutlet}
    </main>
  )

  const bodyEl = chromeHidden ? (
    mainEl
  ) : (
    <>
      <TopBar
        companyId={activeEntities.companyId}
        tokenStatus={demoManager.tokenStatus}
        onOpenSettings={openSettings}
        onToggleCode={codePanel.toggle}
        codeOpen={codePanel.isOpen}
      />
      <div className="app-body">
        <Sidebar
          mode={appMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isOpen={sidebarOpen}
          onToggle={() => {
            setSidebarOpen(open => !open)
          }}
          onShowShortcuts={shortcutHelper.open}
        />
        {mainEl}
        {codePanel.isOpen && <CodePanel onClose={codePanel.close} />}
      </div>
    </>
  )

  return (
    <ThemeModeProvider value={themeMode}>
      <CurrentComponentProvider>
        <div className={`app-layout${chromeHidden ? ' app-layout-chrome-hidden' : ''}`}>
          {bodyEl}
          {chromeHidden && (
            <button
              type="button"
              className="chrome-restore-pill"
              onClick={showChrome}
              aria-label="Show chrome"
            >
              <span className="chrome-restore-pill-key">\</span> Show chrome
            </button>
          )}
          <DemoSettingsPanel
            isOpen={settingsOpen}
            onClose={() => {
              setSettingsOpen(false)
            }}
            entities={activeEntities}
            onUpdateEntity={updateEntity}
            onResetToDefaults={resetToDefaults}
            tokenStatus={demoManager.tokenStatus}
            isCreatingDemo={demoManager.isCreatingDemo}
            demoError={demoManager.demoError}
            proxyMode={demoManager.proxyMode}
            onCreateNewDemo={handleCreateNewDemo}
            onRefreshToken={demoManager.refreshToken}
            entityCatalog={entityCatalog}
            mode={manual.mode}
            manualConfig={manual.config}
            manualSaves={manual.saves}
            onSwitchToAuto={manual.switchToAuto}
            onApplyManualConfig={handleApplyManualConfig}
            onSaveManualConfig={manual.saveConfig}
            onDeleteManualSave={manual.deleteSave}
            chromeId={chromeId}
            onChromeIdChange={setChromeId}
          />
          <ShortcutHelper isOpen={shortcutHelper.isOpen} onClose={shortcutHelper.close} />
          {!isManual && demoManager.tokenStatus === 'expired' && (
            <TokenExpiredOverlay
              onRefresh={demoManager.refreshToken}
              isRefreshing={demoManager.isCreatingDemo}
              error={demoManager.demoError}
            />
          )}
        </div>
      </CurrentComponentProvider>
    </ThemeModeProvider>
  )
}
