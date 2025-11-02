import React from 'react'
import styles from '../dashboard.module.css'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { options } from '../../api/auth/[...nextauth]/options'
import AddProblemButton from '../../../components/AddProblemButton'
import SearchableTopics from '../../../components/SearchableTopics'

const TopicsPage = async () => {
  const session = await getServerSession(options)
  const displayName = session?.user?.name || 'Guest'

  // server fetch topics
  let topics = []
  try {
    const res = await fetch('http://localhost:3000/api/topics')
    if (res.ok) {
      const json = await res.json()
      topics = json?.topics || []
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch topics', err)
  }

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.dashboardSidebar}>
        <h2 className={styles.logo}>PrepVault</h2>
        <nav className={styles.sidebarNav}>
          <ul>
            <li><Link href="/dashboard">🏠 Dashboard</Link></li>
            <li><Link href="/dashboard/topics">📚 Topics</Link></li>
            <li><Link href="/dashboard/settings">⚙️ Settings</Link></li>
          </ul>
        </nav>
      </aside>

      <main className={styles.dashboardContent}>
        <header className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.greetingTitle}>Hey {displayName} 👋</h1>
            <p className={styles.greetingSubtitle}>Keep the momentum — review one topic or problem today to stay sharp.</p>
          </div>
          <AddProblemButton mode="topic" />
        </header>

        <section className={styles.contentSection}>
          <div className={styles.recentProblems} style={{ gridColumn: '1 / -1' }}>
            <h2>Your Topics</h2>
            <div style={{ marginTop: 12 }}>
              {topics.length === 0 ? (
                <p>No topics yet. Click Add Topic to start adding topics to revise.</p>
              ) : (
                <SearchableTopics initialTopics={topics} />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default TopicsPage
