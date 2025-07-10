
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, MapPin, FileText, Shield, Users, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const faqItems = [
    {
      question: "How fast will I receive my RFQ?",
      answer: "Most RFQs are processed and delivered within 24-48 hours after document upload. Complex documents may take up to 72 hours.",
      icon: FileText
    },
    {
      question: "What file types can I upload?",
      answer: "We support PDF, DOC, DOCX, and TXT files. Files should be under 50MB in size for optimal processing.",
      icon: FileText
    },
    {
      question: "Is my uploaded document private and secure?",
      answer: "Yes, absolutely. All documents are encrypted during upload and processing. We never share your documents with third parties and delete them after processing.",
      icon: Shield
    },
    {
      question: "Who should use this service?",
      answer: "Small to medium-sized contractors, vendors, and consultants who respond to government RFQs and want to save time while improving accuracy.",
      icon: Users
    },
    {
      question: "What information is extracted from my documents?",
      answer: "We extract key requirements, deadlines, submission guidelines, contact information, technical specifications, and other critical details needed for your response.",
      icon: FileText
    },
    {
      question: "Can I edit the extracted information?",
      answer: "Yes, all extracted information is fully editable. You can review, modify, and customize the content before finalizing your RFQ response.",
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">FAQ & Terms</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions and review our terms of service
          </p>
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="terms">Terms of Use</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-lg">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-6">
                      <div className="ml-12">
                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Contact Section */}
            <div className="max-w-4xl mx-auto mt-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                <p className="text-xl text-muted-foreground">
                  Get in touch with us for any questions or collaborations
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Send us a message</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">Message</Label>
                          <textarea
                            id="message"
                            name="message"
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Send Message
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Email</h3>
                          <p className="text-muted-foreground">hello@yourapp.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Phone</h3>
                          <p className="text-muted-foreground">+1 (555) 123-4567</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Office</h3>
                          <p className="text-muted-foreground">
                            123 Business Ave<br />
                            Suite 100<br />
                            City, ST 12345
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="terms" className="space-y-8">
            <Card className="shadow-lg max-w-4xl mx-auto">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <FileText className="h-6 w-6" />
                  Terms and Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Account Registration
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    All users must create an account with a valid email address to access the platform.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Demo Access
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    A demo version is available to all new users at no cost, limited to 1-2 RFQ generations. 
                    Demo RFQs may be watermarked or restricted to preview format.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Subscription Required
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Access to full platform capabilities requires a paid subscription or one-time purchase, 
                    which includes downloadable RFQs, unlimited processing, and priority support.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Use of Service
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You agree to use the platform for legal and business purposes only. Resale or 
                    redistribution of generated RFQs is not permitted without written permission.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Data Handling
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Uploaded documents are processed securely and deleted after 24 hours. No user data 
                    is sold or shared without consent.
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    By signing up for RFQRocket, you agree to these terms and conditions.
                  </p>
                  <div className="mt-4 flex gap-4">
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                      Privacy Policy
                    </Link>
                    <Link to="/acceptable-use" className="text-blue-600 hover:text-blue-800 underline">
                      Acceptable Use Policy
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Contact;
