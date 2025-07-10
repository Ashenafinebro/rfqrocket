
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, CheckCircle2, ExternalLink } from 'lucide-react';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Settings</h1>
          <p className="text-xl text-gray-600">
            Configuration and API management
          </p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Your API keys are now securely managed through Supabase Edge Functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              OpenAI API integration is configured and ready to use
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Secure API Management:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>API keys are stored securely in Supabase secrets</li>
                <li>No sensitive data is stored in your browser</li>
                <li>All AI processing happens on secure servers</li>
                <li>Your documents and data remain private</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">For Administrators:</h4>
              <p className="text-sm text-gray-600 mb-3">
                API keys are managed through the Supabase dashboard's Edge Functions secrets section.
              </p>
              <a 
                href="https://supabase.com/dashboard/project/gnvahoosychmrxodbipx/settings/functions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                <ExternalLink className="h-4 w-4" />
                Manage Secrets in Supabase
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
