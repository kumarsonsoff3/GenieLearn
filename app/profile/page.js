'use client'

import ProtectedRoute from '../../src/components/auth/ProtectedRoute'
import ProfileComponent from '../../src/components/Profile'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileComponent />
    </ProtectedRoute>
  )
}
