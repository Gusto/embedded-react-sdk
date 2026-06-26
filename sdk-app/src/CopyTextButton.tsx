import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './DemoSettingsPanel.module.scss'

interface CopyTextButtonProps {
  value: string
  ariaLabel: string
  idleLabel: string
  copiedLabel?: string
}

export function CopyTextButton({
  value,
  ariaLabel,
  idleLabel,
  copiedLabel = 'Copied!',
}: CopyTextButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied'>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const handleClick = useCallback(async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setStatus('copied')
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setStatus('idle')
      }, 1500)
    } catch {
      // Clipboard unavailable
    }
  }, [value])

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={handleClick}
      disabled={!value}
      aria-label={ariaLabel}
    >
      {status === 'copied' ? copiedLabel : idleLabel}
    </button>
  )
}
