
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, CheckCircle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-xl text-gray-600">RFQRocket - Powered by Orbena Federal Services</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <FileText className="h-6 w-6" />
              Terms and Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Account Registration
              </h3>
              <p className="text-gray-700 leading-relaxed">
                All users must create an account with a valid email address to access the platform.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Demo Access
              </h3>
              <p className="text-gray-700 leading-relaxed">
                A demo version is available to all new users at no cost, limited to 1-2 RFQ generations. 
                Demo RFQs may be watermarked or restricted to preview format.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Subscription Required
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Access to full platform capabilities requires a paid subscription or one-time purchase, 
                which includes downloadable RFQs, unlimited processing, and priority support.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Use of Service
              </h3>
              <p className="text-gray-700 leading-relaxed">
                You agree to use the platform for legal and business purposes only. Resale or 
                redistribution of generated RFQs is not permitted without written permission.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Data Handling
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Uploaded documents are processed securely and deleted after 24 hours. No user data 
                is sold or shared without consent.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">
                By signing up for RFQRocket, you agree to these terms and conditions.
              </p>
              <div className="mt-4 flex gap-4">
                <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </Link>
                <Link to="/acceptable-use" className="text-blue-600 hover:text-blue-800 underline">
                  Acceptable Use Policy
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
