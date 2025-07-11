
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">
            © 2025 RFQ Rocket. All rights reserved.
          </p>
          <div className="mt-4 space-x-6">
            <Link to="/about" className="text-gray-500 hover:text-gray-700">
              About
            </Link>
            <Link to="/contact" className="text-gray-500 hover:text-gray-700">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
