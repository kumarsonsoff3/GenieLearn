'use client'

import ProtectedRoute from '../../src/components/auth/ProtectedRoute'
import GroupsComponent from '../../src/components/Groups'

export default function GroupsPage() {
  return (
    <ProtectedRoute>
      <GroupsComponent />
    </ProtectedRoute>
  )
}
