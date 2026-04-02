import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { DemoSettingsPanel } from './DemoSettingsPanel'
import { useEntities } from './useEntities'
import { useDemoManager } from './useDemoManager'

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { entities, updateEntity, replaceEntities, resetToDefaults } = useEntities()
  const demoManager = useDemoManager()

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
    <div className="app-layout">
      <TopBar
        companyId={entities.companyId}
        tokenStatus={demoManager.tokenStatus}
        onOpenSettings={() => {
          setSettingsOpen(true)
        }}
      />
      <div className="app-body">
        <Sidebar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
    </div>
  )
}
