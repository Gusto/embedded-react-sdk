import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { useCurrentComponent } from './useCurrentComponent'
import { useResolvedTheme } from './useThemeModeContext'
import { generateSnippet } from './generateSnippet'
import styles from './CodePanel.module.scss'

interface CodePanelProps {
  onClose: () => void
}

const WIDTH_STORAGE_KEY = 'sdk-app-code-panel-width'
const DEFAULT_WIDTH = 512
const MIN_WIDTH = 320

function readStoredWidth(): number {
  try {
    const raw = localStorage.getItem(WIDTH_STORAGE_KEY)
    if (!raw) return DEFAULT_WIDTH
    const parsed = parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed >= MIN_WIDTH ? parsed : DEFAULT_WIDTH
  } catch {
    return DEFAULT_WIDTH
  }
}

export function CodePanel({ onClose }: CodePanelProps) {
  const current = useCurrentComponent()
  const resolvedTheme = useResolvedTheme()
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [width, setWidth] = useState<number>(readStoredWidth)
  const isResizingRef = useRef(false)

  const snippet = useMemo(() => {
    if (!current) return ''
    return generateSnippet(current.entry, current.entities)
  }, [current])

  useEffect(() => {
    setCopyState('idle')
  }, [snippet])

  const handleCopy = async () => {
    if (!snippet) return
    try {
      await navigator.clipboard.writeText(snippet)
      setCopyState('copied')
      setTimeout(() => {
        setCopyState('idle')
      }, 1500)
    } catch {
      // Clipboard unavailable
    }
  }

  const prismTheme = resolvedTheme === 'dark' ? themes.vsDark : themes.github

  const handleResizePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    isResizingRef.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleResizePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return
    const next = Math.round(window.innerWidth - e.clientX)
    const max = Math.round(window.innerWidth * 0.85)
    const clamped = Math.min(Math.max(next, MIN_WIDTH), max)
    setWidth(clamped)
  }, [])

  const handleResizePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isResizingRef.current) return
      isResizingRef.current = false
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      try {
        localStorage.setItem(WIDTH_STORAGE_KEY, String(width))
      } catch {
        // Storage unavailable
      }
    },
    [width],
  )

  const handleResizeDoubleClick = useCallback(() => {
    setWidth(DEFAULT_WIDTH)
    try {
      localStorage.setItem(WIDTH_STORAGE_KEY, String(DEFAULT_WIDTH))
    } catch {
      // Storage unavailable
    }
  }, [])

  return (
    <aside className={styles.panel} aria-label="Component code" style={{ width: `${width}px` }}>
      <div
        className={styles.resizeHandle}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize code panel"
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        onDoubleClick={handleResizeDoubleClick}
        title="Drag to resize. Double-click to reset."
      />
      <div className={styles.header}>
        <h2>Code</h2>
        <button className={styles.close} onClick={onClose} type="button" aria-label="Close">
          &times;
        </button>
      </div>

      {!current ? (
        <div className={styles.empty}>
          <p>Select a component from the sidebar to see usage code.</p>
        </div>
      ) : (
        <>
          <div className={styles.subheader}>
            <span className={styles.componentLabel}>
              {current.entry.category}.{current.entry.name}
            </span>
            <div className={styles.actions}>
              <button className={styles.copyBtn} onClick={handleCopy} type="button">
                {copyState === 'copied' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <Highlight code={snippet} language="tsx" theme={prismTheme}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={`${styles.code} ${className}`} style={style}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className={styles.lineNumber}>{i + 1}</span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </>
      )}
    </aside>
  )
}
