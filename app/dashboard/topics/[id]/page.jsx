import React from 'react'
import styles from '../../dashboard.module.css'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { options } from '../../../api/auth/[...nextauth]/options'
import TopicEditor from '../../../../components/TopicEditor'

const TopicPage = async ({ params }) => {
  const session = await getServerSession(options)
  const displayName = session?.user?.name || 'Guest'

  const { id } = await params
  let topic = null
  try {
    const res = await fetch(`http://localhost:3000/api/topics/${id}`)
    if (res.ok) {
      const json = await res.json()
      topic = json?.topic || null
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch topic', err)
  }

  if (!topic) {
    return (
      <div className={styles.dashboardContainer}>
        <main className={styles.dashboardContent}>
          <h2>Topic not found</h2>
          <p><Link href="/dashboard/topics">Back to topics</Link></p>
        </main>
      </div>
    )
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
            <h1 className={styles.greetingTitle}>{topic.title}</h1>
            <p className={styles.greetingSubtitle}>Viewing topic — {displayName}</p>
          </div>
        </header>

        <section className={styles.contentSection}>
          <div className={styles.topicDetailWrapper}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Link href="/dashboard/topics" className="btn-ghost">← Back</Link>
                <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: 14 }}>/{topic._id}</div>
              </div>
            </div>

            <TopicEditor topic={topic} />
          </div>
        </section>
      </main>
    </div>
  )
}

export default TopicPage
