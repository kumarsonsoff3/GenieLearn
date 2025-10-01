'use client'

import ProtectedRoute from '../../src/components/auth/ProtectedRoute'
import DashboardComponent from '../../src/components/Dashboard'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardComponent />
    </ProtectedRoute>
  )
}
