
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Simplify Gov Bids — <span className="text-blue-600">Instantly Create RFQs and Proposals</span> from Any Solicitation!
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              Upload your PDF or DOCX and get a clean, professional RFQs and proposals in minutes. No reading 200+ pages. No confusion. Just clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/rfq-processor">
                <Button size="lg" className="text-lg px-8 bg-blue-600 hover:bg-blue-700 rounded-lg">
                  Generate Smarter RFQs & Proposals – Try for Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 rounded-lg border-gray-300">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Images */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg h-96">
              {/* First image - positioned at bottom left */}
              <div className="absolute bottom-0 left-0 z-10">
                <div className="w-72 h-48 rounded-xl overflow-hidden shadow-xl bg-gray-200 transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src="/lovable-uploads/2dbb709f-c707-491d-88a7-bd805e344cca.png"
                    alt="Professional man in apron working with tablet"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Second image - positioned at top right, slightly overlapping */}
              <div className="absolute top-0 right-0 z-20">
                <div className="w-64 h-44 rounded-xl overflow-hidden shadow-xl bg-gray-200 transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src="/lovable-uploads/3afa0a30-bd56-4705-a131-48c26c9e09b6.png"
                    alt="Professional women collaborating with laptop"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
