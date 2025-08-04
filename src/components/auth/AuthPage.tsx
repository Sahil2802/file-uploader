import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-center px-12">
        <div className="max-w-md">
          {/* Logo */}
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8">
            <span className="text-blue-600 font-bold text-3xl">E</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold text-white mb-6">
            Event Registration Platform
          </h1>

          {/* Tagline */}
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Browse our curated selection of upcoming events. Select the ones
            you're interested in and submit your registration to secure your
            spot.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center text-blue-100">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
              <span>Easy event browsing and registration</span>
            </div>
            <div className="flex items-center text-blue-100">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
              <span>Real-time registration management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Mobile Logo & Title */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Event Registration
            </h2>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin
                ? "Sign in to access your event registrations"
                : "Sign up to start registering for events"}
            </p>
          </div>

          {/* Auth Form Container */}
          <div className="bg-white">
            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-all ${
                  isLogin
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-all ${
                  !isLogin
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Auth Forms */}
            {isLogin ? <Login /> : <Signup />}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Secure authentication powered by Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
