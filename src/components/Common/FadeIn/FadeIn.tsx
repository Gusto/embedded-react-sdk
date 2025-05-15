import type { FC, ReactNode } from 'react'
import { useState, useEffect } from 'react'
import styles from './FadeIn.module.scss'

export const FadeIn: FC<{ children: ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // const timeout = requestAnimationFrame(() => {
    //   setVisible(true)
    // })
    // return () => {
    //   cancelAnimationFrame(timeout)
    // }
    const timer = setTimeout(() => {
      setVisible(true)
    }, delay)
    return () => {
      clearTimeout(timer)
    }
  }, [delay])

  return <div className={`${styles.fade} ${visible ? styles.fadeIn : ''}`}>{children}</div>
}
