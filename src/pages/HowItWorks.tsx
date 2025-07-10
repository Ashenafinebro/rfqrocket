
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Bot, FileText, CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      title: "Upload Solicitation",
      description: "Start with any PDF, DOCX, or RFP document.",
      icon: Upload,
      details: [
        "Supports PDF, DOC, DOCX, and TXT formats",
        "Secure, encrypted file transfer",
        "Files are automatically deleted after 24 hours",
        "No file size limits for paid users"
      ]
    },
    {
      step: 2,
      title: "Generate RFQ",
      description: "Our AI extracts key details to create a clean, vendor-safe Request for Quote (RFQ).",
      icon: Bot,
      details: [
        "Identifies critical requirements and deadlines",
        "Extracts technical specifications",
        "Creates vendor-safe documentation",
        "Removes sensitive government information"
      ]
    },
    {
      step: 3,
      title: "Upload Vendor Quote",
      description: "Add the supplier's quote and the original solicitation to the system.",
      icon: FileText,
      details: [
        "Upload supplier quotes in any format",
        "Combines with original solicitation data",
        "Automatic price and specification matching",
        "Validates completeness and compliance"
      ]
    },
    {
      step: 4,
      title: "Generate Final Proposal",
      description: "Instantly produce a professional, government-facing proposal ready for submission.",
      icon: CheckCircle,
      details: [
        "Professional formatting that meets government standards",
        "Downloadable in PDF and Word formats",
        "Fully editable and customizable",
        "Ready for immediate submission"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How RFQRocket Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Turn complex solicitations into ready-to-send proposals in just 4 simple steps
          </p>
          
          {/* YouTube Video Embed */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="How RFQRocket Works - Step by Step Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Watch our 3-minute tutorial to see RFQRocket in action
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-600">
              From solicitation to professional proposal in minutes
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={step.step} className={`flex flex-col lg:flex-row items-center gap-8 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}>
                <div className="flex-1">
                  <Card className="shadow-lg border-0">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {step.step < 10 ? `0${step.step}` : step.step}
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <step.icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl text-gray-900">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex-1 flex justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <step.icon className="h-24 w-24 text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose RFQRocket?
            </h2>
            <p className="text-xl text-gray-600">
              Built specifically for government contracting professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-3">Lightning Fast</CardTitle>
              <p className="text-gray-600">Process documents in minutes, not hours or days</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-3">Professional Quality</CardTitle>
              <p className="text-gray-600">Government-standard formatting and compliance</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-3">Accuracy Guaranteed</CardTitle>
              <p className="text-gray-600">AI-powered extraction with human-level precision</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Try RFQRocket today and see how easy government contracting can be
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Start Free Demo
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
