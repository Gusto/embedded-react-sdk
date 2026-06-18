import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { useHistory } from '@docusaurus/router'
import {
  useActiveDocContext,
  useDocsPreferredVersion,
  useDocsVersionCandidates,
  useVersions,
} from '@docusaurus/plugin-content-docs/client'
import type { GlobalDoc, GlobalVersion } from '@docusaurus/plugin-content-docs/client'
import styles from './styles.module.css'

function getVersionMainDoc(version: GlobalVersion): GlobalDoc {
  return version.docs.find(doc => doc.id === version.mainDocId)!
}

export default function SidebarVersionSelect(): ReactNode {
  const versions = useVersions(undefined)
  const activeDocContext = useActiveDocContext(undefined)
  const candidates = useDocsVersionCandidates(undefined)
  const { savePreferredVersionName } = useDocsPreferredVersion(undefined)
  const history = useHistory()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (versions.length <= 1) {
    return null
  }

  const activeVersion = activeDocContext.activeVersion ?? candidates[0] ?? versions[0]!

  function selectVersion(version: GlobalVersion) {
    savePreferredVersionName(version.name)
    const targetDoc =
      activeDocContext.alternateDocVersions[version.name] ?? getVersionMainDoc(version)
    setOpen(false)
    history.push(targetDoc.path)
  }

  return (
    <div ref={rootRef} className={styles.versionSelect}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className={styles.label}>Version</span>
        <span className={styles.value}>{activeVersion.label}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label="Documentation versions">
          {versions.map(version => {
            const isActive = version.name === activeVersion.name
            return (
              <li key={version.name} className={styles.menuItem}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={clsx(styles.menuButton, isActive && styles.menuButtonActive)}
                  onClick={() => selectVersion(version)}
                >
                  {version.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
