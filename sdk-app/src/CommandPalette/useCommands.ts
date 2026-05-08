import { type Dispatch, type SetStateAction, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoChromes } from '../demoChromes/registry'
import type { ThemeMode } from '../useThemeMode'
import type { TokenStatus } from '../useDemoManager'
import type { AppMode as DemoMode } from '../useManualConfig'
import type { DesignSystem } from '../ThemePanel/DesignSystemContext'
import { DESIGN_SYSTEM_OPTIONS } from '../ThemePanel/designSystemOptions'
import type { ActionEntry } from './pages'

export interface UseCommandsArgs {
  themeMode: { mode: ThemeMode; setMode: (next: ThemeMode) => void }
  cycleTheme: () => void
  appMode: 'preview' | 'design'
  toggleAppMode: () => void
  codePanel: { isOpen: boolean; open: () => void; close: () => void; toggle: () => void }
  chromeVisibility: { chromeHidden: boolean; toggleChrome: () => void; showChrome: () => void }
  settingsOpen: boolean
  setSettingsOpen: Dispatch<SetStateAction<boolean>>
  sidebarOpen: boolean
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
  chromeId: string
  setChromeId: (next: string) => void
  designSystem: DesignSystem
  setDesignSystem: (next: DesignSystem) => void
  demoManager: { tokenStatus: TokenStatus; refreshToken: () => void }
  manualMode: DemoMode
  switchToAuto: () => void
  shortcutHelper: { open: () => void }
  onCreateNewDemo: (demoType: string) => void
  resetEntitiesToDefaults: () => void
}

export function useCommands(args: UseCommandsArgs): ActionEntry[] {
  const navigate = useNavigate()
  const {
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
    designSystem,
    setDesignSystem,
    demoManager,
    manualMode,
    switchToAuto,
    shortcutHelper,
    onCreateNewDemo,
    resetEntitiesToDefaults,
  } = args

  return useMemo(() => {
    const out: ActionEntry[] = []

    if (themeMode.mode !== 'light') {
      out.push({
        kind: 'action',
        id: 'action:theme:light',
        label: 'Switch to Light Theme',
        category: 'Theme',
        keywords: ['appearance', 'color', 'mode'],
        perform: () => {
          themeMode.setMode('light')
        },
      })
    }
    if (themeMode.mode !== 'dark') {
      out.push({
        kind: 'action',
        id: 'action:theme:dark',
        label: 'Switch to Dark Theme',
        category: 'Theme',
        keywords: ['appearance', 'color', 'mode'],
        perform: () => {
          themeMode.setMode('dark')
        },
      })
    }
    if (themeMode.mode !== 'system') {
      out.push({
        kind: 'action',
        id: 'action:theme:system',
        label: 'Switch to System Color Mode',
        category: 'Theme',
        keywords: ['appearance', 'color', 'auto', 'os'],
        perform: () => {
          themeMode.setMode('system')
        },
      })
    }
    out.push({
      kind: 'action',
      id: 'action:theme:cycle',
      label: 'Cycle Theme',
      category: 'Theme',
      description: 'Cycle through System → Light → Dark',
      keywords: ['next', 'rotate', 'appearance'],
      perform: cycleTheme,
    })

    if (appMode === 'design') {
      out.push({
        kind: 'action',
        id: 'action:appmode:dev',
        label: 'Switch to Development Mode',
        category: 'App Mode',
        keywords: ['preview', 'components', 'dev'],
        perform: () => {
          void navigate('/')
        },
      })
    } else {
      out.push({
        kind: 'action',
        id: 'action:appmode:design',
        label: 'Switch to Design Mode',
        category: 'App Mode',
        keywords: ['design system', 'tokens'],
        perform: () => {
          void navigate('/design')
        },
      })
    }
    out.push({
      kind: 'action',
      id: 'action:appmode:toggle',
      label: 'Toggle App Mode',
      category: 'App Mode',
      keywords: ['development', 'design', 'switch'],
      perform: toggleAppMode,
    })

    if (codePanel.isOpen) {
      out.push({
        kind: 'action',
        id: 'action:codepanel:close',
        label: 'Close Code Panel',
        category: 'Panels',
        keywords: ['hide', 'snippet', 'source'],
        perform: codePanel.close,
      })
    } else {
      out.push({
        kind: 'action',
        id: 'action:codepanel:open',
        label: 'Open Code Panel',
        category: 'Panels',
        keywords: ['show', 'snippet', 'source'],
        perform: codePanel.open,
      })
    }
    out.push({
      kind: 'action',
      id: 'action:codepanel:toggle',
      label: 'Toggle Code Panel',
      category: 'Panels',
      keywords: ['snippet', 'source'],
      perform: codePanel.toggle,
    })

    if (settingsOpen) {
      out.push({
        kind: 'action',
        id: 'action:settings:close',
        label: 'Close Demo Settings',
        category: 'Panels',
        keywords: ['hide', 'preferences'],
        perform: () => {
          setSettingsOpen(false)
        },
      })
    } else {
      out.push({
        kind: 'action',
        id: 'action:settings:open',
        label: 'Open Demo Settings',
        category: 'Panels',
        keywords: ['show', 'preferences', 'config'],
        perform: () => {
          setSettingsOpen(true)
        },
      })
    }

    if (sidebarOpen) {
      out.push({
        kind: 'action',
        id: 'action:sidebar:close',
        label: 'Close Sidebar',
        category: 'Layout',
        keywords: ['hide', 'navigation', 'nav'],
        perform: () => {
          setSidebarOpen(false)
        },
      })
    } else {
      out.push({
        kind: 'action',
        id: 'action:sidebar:open',
        label: 'Open Sidebar',
        category: 'Layout',
        keywords: ['show', 'navigation', 'nav'],
        perform: () => {
          setSidebarOpen(true)
        },
      })
    }
    out.push({
      kind: 'action',
      id: 'action:sidebar:toggle',
      label: 'Toggle Sidebar',
      category: 'Layout',
      keywords: ['navigation', 'nav'],
      perform: () => {
        setSidebarOpen(prev => !prev)
      },
    })

    if (chromeVisibility.chromeHidden) {
      out.push({
        kind: 'action',
        id: 'action:chrome:show',
        label: 'Show Chrome',
        category: 'Layout',
        description: 'Restore the SDK app shell',
        keywords: ['exit focus mode', 'topbar', 'header'],
        perform: chromeVisibility.showChrome,
      })
    } else {
      out.push({
        kind: 'action',
        id: 'action:chrome:hide',
        label: 'Hide Chrome (Focus Mode)',
        category: 'Layout',
        description: 'Hide the SDK app shell to focus on the rendered component',
        keywords: ['focus mode', 'fullscreen', 'distraction free'],
        perform: chromeVisibility.toggleChrome,
      })
    }

    for (const chrome of demoChromes) {
      if (chrome.id === chromeId) continue
      out.push({
        kind: 'action',
        id: `action:demochrome:${chrome.id}`,
        label: `Switch Demo Chrome → ${chrome.label}`,
        category: 'Demo Chrome',
        description: chrome.description,
        keywords: ['partner', 'shell', 'wrapper'],
        perform: () => {
          setChromeId(chrome.id)
        },
      })
    }

    for (const option of DESIGN_SYSTEM_OPTIONS) {
      if (!option.available) continue
      if (option.id === designSystem) continue
      out.push({
        kind: 'action',
        id: `action:adapter:${option.id}`,
        label: `Switch Component Adapter → ${option.label}`,
        category: 'Component Adapter',
        keywords: ['design system', 'components', 'theme'],
        perform: () => {
          setDesignSystem(option.id)
        },
      })
    }

    out.push({
      kind: 'action',
      id: 'action:demo:create-onboarded',
      label: 'Create New Demo (Onboarded Company)',
      category: 'Demo',
      keywords: ['fresh', 'reset', 'data'],
      perform: () => {
        onCreateNewDemo('onboarded-company')
      },
    })
    out.push({
      kind: 'action',
      id: 'action:demo:create-new',
      label: 'Create New Demo (New Company)',
      category: 'Demo',
      keywords: ['fresh', 'reset', 'data'],
      perform: () => {
        onCreateNewDemo('new-company')
      },
    })
    if (demoManager.tokenStatus === 'expired') {
      out.push({
        kind: 'action',
        id: 'action:demo:refresh-token',
        label: 'Refresh Demo Token',
        category: 'Demo',
        keywords: ['auth', 'expired'],
        perform: demoManager.refreshToken,
      })
    }
    out.push({
      kind: 'action',
      id: 'action:demo:reset-entities',
      label: 'Reset Entity IDs to Defaults',
      category: 'Demo',
      keywords: ['restore', 'clear'],
      perform: resetEntitiesToDefaults,
    })
    if (manualMode === 'manual') {
      out.push({
        kind: 'action',
        id: 'action:demo:auto-mode',
        label: 'Switch to Auto Demo Mode',
        category: 'Demo',
        keywords: ['automatic'],
        perform: switchToAuto,
      })
    } else {
      out.push({
        kind: 'action',
        id: 'action:demo:manual-mode',
        label: 'Switch to Manual Demo Mode',
        category: 'Demo',
        description: 'Open Demo Settings to configure manual IDs',
        keywords: ['custom ids'],
        perform: () => {
          setSettingsOpen(true)
        },
      })
    }

    out.push({
      kind: 'action',
      id: 'action:help:shortcuts',
      label: 'Show Keyboard Shortcuts',
      category: 'Help',
      keywords: ['keys', 'cheatsheet'],
      perform: shortcutHelper.open,
    })

    return out
  }, [
    themeMode,
    cycleTheme,
    appMode,
    toggleAppMode,
    navigate,
    codePanel,
    chromeVisibility,
    settingsOpen,
    setSettingsOpen,
    sidebarOpen,
    setSidebarOpen,
    chromeId,
    setChromeId,
    designSystem,
    setDesignSystem,
    demoManager,
    manualMode,
    switchToAuto,
    shortcutHelper,
    onCreateNewDemo,
    resetEntitiesToDefaults,
  ])
}
