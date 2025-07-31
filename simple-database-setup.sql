-- SIMPLE DATABASE SETUP - JUST CREATE THE ESSENTIAL TABLES
-- Run this first to get basic functionality working
-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create poll_questions table
CREATE TABLE IF NOT EXISTS public.poll_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    description TEXT,
    uploaded_file_url TEXT,
    uploaded_file_name TEXT,
    uploaded_file_type TEXT,
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.poll_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.poll_questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, user_id)
);
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
-- Create SIMPLE policies - no complex logic
-- Users table policies
CREATE POLICY "users_all_access" ON public.users FOR ALL USING (true) WITH CHECK (true);
-- Polls policies - everyone can read, authenticated can create
CREATE POLICY "polls_read_all" ON public.polls FOR
SELECT USING (true);
CREATE POLICY "polls_write_auth" ON public.polls FOR
INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "polls_update_auth" ON public.polls FOR
UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "polls_delete_auth" ON public.polls FOR DELETE USING (auth.uid() IS NOT NULL);
-- Poll questions policies
CREATE POLICY "questions_read_all" ON public.poll_questions FOR
SELECT USING (true);
CREATE POLICY "questions_write_auth" ON public.poll_questions FOR
INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "questions_update_auth" ON public.poll_questions FOR
UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "questions_delete_auth" ON public.poll_questions FOR DELETE USING (auth.uid() IS NOT NULL);
-- Poll options policies
CREATE POLICY "options_read_all" ON public.poll_options FOR
SELECT USING (true);
CREATE POLICY "options_write_auth" ON public.poll_options FOR
INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "options_update_auth" ON public.poll_options FOR
UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "options_delete_auth" ON public.poll_options FOR DELETE USING (auth.uid() IS NOT NULL);
-- Poll votes policies
CREATE POLICY "votes_read_all" ON public.poll_votes FOR
SELECT USING (true);
CREATE POLICY "votes_write_own" ON public.poll_votes FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_update_own" ON public.poll_votes FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "votes_delete_own" ON public.poll_votes FOR DELETE USING (auth.uid() = user_id);
-- Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.users (id, email, role)
VALUES (NEW.id, NEW.email, 'user') ON CONFLICT (id) DO
UPDATE
SET email = NEW.email;
RETURN NEW;
EXCEPTION
WHEN OTHERS THEN RAISE WARNING 'Failed to create user profile: %',
SQLERRM;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- AFTER running this, make yourself admin with:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';