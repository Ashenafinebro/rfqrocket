import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Award, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const userTypes = [
    {
      title: 'Small Businesses',
      description: 'Quickly respond to government opportunities using simplified, AI-powered RFQs—no need to navigate hundreds of pages yourself.',
      image: '/lovable-uploads/1dc676d1-af2a-4227-8421-2209f10eee3c.png',
      imageAlt: 'Small business owners working together'
    },
    {
      title: 'Operations Teams',
      description: 'Eliminate manual copy-paste tasks and coordinate with vendors through one smart platform built for compliance and speed.',
      image: '/lovable-uploads/103f3e59-bc5c-4419-a071-87b0598815a1.png',
      imageAlt: 'Operations team member working'
    },
    {
      title: 'Freelancers',
      description: 'Close deals faster by generating vendor-safe RFQs and submitting polished government-ready proposals—all without hiring a back office.',
      image: '/lovable-uploads/1bc58bbf-d224-4540-9b3c-83600e273a38.png',
      imageAlt: 'Freelancer working on laptop'
    },
    {
      title: 'People Like You',
      description: 'From procurement advisors to small business owners—RFQRocket helps you quote faster, stay compliant, and win more deals.',
      image: '/lovable-uploads/f9b6f392-cc94-47e3-9082-64e81ad12a02.png',
      imageAlt: 'Professional working at desk'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Built for Small Businesses, Not Big Bureaucracies
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Big companies have complex tools. You just need results.
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            We created this tool to help small contractors, vendors, and consultants compete — and 
            win — without wasting time reading pages of government contracts.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Who Uses RFQRocket?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {userTypes.map((userType, index) => (
              <div key={userType.title} className="text-center relative">
                <div className="relative group mb-4">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100 shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <img 
                      src={userType.image} 
                      alt={userType.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  {/* Subtle background circle for depth */}
                  <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-blue-100 opacity-20 scale-110 -z-10 transition-opacity duration-300 group-hover:opacity-30"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 transition-colors duration-300 group-hover:text-blue-600">{userType.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {userType.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-16">
          <Link to="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              Get Started Today
            </Button>
          </Link>
        </div>

        <div className="text-center bg-gray-50 rounded-lg p-8">
          <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
            RFQRocket is proudly developed and operated by Orbena Federal Services LLC — a veteran-owned 
            company committed to helping small businesses succeed in government contracting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
