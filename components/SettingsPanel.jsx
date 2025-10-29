"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import LogoutButton from './LogoutButton'

export default function SettingsPanel({ user }) {
  const router = useRouter()

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 900, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton aria-label="back" onClick={() => router.back()}>
                <span style={{ fontSize: 20 }}>←</span>
              </IconButton>
              <Typography variant="h6" component="h1">Settings</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={user?.image || ''}
              alt={user?.name || 'User'}
              sx={{ width: 96, height: 96, bgcolor: 'grey.700', fontSize: 32 }}
            >
              {!user?.image && (user?.name ? user.name.charAt(0) : 'U')}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5">{user?.name || 'Unknown User'}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => router.push('/Profile')}>Edit profile</Button>
                <LogoutButton />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Account</Typography>
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'transparent' }}>
              <Typography variant="body2">Provider: {user?.provider || 'credentials'}</Typography>
              <Typography variant="body2">Member since: {/* leave for future data */}—</Typography>
            </Card>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
