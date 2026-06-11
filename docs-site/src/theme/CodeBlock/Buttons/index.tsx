import type { ReactNode } from 'react'
import clsx from 'clsx'
import BrowserOnly from '@docusaurus/BrowserOnly'
import CopyButton from '@theme/CodeBlock/Buttons/CopyButton'
import styles from './styles.module.css'

export default function CodeBlockButtons({ className }: { className?: string }): ReactNode {
  return (
    <BrowserOnly>
      {() => (
        <div className={clsx(className, styles.buttonGroup)}>
          <CopyButton />
        </div>
      )}
    </BrowserOnly>
  )
}
