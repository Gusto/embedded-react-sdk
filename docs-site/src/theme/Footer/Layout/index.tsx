import React, { type ReactNode } from 'react'
import clsx from 'clsx'
import { ThemeClassNames } from '@docusaurus/theme-common'
import type { Props } from '@theme/Footer/Layout'
import styles from './styles.module.css'

export default function FooterLayout({ style, links, logo, copyright }: Props): ReactNode {
  return (
    <footer
      className={clsx(ThemeClassNames.layout.footer.container, 'footer', styles.footer, {
        'footer--dark': style === 'dark',
      })}
    >
      <div className={clsx('container container-fluid', styles.footerInner)}>
        <div className={styles.footerTop}>
          {logo && (
            <div className={styles.footerBrand}>
              {logo}
              <p className={styles.footerTagline}>React SDK for embedded payroll.</p>
            </div>
          )}
          {links && <div className={styles.footerLinks}>{links}</div>}
        </div>
        {copyright && <div className={styles.footerBottom}>{copyright}</div>}
      </div>
    </footer>
  )
}
