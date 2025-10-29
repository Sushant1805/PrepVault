import React from 'react'
import styles from '../dashboard.module.css'
import { getServerSession } from 'next-auth/next'
import { options } from '../../api/auth/[...nextauth]/options'
import SettingsPanel from '@/components/SettingsPanel'

const SettingsPage = async () => {
  const session = await getServerSession(options)
  const user = session?.user

  return (
    <div className={styles.settingsContainer} style={{ padding: 24 }}>
      <SettingsPanel user={user || null} />
    </div>
  )
}

export default SettingsPage
