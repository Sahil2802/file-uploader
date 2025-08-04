# Event Registration App

A modern, full-stack web application for event registration and management. Built with React, TypeScript, and Supabase, this application provides a seamless experience for users to browse and register for events, while offering administrators comprehensive event management capabilities.

## ✨ Features

### For Users

- **Event Browsing**: View all available events with details like name and date
- **Event Registration**: Register for events with a single click
- **Personal Dashboard**: View and manage your registered events
- **Profile Management**: User profile with avatar dropdown and logout functionality
- **Responsive Design**: Optimized for desktop and mobile devices

### For Administrators

- **Event Management**: Create, edit, and delete events
- **Registration Analytics**: View registration statistics and analytics
- **User Management**: Monitor user registrations and activity
- **Admin Dashboard**: Comprehensive overview of platform metrics
- **Real-time Updates**: Live data synchronization across all users

### Technical Features

- **Authentication**: Secure user authentication with Supabase Auth
- **Real-time Database**: PostgreSQL with Row Level Security (RLS)
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first responsive layout
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance**: Optimized with Vite for fast development and builds

## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Supabase Account** (for backend services)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Sahil2802/file-uploader.git
   cd file-upload-assignment
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your Supabase credentials:

   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up Supabase Database:**

   In your Supabase project, run the following SQL to create the necessary tables:

   ```sql
   -- Create events table
   CREATE TABLE events (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     date DATE NOT NULL
   );

   -- Create registrations table
   CREATE TABLE registrations (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     UNIQUE(user_id, event_id)
   );

   -- Enable Row Level Security
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

   -- Create policies for events table
   CREATE POLICY "Events are viewable by everyone" ON events
     FOR SELECT USING (true);

   CREATE POLICY "Events can be inserted by authenticated users" ON events
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

   CREATE POLICY "Events can be updated by authenticated users" ON events
     FOR UPDATE USING (auth.role() = 'authenticated');

   CREATE POLICY "Events can be deleted by authenticated users" ON events
     FOR DELETE USING (auth.role() = 'authenticated');

   -- Create policies for registrations table
   CREATE POLICY "Users can view their own registrations" ON registrations
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own registrations" ON registrations
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own registrations" ON registrations
     FOR DELETE USING (auth.uid() = user_id);

   -- Insert sample events
   INSERT INTO events (name, date) VALUES
   ('Tech Conference 2025', '2025-03-15'),
   ('Web Development Workshop', '2025-04-20'),
   ('AI & Machine Learning Summit', '2025-05-10'),
   ('Mobile App Development Bootcamp', '2025-06-05'),
   ('DevOps Best Practices Seminar', '2025-07-12');
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173) to view the application.

## 📝 Available Scripts

In the project directory, you can run:

### `npm run dev`

Starts the development server with hot-reload enabled.
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production to the `dist` folder.

The build is optimized and minified for the best performance.

### `npm run lint`

Runs ESLint to check for code quality and style issues.

### `npm run preview`

Serves the production build locally for testing before deployment.

## Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin-specific components
│   ├── auth/            # Authentication components
│   ├── events/          # Event-related components
│   └── ui/              # Reusable UI components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── lib/                 # Third-party library configurations
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## 🛠️ Built With

- **[React 19](https://reactjs.org/)** - Modern JavaScript library for building user interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[Supabase](https://supabase.io/)** - Open-source Firebase alternative with PostgreSQL
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icon library

## 🔐 Authentication

The application uses Supabase Auth for user authentication:

- Email/Password authentication
- Secure session management
- Row Level Security (RLS) for data protection
- Automatic user profile creation

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Modal Confirmations**: User-friendly confirmation dialogs
- **Loading States**: Visual feedback for all user actions
- **Error Handling**: Graceful error messages and recovery
- **Profile Avatar**: Dropdown menu with user information and logout

## 🚀 Deployment

The application can be deployed to various platforms:

1. **Vercel**: Connect your GitHub repository for automatic deployments
2. **Netlify**: Deploy with continuous integration from Git
3. **Supabase**: Use Supabase's built-in hosting features

Make sure to set your environment variables in your deployment platform's settings.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For any questions or support, please reach out to the development team.
