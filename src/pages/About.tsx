
import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Industries We Serve</h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            RFQRocket serves businesses across various industries, helping them streamline their procurement processes and win more contracts.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Technology</h3>
            <p className="text-gray-600">Software development, IT services, and technology consulting companies.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Manufacturing</h3>
            <p className="text-gray-600">Equipment suppliers, parts manufacturers, and industrial service providers.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Professional Services</h3>
            <p className="text-gray-600">Consulting, legal, accounting, and other professional service firms.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Construction</h3>
            <p className="text-gray-600">General contractors, specialty trades, and construction material suppliers.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Healthcare</h3>
            <p className="text-gray-600">Medical equipment suppliers, healthcare IT, and pharmaceutical companies.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Government Contractors</h3>
            <p className="text-gray-600">Federal, state, and local government service providers and suppliers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
