
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import { Rocket, Users, Zap, CheckCircle, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const features = [
    {
      title: 'Fast Processing',
      description: 'Upload your solicitation and get professional RFQs in minutes, not hours.',
      icon: Rocket,
    },
    {
      title: 'AI-Powered Analysis',
      description: 'Our AI extracts key requirements and creates tailored responses automatically.',
      icon: Users,
    },
    {
      title: 'Professional Output',
      description: 'Generate clean, formatted documents ready for submission.',
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Process Steps */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple three-step process to transform your solicitation documents into professional RFQs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Upload Document</h3>
              <p className="text-gray-600">Upload your solicitation PDF, DOCX, or TXT file</p>
            </div>
            
            <div className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">AI Processing</h3>
              <p className="text-gray-600">Our AI extracts all key requirements and data</p>
            </div>
            
            <div className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Generate RFQ</h3>
              <p className="text-gray-600">Download or email a professional RFQ document</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose RFQRocket?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to streamline your government contracting process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Supporting Businesses Across Industries</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { name: 'Janitorial', icon: '🧹' },
              { name: 'Consulting', icon: '💼' },
              { name: 'IT Services', icon: '💻' },
              { name: 'Staffing', icon: '👥' },
              { name: 'Supplies', icon: '📦' },
            ].map((industry) => (
              <div key={industry.name}>
                <div className="text-4xl mb-3">{industry.icon}</div>
                <p className="font-medium text-gray-700">{industry.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Ready to simplify your government contracting process?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start generating professional RFQ documents in minutes, not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rfq-processor">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg">
                Get Started for Free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg rounded-lg border-gray-300">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
