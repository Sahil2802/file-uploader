-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create poll_questions table
CREATE TABLE IF NOT EXISTS poll_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    description TEXT,
    uploaded_file_url TEXT,
    uploaded_file_name TEXT,
    uploaded_file_type TEXT,
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create poll_options table
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES poll_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create poll_votes table
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES poll_questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, user_id) -- One vote per user per question
);
-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
-- Create policies for polls (everyone can read, only admins can create/update/delete)
CREATE POLICY "Everyone can view polls" ON polls FOR
SELECT USING (true);
CREATE POLICY "Only admins can create polls" ON polls FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
        )
    );
CREATE POLICY "Only admins can update polls" ON polls FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
        )
    );
CREATE POLICY "Only admins can delete polls" ON polls FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
    )
);
-- Create policies for poll_questions
CREATE POLICY "Everyone can view poll questions" ON poll_questions FOR
SELECT USING (true);
CREATE POLICY "Only admins can create poll questions" ON poll_questions FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
        )
    );
CREATE POLICY "Only admins can update poll questions" ON poll_questions FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
        )
    );
CREATE POLICY "Only admins can delete poll questions" ON poll_questions FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
    )
);
-- Create policies for poll_options
CREATE POLICY "Everyone can view poll options" ON poll_options FOR
SELECT USING (true);
CREATE POLICY "Only admins can create poll options" ON poll_options FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
        )
    );
CREATE POLICY "Only admins can update poll options" ON poll_options FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
        )
    );
CREATE POLICY "Only admins can delete poll options" ON poll_options FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
    )
);
-- Create policies for poll_votes
CREATE POLICY "Everyone can view poll votes" ON poll_votes FOR
SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON poll_votes FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON poll_votes FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON poll_votes FOR DELETE USING (auth.uid() = user_id);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_poll_questions_poll_id ON poll_questions(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_question_id ON poll_options(question_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_question_id ON poll_votes(question_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);