
import React from 'react';

const Contact = () => {
  const faqs = [
    {
      question: "What file formats are supported?",
      answer: "RFQRocket supports PDF, Word documents (.doc, .docx), and most common text formats."
    },
    {
      question: "How accurate are the AI-generated proposals?",
      answer: "Our AI analyzes your specific RFQ requirements to generate highly relevant proposals. You can always review and customize the output before submission."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. All uploaded documents are processed securely and deleted after processing."
    },
    {
      question: "Can I customize the generated proposals?",
      answer: "Absolutely! The AI-generated proposals serve as a comprehensive starting point that you can review and modify as needed."
    },
    {
      question: "What is the pricing structure?",
      answer: "We offer flexible pricing plans to suit different business needs. Check our pricing page for detailed information."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about RFQRocket.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
          <p className="text-gray-600 mb-6">
            By using RFQRocket, you agree to our terms of service and privacy policy. 
            We are committed to protecting your privacy and ensuring the security of your data.
          </p>
          <p className="text-sm text-gray-500">
            For additional support or questions, please contact Orbena Federal Services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
