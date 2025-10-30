import React from "react";
import styles from "./dashboard.module.css";
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { options } from '../api/auth/[...nextauth]/options'
import AddProblemButton from '../../components/AddProblemButton'
import SearchableProblems from '../../components/SearchableProblems'
import connectToMongoose from '../../lib/mongoose'
import Dashboard from '../../models/Dashboard'
import Problem from '../../models/Problems'

const DashboardPage = async () => {
  const session = await getServerSession(options)

  const displayName = session?.user?.name || 'Guest'

  // Server-side fetch the problems from the API route
  let problems = [];
  let fetchError = false;
  try {
    const res = await fetch('http://localhost:3000/api/problems');
    if (res.ok) {
      const json = await res.json();
      problems = json?.problems || [];
    } else {
      fetchError = true;
    }
  } catch (err) {
    fetchError = true;
  }

  // Server-side fetch dashboard counts for the current user
  let dashboardCounts = { totalProblems: 0, revisedThisWeek: 0, remainingToRevise: 0 }
  try {
    await connectToMongoose()

    const userId = session?.user?.id
    if (userId) {
      // Compute authoritative counts from Problems collection (handles any out-of-sync dashboard doc)
      try {
        const total = await Problem.countDocuments({ userId })
        const revised = await Problem.countDocuments({ userId, status: 'Solved' })
        const remaining = Math.max(total - revised, 0)

        dashboardCounts.totalProblems = total
        dashboardCounts.revisedThisWeek = revised
        dashboardCounts.remainingToRevise = remaining

        // ensure Dashboard doc exists and sync counts (non-destructive: overwrite to reflect reality)
        try {
          await Dashboard.findOneAndUpdate(
            { userId },
            { $set: { totalProblems: total, revisedThisWeek: revised, remainingToRevise: remaining, weekStart: new Date() } },
            { upsert: true, new: true }
          )
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to sync dashboard doc from Problems counts:', err)
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to compute dashboard counts from Problems:', err)
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error loading dashboard counts:', err)
  }

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
          {/* Search is handled by the client-side SearchableProblems component below */}
          <AddProblemButton />
        </header>

        {/* Overview Cards */}
        <section className={styles.overviewCards}>
          <div className={`${styles.card} ${styles.premium}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} aria-hidden>
                {/* trophy icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7V4h8v3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 7a6 6 0 0012 0" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21h6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className={styles.cardTitle}>Total Problems</div>
            </div>
            <div className={styles.cardNumber}>{dashboardCounts.totalProblems}</div>
            <div className={styles.cardSub}>Revised <strong>{dashboardCounts.revisedThisWeek}</strong> this week • Remaining <strong>{dashboardCounts.remainingToRevise}</strong></div>
          </div>

          <div className={`${styles.card} ${styles.premium} ${styles.ghost}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} aria-hidden>
                {/* sparkles icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l1.5 3 3 1.5-3 1.5L12 12l-1.5-3L7 7.5 10 6 12 3z" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className={styles.cardTitle}>Revised This Week</div>
            </div>
            <div className={styles.cardNumber}>{dashboardCounts.revisedThisWeek}</div>
            <div className={styles.cardSub}>Keep the momentum — every solved problem adds here.</div>
          </div>

          <div className={`${styles.card} ${styles.premium} ${styles.alert}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} aria-hidden>
                {/* clock icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1"/><path d="M12 7v5l3 1" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className={styles.cardTitle}>Remaining to Revise</div>
            </div>
            <div className={styles.cardNumber}>{dashboardCounts.remainingToRevise}</div>
            <div className={styles.cardSub}>Set a daily goal to chip away at these.</div>
          </div>
        </section>

        {/* Recent / Topic Sections */}
        <section className={styles.contentSection}>
          <div className={styles.recentProblems}>
            <h2>Recent Problems</h2>
            {fetchError ? (
              <p>Unable to load problems. Try again later.</p>
            ) : (
              // Render the client-side searchable problems component, passing server-fetched initial data
              <SearchableProblems initialProblems={problems} />
            )}
          </div>

        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
