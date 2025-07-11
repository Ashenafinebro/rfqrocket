
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Zap, Download } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            RFQ <span className="text-blue-600">Rocket</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform government solicitations into professional RFQs and winning proposals with AI-powered automation
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/rfq-processor">
                Get Started <Upload className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/how-it-works">
                How It Works
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Upload Documents</h3>
            <p className="text-gray-600">
              Upload government solicitations in PDF or Word format for instant processing
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Processing</h3>
            <p className="text-gray-600">
              Advanced AI analyzes requirements and generates professional RFQs automatically
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Export & Send</h3>
            <p className="text-gray-600">
              Download polished RFQs and proposals ready to send to vendors
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Streamline Your RFQ Process?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of professionals who save hours every week with RFQ Rocket
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link to="/rfq-processor">
              Start Processing Documents <FileText className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
