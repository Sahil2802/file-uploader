import React from 'react'
import { ExternalLink } from 'lucide-react'

export const SetupInstructions: React.FC = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-amber-800 mb-4">
        Initial Setup Required
      </h3>
      <div className="space-y-3 text-sm text-amber-700">
        <p>
          Please create the storage bucket manually in your Supabase dashboard:
        </p>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Go to your Supabase project dashboard</li>
          <li>Navigate to Storage in the left sidebar</li>
          <li>Create a new bucket named "uploads"</li>
          <li>
            Set the bucket to <strong>public</strong> or configure appropriate RLS policies
          </li>
          <li>Save the bucket configuration</li>
          <li>Refresh this page to start uploading files</li>
        </ol>
        <div className="mt-4 pt-3 border-t border-amber-300">
          <a
            href="https://supabase.com/docs/guides/storage"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-amber-800 hover:text-amber-900 font-medium"
          >
            View Supabase Storage Documentation
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
