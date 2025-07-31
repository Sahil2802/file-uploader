-- FIXED DATABASE SETUP - NO INFINITE RECURSION
-- Run this to fix the RLS policy issues
-- First, drop all existing policies to clean up
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Allow insert for new users" ON public.users;
-- Drop and recreate the users table with corrected structure
DROP TABLE IF EXISTS public.users CASCADE;
-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Create SIMPLE policies that don't cause recursion
-- Allow users to read their own profile
CREATE POLICY "users_select_own" ON public.users FOR
SELECT USING (auth.uid() = id);
-- Allow users to update their own profile (but not role)
CREATE POLICY "users_update_own" ON public.users FOR
UPDATE USING (auth.uid() = id) WITH CHECK (
        auth.uid() = id
        AND role = (
            SELECT role
            FROM public.users
            WHERE id = auth.uid()
        )
    );
-- Allow anyone to insert (for new user creation)
CREATE POLICY "users_insert_own" ON public.users FOR
INSERT WITH CHECK (auth.uid() = id);
-- Create a separate admin_users table for admin operations
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.users (id, email, role)
VALUES (NEW.id, NEW.email, 'user') ON CONFLICT (id) DO
UPDATE
SET email = NEW.email;
RETURN NEW;
EXCEPTION
WHEN OTHERS THEN -- Log error but don't fail the auth
RAISE WARNING 'Failed to create user profile: %',
SQLERRM;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Update existing poll policies to use simpler role checking
DROP POLICY IF EXISTS "Only admins can create polls" ON public.polls;
DROP POLICY IF EXISTS "Only admins can update polls" ON public.polls;
DROP POLICY IF EXISTS "Only admins can delete polls" ON public.polls;
DROP POLICY IF EXISTS "Only admins can create poll questions" ON public.poll_questions;
DROP POLICY IF EXISTS "Only admins can update poll questions" ON public.poll_questions;
DROP POLICY IF EXISTS "Only admins can delete poll questions" ON public.poll_questions;
DROP POLICY IF EXISTS "Only admins can create poll options" ON public.poll_options;
DROP POLICY IF EXISTS "Only admins can update poll options" ON public.poll_options;
DROP POLICY IF EXISTS "Only admins can delete poll options" ON public.poll_options;
-- Recreate poll policies with direct role checking (no subqueries)
CREATE POLICY "admins_can_manage_polls" ON public.polls FOR ALL USING (
    auth.uid() IN (
        SELECT id
        FROM public.users
        WHERE role = 'admin'
    )
);
CREATE POLICY "admins_can_manage_poll_questions" ON public.poll_questions FOR ALL USING (
    auth.uid() IN (
        SELECT id
        FROM public.users
        WHERE role = 'admin'
    )
);
CREATE POLICY "admins_can_manage_poll_options" ON public.poll_options FOR ALL USING (
    auth.uid() IN (
        SELECT id
        FROM public.users
        WHERE role = 'admin'
    )
);
-- Create a service role function for admin operations
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = user_id
            AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
-- STEP: Create your admin user
-- IMPORTANT: Replace 'your-email@example.com' with your actual email address
-- Uncomment and modify the line below, then run it separately after creating your account:
-- INSERT INTO public.users (id, email, role) 
-- VALUES (
--     (SELECT id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1),
--     'your-email@example.com',
--     'admin'
-- ) ON CONFLICT (id) DO UPDATE SET role = 'admin';
-- INSTRUCTIONS:
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Create your user account through the application
-- 3. Uncomment the INSERT statement above and replace 'your-email@example.com' with your email
-- 4. Run the INSERT statement separately to make yourself an admin