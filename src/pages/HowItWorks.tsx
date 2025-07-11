
import React from 'react';
import { FileText, Zap, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FileText className="h-12 w-12 text-blue-600" />,
      title: "Upload Your RFQ",
      description: "Simply upload your Request for Quotation document in any common format (PDF, Word, etc.)"
    },
    {
      icon: <Zap className="h-12 w-12 text-blue-600" />,
      title: "AI Analysis",
      description: "Our advanced AI analyzes your RFQ requirements and generates a comprehensive, professional proposal"
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
      title: "Download & Submit",
      description: "Review, customize if needed, and download your polished proposal ready for submission"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">How RFQRocket Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your RFQ documents into winning proposals in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-50 p-4 rounded-full">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Step {index + 1}: {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose RFQRocket?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Save Time & Effort</h3>
              <p className="text-gray-600 mb-6">
                Reduce proposal creation time from hours to minutes with our AI-powered automation.
              </p>
              
              <h3 className="text-lg font-semibold mb-4">Professional Quality</h3>
              <p className="text-gray-600">
                Generate polished, comprehensive proposals that stand out from the competition.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Easy to Use</h3>
              <p className="text-gray-600 mb-6">
                No technical expertise required. Our intuitive interface makes proposal generation simple.
              </p>
              
              <h3 className="text-lg font-semibold mb-4">Powered by Orbena</h3>
              <p className="text-gray-600">
                Backed by Orbena Federal Services' expertise in government contracting and procurement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
