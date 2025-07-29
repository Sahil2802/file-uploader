import React from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'

const SetupInstructions: React.FC = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
        <h2 className="text-lg font-semibold text-amber-800">
          Supabase Setup Required
        </h2>
      </div>
      
      <div className="text-amber-700 space-y-4">
        <p>
          To use this file upload application, you need to set up your Supabase Storage bucket.
        </p>
        
        <div className="space-y-3">
          <h3 className="font-medium">Setup Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Go to your{' '}
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-800 underline hover:text-amber-900 inline-flex items-center"
              >
                Supabase Dashboard
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </li>
            <li>Navigate to <strong>Storage</strong> in the left sidebar</li>
            <li>Click <strong>Create a new bucket</strong></li>
            <li>
              Create a bucket named <code className="bg-amber-100 px-1 rounded">uploads</code>
            </li>
            <li>Make sure the bucket is <strong>Public</strong> (toggle the public option)</li>
            <li>
              Set up RLS (Row Level Security) policy to allow uploads:
              <ul className="list-disc list-inside mt-1 ml-4 space-y-1 text-xs">
                <li>Go to <strong>Storage</strong> → <strong>Policies</strong></li>
                <li>Create a new policy for the <code>uploads</code> bucket</li>
                <li>Allow <strong>INSERT</strong> and <strong>SELECT</strong> operations</li>
                <li>Use <code>true</code> as the policy expression for testing</li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="bg-amber-100 border border-amber-300 rounded p-3 text-xs">
          <strong>Note:</strong> Make sure your <code>.env</code> file has the correct 
          <code className="mx-1">VITE_SUPABASE_URL</code> and 
          <code className="mx-1">VITE_SUPABASE_ANON_KEY</code> values from your Supabase project settings.
        </div>
      </div>
    </div>
  )
}

export { SetupInstructions }
