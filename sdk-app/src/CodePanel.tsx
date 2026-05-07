import { useEffect, useMemo, useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { useCurrentComponent } from './useCurrentComponent'
import { useResolvedTheme } from './useThemeModeContext'
import { generateSnippet } from './generateSnippet'
import styles from './CodePanel.module.scss'

interface CodePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function CodePanel({ isOpen, onClose }: CodePanelProps) {
  const current = useCurrentComponent()
  const resolvedTheme = useResolvedTheme()
  const [anonymize, setAnonymize] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const snippet = useMemo(() => {
    if (!current) return ''
    return generateSnippet(current.entry, current.entities, { anonymize })
  }, [current, anonymize])

  useEffect(() => {
    if (!isOpen) {
      setCopyState('idle')
      return
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [isOpen, onClose])

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

  if (!isOpen) return null

  const prismTheme = resolvedTheme === 'dark' ? themes.vsDark : themes.github

  return (
    <>
      <div
        className={styles.overlay}
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onClose()
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close code panel"
      />
      <div className={styles.panel} role="dialog" aria-label="Component code">
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
                <label className={styles.anonymizeToggle}>
                  <input
                    type="checkbox"
                    checked={anonymize}
                    onChange={e => {
                      setAnonymize(e.target.checked)
                    }}
                  />
                  Anonymize IDs
                </label>
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
            <div className={styles.hint}>
              Press <kbd>?</kbd> to toggle this panel, <kbd>Esc</kbd> to close.
            </div>
          </>
        )}
      </div>
    </>
  )
}
