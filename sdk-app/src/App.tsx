import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { CommandPalette, useCommandPalette, useCommands, PAGES } from './CommandPalette'
import { useGlobalShortcut } from './useGlobalShortcut'
import { useCodePanel } from './useCodePanel'
import { CodePanel } from './CodePanel'
import { CurrentComponentProvider } from './CurrentComponentContext'
import { useDemoChrome } from './useDemoChrome'
import { findDemoChrome, SDK_NATIVE_CHROME_ID } from './demoChromes/registry'
import {
  ThemePanel,
  useThemePanel,
  ThemeEditorContext,
  useThemeEditorState,
  DesignSystemContext,
  useDesignSystemState,
} from './ThemePanel'
import { RightPanelShell } from './RightPanelShell'
import { CommentsProvider, CommentLayer, CommentControls } from './design/comments'
import { useComments } from './design/comments/CommentsContext'
import { BreakpointSwitcher } from './design/BreakpointSwitcher'
import { useViewportBreakpoint } from './design/useViewportBreakpoint'
import type { BreakpointOption } from './design/breakpointConstants'

const THEME_CYCLE: ThemeMode[] = ['system', 'light', 'dark']

/**
 * App-wide viewport switcher. Rendered inside CommentsProvider so it can slide
 * clear of the comments tray drawer when it's open.
 */
function ViewportSwitcher({
  breakpoint,
  onChange,
}: {
  breakpoint: BreakpointOption
  onChange: (key: BreakpointOption) => void
}) {
  const { trayOpen } = useComments()
  return (
    <div className={`viewport-switcher${trayOpen ? ' viewport-switcher-shifted' : ''}`}>
      <BreakpointSwitcher value={breakpoint} onChange={onChange} />
    </div>
  )
}

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
  const activeEntities = useMemo(
    () => (isManual ? entitiesFromManualConfig(manual.config) : entities),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isManual,
      entities,
      manual.config.companyId,
      manual.config.employeeId,
      manual.config.contractorId,
      manual.config.payrollId,
      manual.config.formId,
      manual.config.requestId,
    ],
  )
  const entityCatalog = useEntityCatalog(isManual ? '' : entities.companyId)
  const demoManager = useDemoManager({ pollingDisabled: isManual })
  const appMode = useAppMode()
  const themeMode = useThemeMode()
  const chromeVisibility = useChromeVisibility()
  const { chromeHidden, showChrome } = chromeVisibility
  const shortcutHelper = useShortcutHelper()
  const commandPalette = useCommandPalette()
  const navigate = useNavigate()
  const codePanel = useCodePanel()
  const themePanel = useThemePanel()
  const themeEditorState = useThemeEditorState()
  const designSystemState = useDesignSystemState()
  const { chromeId, setChromeId } = useDemoChrome()
  const customChrome = chromeId !== SDK_NATIVE_CHROME_ID ? findDemoChrome(chromeId) : undefined
  const mainRef = useRef<HTMLElement>(null)
  const viewport = useViewportBreakpoint()

  const activePanel: 'theme' | 'settings' | 'code' | null = codePanel.isOpen
    ? 'code'
    : themePanel.isOpen
      ? 'theme'
      : settingsOpen
        ? 'settings'
        : null

  const togglePanel = useCallback(
    (panel: 'theme' | 'settings' | 'code') => {
      if (panel === 'code') {
        themePanel.close()
        setSettingsOpen(false)
        codePanel.toggle()
      } else if (panel === 'theme') {
        codePanel.close()
        setSettingsOpen(false)
        themePanel.toggle()
      } else {
        codePanel.close()
        themePanel.close()
        setSettingsOpen(prev => !prev)
      }
    },
    [codePanel, themePanel],
  )

  const openSettings = useCallback(() => {
    codePanel.close()
    themePanel.close()
    setSettingsOpen(true)
  }, [codePanel, themePanel])

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
      togglePanel('settings')
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
  useGlobalShortcut({
    key: 'b',
    modifier: 'mod',
    onTrigger: event => {
      event.preventDefault()
      setSidebarOpen(open => !open)
    },
  })

  useEffect(() => {
    if (codePanel.isOpen && settingsOpen) setSettingsOpen(false)
    if (codePanel.isOpen && themePanel.isOpen) themePanel.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codePanel.isOpen])

  useEffect(() => {
    if (settingsOpen && codePanel.isOpen) codePanel.close()
    if (settingsOpen && themePanel.isOpen) themePanel.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen])

  useEffect(() => {
    if (themePanel.isOpen && codePanel.isOpen) codePanel.close()
    if (themePanel.isOpen && settingsOpen) setSettingsOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themePanel.isOpen])

  const handleCreateNewDemo = useCallback(
    async (demoType: string) => {
      const result = await demoManager.createNewDemo(demoType)
      if (result) {
        replaceEntities({
          companyId: result.companyId || '',
          employeeId: result.entities.employeeId || '',
          contractorId: result.entities.contractorId || '',
          payrollId: result.entities.payrollId || '',
          formId: result.entities.formId || '',
          requestId: '',
        })
        window.location.reload()
      }
    },
    [demoManager, replaceEntities],
  )

  const handleApplyManualConfig = async (next: ManualConfig) => {
    await manual.applyManualConfig(next)
    replaceEntities(entitiesFromManualConfig(next))
  }

  const onCreateNewDemoCommand = useCallback(
    (demoType: string) => {
      void handleCreateNewDemo(demoType)
    },
    [handleCreateNewDemo],
  )

  const commands = useCommands({
    themeMode,
    cycleTheme,
    appMode,
    toggleAppMode,
    codePanel,
    chromeVisibility,
    settingsOpen,
    setSettingsOpen,
    sidebarOpen,
    setSidebarOpen,
    chromeId,
    setChromeId,
    designSystem: designSystemState.designSystem,
    setDesignSystem: designSystemState.setDesignSystem,
    demoManager,
    manualMode: manual.mode,
    switchToAuto: manual.switchToAuto,
    shortcutHelper,
    onCreateNewDemo: onCreateNewDemoCommand,
    resetEntitiesToDefaults: resetToDefaults,
  })

  const paletteEntries = useMemo(() => [...PAGES, ...commands], [commands])

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

  const panelsOpen = codePanel.isOpen || themePanel.isOpen || settingsOpen
  const panelsContent = (
    <>
      {codePanel.isOpen && <CodePanel onClose={codePanel.close} />}
      {themePanel.isOpen && <ThemePanel onClose={themePanel.close} />}
      {settingsOpen && (
        <DemoSettingsPanel
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
      )}
    </>
  )

  const outletEl = <Outlet context={{ entities: activeEntities, chromeHidden }} />
  const chromedOutlet = customChrome ? (
    <customChrome.Chrome onOpenSettings={openSettings}>{outletEl}</customChrome.Chrome>
  ) : (
    outletEl
  )
  // Design routes constrain their own preview column (DesignLayout); everywhere
  // else the switcher constrains the whole content area via a centered frame.
  const framedOutlet =
    appMode === 'design' ? (
      chromedOutlet
    ) : (
      <div
        className="viewport-frame"
        style={viewport.maxWidth ? { maxWidth: viewport.maxWidth } : undefined}
      >
        {chromedOutlet}
      </div>
    )
  const mainEl = (
    <main
      ref={mainRef}
      className="main-content"
      style={{ '--sidebar-width': sidebarWidth } as React.CSSProperties}
    >
      {framedOutlet}
      <CommentLayer containerRef={mainRef} />
    </main>
  )

  const bodyEl = chromeHidden ? (
    mainEl
  ) : (
    <>
      <TopBar
        companyId={activeEntities.companyId}
        tokenStatus={demoManager.tokenStatus}
        activePanel={activePanel}
        onPanelToggle={togglePanel}
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
        {panelsOpen && <RightPanelShell>{panelsContent}</RightPanelShell>}
      </div>
    </>
  )

  return (
    <ThemeModeProvider value={themeMode}>
      <ThemeEditorContext.Provider value={themeEditorState}>
        <DesignSystemContext.Provider value={designSystemState}>
          <CurrentComponentProvider>
            <CommentsProvider>
              <div className={`app-layout${chromeHidden ? ' app-layout-chrome-hidden' : ''}`}>
                {bodyEl}
                {chromeHidden && panelsOpen && (
                  <RightPanelShell floating>{panelsContent}</RightPanelShell>
                )}
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
                <ShortcutHelper isOpen={shortcutHelper.isOpen} onClose={shortcutHelper.close} />
                <CommandPalette
                  isOpen={commandPalette.isOpen}
                  onClose={commandPalette.close}
                  entries={paletteEntries}
                />
                {!isManual && demoManager.tokenStatus === 'expired' && (
                  <TokenExpiredOverlay
                    onRefresh={demoManager.refreshToken}
                    isRefreshing={demoManager.isCreatingDemo}
                    error={demoManager.demoError}
                  />
                )}
                <CommentControls />
                <ViewportSwitcher
                  breakpoint={viewport.breakpoint}
                  onChange={viewport.setBreakpoint}
                />
              </div>
            </CommentsProvider>
          </CurrentComponentProvider>
        </DesignSystemContext.Provider>
      </ThemeEditorContext.Provider>
    </ThemeModeProvider>
  )
}
