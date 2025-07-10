
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 mr-3 bg-blue-600 rounded-full">
              <img 
                src="/lovable-uploads/ce1746cb-92db-4df7-8217-26979c6cd0bf.png"
                alt="RFQRocket Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold">RFQRocket</span>
          </div>
          <p className="text-gray-400 mb-8">
            Powered by Orbena Federal Services
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors">Industries</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">FAQ & Terms</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="/signup" className="text-gray-300 hover:text-white transition-colors">Get Started</Link>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} RFQRocket. A service by Orbena Federal Services LLC.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
