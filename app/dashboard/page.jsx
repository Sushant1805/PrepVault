import React from "react";
import styles from "./dashboard.module.css";
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { options } from '../api/auth/[...nextauth]/options'

const DashboardPage = async () => {
  const session = await getServerSession(options)

  const displayName = session?.user?.name || 'Guest'

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.dashboardSidebar}>
        <h2 className={styles.logo}>PrepVault</h2>
        <nav className={styles.sidebarNav}>
          <ul>
            <li><Link href="/Dashboard">🏠 Dashboard</Link></li>
            <li><Link href="#">📚 Topics</Link></li>
            <li><Link href="#">📝 Notes</Link></li>
            <li><Link href="#">⭐ Favorites</Link></li>
            <li><Link href="/dashboard/settings">⚙️ Settings</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main Area */}
      <main className={styles.dashboardContent}>
        {/* Header */}
        <header className={styles.dashboardHeader}>
          <h1 style={{color:`white`}}>Hey {displayName} 👋</h1>
          <input
            type="text"
            placeholder="Search problems or notes..."
            className={styles.searchBar}
          />
          <button className={styles.addBtn}>+ Add Problem</button>
        </header>

        {/* Overview Cards */}
        <section className={styles.overviewCards}>
          <div className={styles.card}>
            <h3>Total Problems</h3>
            <p>120</p>
          </div>
          <div className={styles.card}>
            <h3>Topics Covered</h3>
            <p>15 / 20</p>
          </div>
          <div className={styles.card}>
            <h3>Revised This Week</h3>
            <p>45</p>
          </div>
          <div className={styles.card}>
            <h3>Favorites</h3>
            <p>8</p>
          </div>
        </section>

        {/* Recent / Topic Sections */}
        <section className={styles.contentSection}>
          <div className={styles.recentProblems}>
            <h2>Recent Problems</h2>
            <ul>
              <li>🔗 Two Sum — Easy</li>
              <li>🔗 Longest Substring Without Repeat — Medium</li>
              <li>🔗 Word Ladder — Hard</li>
            </ul>
          </div>

          
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
