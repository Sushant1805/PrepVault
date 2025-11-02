"use client"

import React from 'react'
import styles from '../app/dashboard/dashboard.module.css'
import Link from 'next/link'

export default function TopicsGrid({ topics = [] }) {
  return (
    <div className={styles.topicGrid}>
      {topics.map((t) => (
        <article key={t._id} className={styles.topicCard}>
          <div>
            <div className={styles.topicCardHeader}>
              <div className={styles.topicCardTitle}>{t.title}</div>
              <div className={`${styles.topicImportance} ${styles['importance-' + (t.importance || 'Normal')]}`}>{t.importance || 'Normal'}</div>
            </div>

            <div className={styles.topicDescription}>{t.description || <em>No description</em>}</div>

            <div className={styles.topicMeta}>
              {t.subtopics && t.subtopics.length > 0 && t.subtopics.slice(0, 4).map((s, i) => (
                <span key={i} className={styles.chip}>{s}</span>
              ))}
              {t.tags && t.tags.length > 0 && t.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className={styles.chip}>{tag}</span>
              ))}
            </div>

            {t.resources && t.resources.length > 0 && (
              <div className={styles.topicResources}>
                <strong>Resources:</strong>
                <ul>
                  {t.resources.slice(0, 3).map((r, i) => (
                    <li key={i}><a href={r} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{r}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={styles.topicActions}>
            <Link href={`/dashboard/topics/${t._id}`} className={styles['btn-primary']}>Revise</Link>
          </div>
        </article>
      ))}
    </div>
  )
}
