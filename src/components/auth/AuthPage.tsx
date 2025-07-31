import React, { useState } from 'react'
import Login from './Login'
import Signup from './Signup'
import { Button } from '../ui/button'
import { Upload } from 'lucide-react'

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            File Upload & Polls
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your complete solution for file management and polling
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <Button
              onClick={() => setIsLogin(true)}
              variant={isLogin ? 'default' : 'ghost'}
              className={`flex-1 text-sm font-medium ${
                isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </Button>
            <Button
              onClick={() => setIsLogin(false)}
              variant={!isLogin ? 'default' : 'ghost'}
              className={`flex-1 text-sm font-medium ${
                !isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </Button>
          </div>

          {/* Auth Forms */}
          {isLogin ? <Login /> : <Signup />}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>Secure authentication powered by Supabase</p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
