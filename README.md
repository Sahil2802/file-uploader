# File Upload App with Supabase Storage

A modern React application for uploading files to Supabase Storage with drag-and-drop functionality, file management, and a clean UI.

## Features

- 📁 **Drag & Drop Upload**: Intuitive file upload with drag-and-drop support
- 📋 **Multiple File Selection**: Upload multiple files at once
- 🗂️ **File Management**: View, download, and delete uploaded files
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔒 **Secure Storage**: Files are stored securely in Supabase Storage
- ⚡ **Real-time Updates**: Instant feedback on upload progress
- 🎨 **Modern UI**: Clean and professional interface

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (Database + Storage)
- **Styling**: Custom CSS with modern design
- **Build Tool**: Vite

## Prerequisites

Before you begin, ensure you have:

- Node.js (version 16 or higher)
- A Supabase account and project
- Git (for cloning the repository)

## Supabase Setup

1. **Create a Supabase Project**

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Create a Storage Bucket**

   - In your Supabase dashboard, go to Storage
   - Create a new bucket named `uploads` (or any name you prefer)
   - Set the bucket to public if you want public file access
   - Configure appropriate policies for your use case

3. **Set up Storage Policies (Optional)**

   ```sql
   -- Allow public uploads (adjust as needed for your security requirements)
   CREATE POLICY "Public Upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'uploads');

   -- Allow public downloads
   CREATE POLICY "Public Download" ON storage.objects
   FOR SELECT USING (bucket_id = 'uploads');

   -- Allow public deletions (adjust as needed)
   CREATE POLICY "Public Delete" ON storage.objects
   FOR DELETE USING (bucket_id = 'uploads');
   ```

## Installation & Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   # Copy the example environment file
   copy .env.example .env
   ```

3. **Configure your environment variables**

   Edit the `.env` file and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Update the bucket name (if different)**

   If you named your Supabase storage bucket something other than `uploads`, update the bucket name in:

   - `src/components/FileUpload.tsx` (lines with `.from('uploads')`)

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:5173` to see the application.

## Usage

### Uploading Files

1. **Drag and Drop**: Drag files from your computer directly onto the upload area
2. **Browse Files**: Click "Browse Files" to select files using the file dialog
3. **Multiple Selection**: You can select multiple files at once
4. **Upload**: Click the "Upload" button to upload all selected files

### Managing Files

- **View Files**: All uploaded files are displayed in the "Uploaded Files" section
- **Download**: Click on any file name to download it
- **Delete**: Click the trash icon (🗑️) to delete a file from storage

### File Information

- File name, size, and upload timestamp are displayed
- File size is automatically formatted (Bytes, KB, MB, GB)
- Direct links to files for easy sharing

## Project Structure

```
src/
├── components/
│   ├── FileUpload.tsx       # Main file upload component
│   └── FileUpload.css       # Styles for file upload
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── App.tsx                  # Main application component
├── App.css                  # Global styles
└── main.tsx                 # Application entry point
```

## Customization

### Changing the Bucket Name

Update the bucket name in `src/components/FileUpload.tsx`:

```typescript
.from('your-bucket-name') // Replace 'uploads' with your bucket name
```

### File Type Restrictions

Add file type validation in the `handleFileSelect` function:

```typescript
const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
const validFiles = fileArray.filter((file) => allowedTypes.includes(file.type));
```

### File Size Limits

Add file size validation:

```typescript
const maxSize = 10 * 1024 * 1024; // 10MB
const validFiles = fileArray.filter((file) => file.size <= maxSize);
```

### Styling

- Modify `src/components/FileUpload.css` for component-specific styles
- Modify `src/App.css` for global styles and layout

## Security Considerations

1. **Storage Policies**: Set up appropriate Row Level Security (RLS) policies in Supabase
2. **File Validation**: Add client and server-side file validation
3. **Authentication**: Consider adding user authentication for private file uploads
4. **File Scanning**: Implement virus/malware scanning for uploaded files
5. **Rate Limiting**: Add rate limiting to prevent abuse

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**

   - Ensure your `.env` file is in the root directory
   - Variable names must start with `VITE_` for Vite
   - Restart the development server after changing environment variables

2. **Supabase Connection Issues**

   - Verify your Supabase URL and anon key
   - Check that your Supabase project is active
   - Ensure your internet connection is stable

3. **Upload Failures**

   - Check your storage bucket policies
   - Verify the bucket exists and is accessible
   - Check browser console for specific error messages

4. **File Access Issues**
   - Ensure your bucket is set to public if you want public access
   - Check that the public URL generation is working correctly

### Development Commands

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the Supabase documentation
3. Create an issue in the repository
4. Check the browser console for error messages

---

**Happy coding! 🚀**
