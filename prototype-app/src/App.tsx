import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import styles from './App.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

export function App() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <GustoProvider config={{ baseUrl: 'http://localhost:0' }}>
      <div className={styles.layout}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.title}>
            Prototype App
          </Link>
        </nav>
        <div className={styles.body}>
          <Sidebar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </GustoProvider>
  )
}
