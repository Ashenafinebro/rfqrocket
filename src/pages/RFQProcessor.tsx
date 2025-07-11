
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download } from "lucide-react";
import { toast } from "sonner";

const RFQProcessor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const processDocument = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      setResult("Sample RFQ generated successfully!");
      toast.success("RFQ generated successfully!");
    } catch (error) {
      toast.error("Error processing document");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">RFQ Document Processor</h1>
        
        <div className="grid gap-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Solicitation Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-gray-500">PDF, DOC, DOCX files supported</p>
                </label>
              </div>
              
              {selectedFile && (
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={processDocument}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? "Processing..." : "Generate RFQ"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Generated RFQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">{result}</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  Download RFQ Document
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFQProcessor;
