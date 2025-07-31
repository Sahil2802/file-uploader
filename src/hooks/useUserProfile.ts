import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { UserProfile, UserRole } from '../types'
import type { User } from '@supabase/supabase-js'

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.email) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // First, try to get existing profile by email
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw fetchError
      }

      if (existingProfile) {
        setProfile(existingProfile)
      } else {
        // Create new profile with default role
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              email: user.email,
              role: 'user' as UserRole,
            }
          ])
          .select()
          .single()

        if (insertError) {
          // If insert fails due to duplicate, try to fetch again
          if (insertError.code === '23505') {
            const { data: retryProfile, error: retryError } = await supabase
              .from('users')
              .select('*')
              .eq('email', user.email)
              .single()
            
            if (retryError) throw retryError
            setProfile(retryProfile)
          } else {
            throw insertError
          }
        } else {
          setProfile(newProfile)
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateRole = useCallback(async (newRole: UserRole) => {
    if (!user || !profile) return

    try {
      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setProfile(updatedProfile)
    } catch (err) {
      console.error('Error updating user role:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user role')
    }
  }, [user, profile])

  // Memoize the return values to prevent unnecessary re-renders
  const isAdmin = useMemo(() => profile?.role === 'admin', [profile?.role])
  const isUser = useMemo(() => profile?.role === 'user', [profile?.role])

  return {
    profile,
    loading,
    error,
    updateRole,
    isAdmin,
    isUser,
  }
} 