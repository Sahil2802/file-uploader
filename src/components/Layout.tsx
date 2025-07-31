import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import Dashboard from './Dashboard'

const Layout: React.FC = React.memo(() => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // For now, always show regular dashboard until we fix the admin setup
  // This will prevent the "Access Denied" issue
  return <Dashboard />
})

Layout.displayName = 'Layout'

export default Layout 