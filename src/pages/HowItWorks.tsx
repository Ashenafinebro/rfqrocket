
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Cpu, Download, Mail } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Document",
      description: "Upload your government solicitation document (PDF or Word format)"
    },
    {
      icon: Cpu,
      title: "AI Processing",
      description: "Our AI analyzes the document and extracts key requirements"
    },
    {
      icon: Download,
      title: "Generate RFQ",
      description: "Receive a professional RFQ ready to send to vendors"
    },
    {
      icon: Mail,
      title: "Send & Track",
      description: "Email RFQs to vendors and track responses"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">How RFQ Rocket Works</h1>
          <p className="text-xl text-gray-600">
            Transform complex solicitations into professional RFQs in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="text-center relative">
              <CardHeader>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Why Choose RFQ Rocket?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">Reduce RFQ creation time from hours to minutes</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Professional Quality</h3>
              <p className="text-gray-600">AI-generated RFQs meet industry standards</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">Simple upload and download process</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
