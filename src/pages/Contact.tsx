
const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Have questions about RFQ Rocket? We'd love to hear from you.
          </p>
          <p className="text-lg">
            Email: <a href="mailto:support@rfqrocket.com" className="text-blue-600 hover:underline">
              support@rfqrocket.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
