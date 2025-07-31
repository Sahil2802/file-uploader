-- Create users table for role-based authentication
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR
SELECT USING (auth.uid() = id);
-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON public.users FOR
UPDATE USING (auth.uid() = id);
-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON public.users FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.users FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Allow insert for new users
CREATE POLICY "Allow insert for new users" ON public.users FOR
INSERT WITH CHECK (auth.uid() = id);
-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN -- Check if user profile already exists
    IF NOT EXISTS (
        SELECT 1
        FROM public.users
        WHERE email = NEW.email
    ) THEN
INSERT INTO public.users (email, role)
VALUES (NEW.email, 'user');
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Insert a default admin user (replace with your email)
-- Uncomment and modify the line below to create your first admin user
-- INSERT INTO public.users (email, role) VALUES ('your-email@example.com', 'admin');