-- MAKE USER ADMIN SCRIPT
-- Run this in Supabase SQL Editor after you tell me your email address
-- Step 1: Check what users exist (run this first to see your email)
SELECT id,
    email,
    role,
    created_at
FROM public.users
ORDER BY created_at DESC;
-- Step 2: Check what auth users exist
SELECT id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;
-- Step 3: Make yourself admin (REPLACE 'your-email@example.com' with your actual email)
-- INSERT INTO public.users (id, email, role) 
-- VALUES (
--     (SELECT id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1),
--     'your-email@example.com',
--     'admin'
-- ) ON CONFLICT (id) DO UPDATE SET role = 'admin';
-- Alternative: If you know your user ID, use this instead:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
-- Step 4: Verify the admin user was created
-- SELECT id, email, role FROM public.users WHERE role = 'admin';