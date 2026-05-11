import { useEffect, useMemo, useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { useCurrentComponent } from './useCurrentComponent'
import { useResolvedTheme } from './useThemeModeContext'
import { generateSnippet } from './generateSnippet'
import styles from './CodePanel.module.scss'

interface CodePanelProps {
  onClose: () => void
}

export function CodePanel({ onClose }: CodePanelProps) {
  const current = useCurrentComponent()
  const resolvedTheme = useResolvedTheme()
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

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

  return (
    <div className={styles.panel} aria-label="Component code">
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
                  <div key={i} {...getLineProps({ line, className: styles.line })}>
                    <span className={styles.lineNumber}>{i + 1}</span>
                    <span className={styles.lineContent}>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </>
      )}
    </div>
  )
}
