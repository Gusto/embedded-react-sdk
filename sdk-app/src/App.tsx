import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { DemoSettingsPanel } from './DemoSettingsPanel'
import { TokenExpiredOverlay } from './TokenExpiredOverlay'
import { useEntities } from './useEntities'
import { useDemoManager } from './useDemoManager'
import { useAppMode } from './useAppMode'
import { useThemeMode } from './useThemeMode'
import { ThemeModeProvider } from './ThemeModeContext'

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { entities, updateEntity, replaceEntities, resetToDefaults } = useEntities()
  const demoManager = useDemoManager()
  const mode = useAppMode()
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

  return (
    <ThemeModeProvider value={themeMode}>
      <div className="app-layout">
        <TopBar
          companyId={entities.companyId}
          tokenStatus={demoManager.tokenStatus}
          onOpenSettings={() => {
            setSettingsOpen(true)
          }}
        />
        <div className="app-body">
          <Sidebar
            mode={mode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isOpen={sidebarOpen}
            onToggle={() => {
              setSidebarOpen(open => !open)
            }}
          />
          <main className="main-content">
            <Outlet context={{ entities }} />
          </main>
        </div>
        <DemoSettingsPanel
          isOpen={settingsOpen}
          onClose={() => {
            setSettingsOpen(false)
          }}
          entities={entities}
          onUpdateEntity={updateEntity}
          onResetToDefaults={resetToDefaults}
          tokenStatus={demoManager.tokenStatus}
          isCreatingDemo={demoManager.isCreatingDemo}
          demoError={demoManager.demoError}
          proxyMode={demoManager.proxyMode}
          onCreateNewDemo={handleCreateNewDemo}
          onRefreshToken={demoManager.refreshToken}
        />
        {demoManager.tokenStatus === 'expired' && (
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
