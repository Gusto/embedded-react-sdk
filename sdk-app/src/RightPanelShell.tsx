import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './RightPanelShell.module.scss'

const STORAGE_KEY = 'sdk-app-right-panel-width'
const DEFAULT_WIDTH = 380
const MIN_WIDTH = 280

function readWidth(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const n = parseInt(raw, 10)
      if (Number.isFinite(n) && n >= MIN_WIDTH) return n
    }
  } catch {
    // ignore
  }
  return DEFAULT_WIDTH
}

function saveWidth(w: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(w))
  } catch {
    // ignore
  }
}

interface RightPanelShellProps {
  children: ReactNode
}

export function RightPanelShell({ children }: RightPanelShellProps) {
  const [width, setWidth] = useState<number>(readWidth)
  const isResizingRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    isResizingRef.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return
    const next = Math.round(window.innerWidth - e.clientX)
    const max = Math.round(window.innerWidth * 0.85)
    setWidth(Math.min(Math.max(next, MIN_WIDTH), max))
  }, [])

  const finishResize = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return
    isResizingRef.current = false
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    setWidth(w => {
      saveWidth(w)
      return w
    })
  }, [])

  const handleDoubleClick = useCallback(() => {
    setWidth(DEFAULT_WIDTH)
    saveWidth(DEFAULT_WIDTH)
  }, [])

  useEffect(() => {
    return () => {
      if (isResizingRef.current) {
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [])

  return (
    <aside className={styles.shell} style={{ width: `${width}px` }}>
      <div
        className={styles.handle}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        title="Drag to resize · Double-click to reset"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishResize}
        onPointerCancel={finishResize}
        onDoubleClick={handleDoubleClick}
      />
      <div className={styles.content}>{children}</div>
    </aside>
  )
}
