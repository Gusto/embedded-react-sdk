import type { FC, ReactNode } from 'react'
import { useState, useEffect } from 'react'
import styles from './FadeIn.module.scss'

export const FadeIn: FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timeout = requestAnimationFrame(() => {
      setVisible(true)
    })
    return () => {
      cancelAnimationFrame(timeout)
    }
  }, [])

  return <div className={`${styles.fade} ${visible ? styles.fadeIn : ''}`}>{children}</div>
}
