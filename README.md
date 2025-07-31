# File Upload Assignment

A modern file upload application with authentication and role-based access control built with React, TypeScript, and Supabase.

## Features

- 🔐 User authentication (login/signup) with Supabase
- 👥 Role-based access control (User/Admin)
- 📊 Admin dashboard with user management
- 📁 Drag and drop file upload
- 📄 Support for PDF, DOCX, and TXT files
- 📝 Text extraction from uploaded files
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔒 Secure file storage with Supabase Storage

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account and project

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd file-upload-assignment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to Settings > API
4. Copy your Project URL and anon/public key

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set up Supabase Database

Run the SQL script in your Supabase SQL Editor:

```sql
-- Create users table for role-based authentication
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow insert for new users
CREATE POLICY "Allow insert for new users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (email, role)
    VALUES (NEW.email, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6. Create your first admin user

After signing up with your email, run this SQL to make yourself an admin:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 7. Set up Supabase Storage

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `uploads`
3. Set the bucket's privacy settings to allow authenticated users to upload files
4. Configure Row Level Security (RLS) policies as needed

### 8. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### For Regular Users:

1. **Sign up**: Create a new account with your email and password
2. **Sign in**: Use your credentials to log in
3. **Upload files**: Drag and drop or click to select files (PDF, DOCX, TXT)
4. **View extracted text**: The application will extract and display text from your uploaded files
5. **Logout**: Click the logout button in the header to sign out

### For Admin Users:

1. **Admin Dashboard**: Access comprehensive user management and system statistics
2. **User Management**: View all users, their file counts, and storage usage
3. **Role Management**: Promote users to admin or demote admins to regular users
4. **System Statistics**: Monitor total users, files, and storage usage

## File Support

- **PDF files**: Text extraction using PDF.js
- **DOCX files**: Text extraction using Mammoth.js
- **TXT files**: Direct text reading

## Technologies Used

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Storage, Database)
- **File Processing**: PDF.js, Mammoth.js
- **UI Components**: Radix UI, Lucide React icons

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── admin/          # Admin dashboard components
│   ├── ui/             # Reusable UI components
│   └── upload/         # File upload components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Environment Variables

| Variable                 | Description                   | Required |
| ------------------------ | ----------------------------- | -------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL     | Yes      |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes      |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
