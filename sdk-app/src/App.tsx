import type React from 'react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { DemoSettingsPanel } from './DemoSettingsPanel'
import { TokenExpiredOverlay } from './TokenExpiredOverlay'
import { useEntities, type EntityIds } from './useEntities'
import { useEntityCatalog } from './useEntityCatalog'
import { useDemoManager } from './useDemoManager'
import { useAppMode } from './useAppMode'
import { useThemeMode } from './useThemeMode'
import { ThemeModeProvider } from './ThemeModeContext'
import { useManualConfig, type ManualConfig } from './useManualConfig'

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

  return (
    <ThemeModeProvider value={themeMode}>
      <div className="app-layout">
        <TopBar
          companyId={activeEntities.companyId}
          tokenStatus={demoManager.tokenStatus}
          onOpenSettings={() => {
            setSettingsOpen(true)
          }}
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
          />
          <main
            className="main-content"
            style={
              { '--sidebar-width': sidebarOpen ? '16.25rem' : '2.75rem' } as React.CSSProperties
            }
          >
            <Outlet context={{ entities: activeEntities }} />
          </main>
        </div>
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
          onSwitchToAuto={manual.switchToAuto}
          onApplyManualConfig={handleApplyManualConfig}
        />
        {!isManual && demoManager.tokenStatus === 'expired' && (
          <TokenExpiredOverlay
            onRefresh={demoManager.refreshToken}
            isRefreshing={demoManager.isCreatingDemo}
            error={demoManager.demoError}
          />
        )}
      </div>
    </ThemeModeProvider>
  )
}
