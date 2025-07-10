
import { extractTextFromPDF } from './pdfExtractor';
import mammoth from 'mammoth';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Enhanced helper function to extract readable text from different file types
const extractTextContent = async (file: File): Promise<string> => {
  const fileName = file.name.toLowerCase();
  
  // Handle different file types
  if (fileName.endsWith('.pdf')) {
    // Use the dedicated PDF extractor
    return await extractTextFromPDF(file);
  } else if (fileName.endsWith('.txt')) {
    // For text files, read as UTF-8
    return await file.text();
  } else if (fileName.endsWith('.docx')) {
    // Use mammoth for .docx files
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else if (fileName.endsWith('.doc')) {
    // For legacy .doc files, try to read as text
    const text = await file.text();
    return text.substring(0, 25000);
  } else {
    // Fallback for other file types
    const text = await file.text();
    return text.substring(0, 25000);
  }
};

export const processDocumentAndGenerateRFQ = async (fileOrText: File | string, apiKey: string, fileName: string = 'document') => {
  let extractedText: string;
  
  if (typeof fileOrText === 'string') {
    // If it's already text (legacy support)
    extractedText = fileOrText.substring(0, 25000);
  } else {
    // If it's a file, extract text properly
    extractedText = await extractTextContent(fileOrText);
  }
  
  // If no meaningful text was extracted, return error
  if (extractedText.trim().length < 50) {
    throw new Error('Unable to extract sufficient readable text from the document. Please ensure the document contains readable text or try a different file format.');
  }

  console.log('Extracted text length:', extractedText.length);
  console.log('First 500 characters of extracted text:', extractedText.substring(0, 500));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are the RFQ Request Generator for a private company sourcing commercial services from vendors.

The user will provide or upload a solicitation document that describes a scope of work for services (e.g., testing, installation, repair). Your task is to generate a professional Request for Quote (RFQ) letter or email to send to suppliers or subcontractors — without disclosing that this originates from a government solicitation or that the user is a middleman.

📄 Output: A clean, vendor-ready RFQ that includes:

**PART 1: EMAIL SECTION**
• A formal, neutral commercial introduction (no mention of government or third parties)
• A table with:
  - Description of each service or deliverable
  - Unit (e.g., each, hour, shipment)
  - Quantity (based on solicitation)
• A bullet list of technical/service requirements (certifications, turnaround times, performance standards)
• A clear response deadline
• Contact information placeholders for reply (Name, Email, Phone)
• A respectful closing

**PART 2: DETAILED RFQ DOCUMENT SECTION**
After the email, add a comprehensive RFQ document with:
• Executive Summary of project requirements
• Detailed Scope of Work with numbered sections
• Technical Specifications and Standards
• Performance Requirements and Metrics
• Deliverables and Timeline
• Qualification Requirements for vendors
• Submission Requirements and Evaluation Criteria
• Terms and Conditions
• Contact Information for Questions

🎯 Tone: Formal and businesslike — as if a private company is sourcing vendor services for an internal project.

✅ Do not mention the U.S. government, solicitations, federal language, or prime/subcontractor relationships. Keep the request vendor-facing and neutral.

✅ Sample Output Style:
**EMAIL SECTION:**
Subject: Request for Pricing – [Service Type] Services

Dear [Vendor Name],

We are seeking pricing and service availability for [service description] to be performed at [general location]. The scope of work includes the following:

[Table with Description, Unit, Quantity]

[Bullet list of requirements and specifications]

Kindly include your pricing, service details, and evidence of your qualifications or certifications. We ask that responses be submitted no later than [Insert Deadline].

Please let us know if you have any questions.

Sincerely,
[Your Name]
[Your Company Name]
[Phone] | [Email]

---

**DETAILED RFQ DOCUMENT:**

REQUEST FOR QUOTE (RFQ)
[Project Title]

1. EXECUTIVE SUMMARY
[Brief overview of project needs]

2. SCOPE OF WORK
[Detailed work breakdown]

3. TECHNICAL SPECIFICATIONS
[Technical requirements and standards]

4. PERFORMANCE REQUIREMENTS
[Performance metrics and expectations]

5. DELIVERABLES AND TIMELINE
[What needs to be delivered and when]

6. VENDOR QUALIFICATIONS
[Required certifications, experience, capabilities]

7. SUBMISSION REQUIREMENTS
[How to respond, what to include]

8. EVALUATION CRITERIA
[How proposals will be evaluated]

9. TERMS AND CONDITIONS
[Contract terms and conditions]

10. CONTACT INFORMATION
[Project contact details]`
        },
        {
          role: 'user',
          content: `Please generate a professional, vendor-ready RFQ email AND detailed RFQ document from the following solicitation document. Create a clean commercial request that vendors can respond to directly, without any government references or middleman language:

DOCUMENT CONTENT:
${extractedText}

Generate a complete RFQ email followed by a detailed RFQ document now:`
        }
      ] as OpenAIMessage[],
      temperature: 0.2,
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const rfqContent = data.choices[0]?.message?.content;
  
  if (!rfqContent) {
    throw new Error('Failed to generate RFQ content');
  }

  return {
    rfqContent,
    fileName,
    extractedText
  };
};

// Function to generate Word document from RFQ content
export const generateWordDocument = (rfqContent: string, fileName: string): Blob => {
  // Create a properly formatted Word document with bullet points instead of tables
  const wordContent = `
    <html xmlns:v="urn:schemas-microsoft-com:vml" 
          xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="ProgId" content="Word.Document">
      <meta name="Generator" content="Microsoft Word 15">
      <meta name="Originator" content="Microsoft Word 15">
      <title>Request for Quote (RFQ)</title>
      <!--[if gte mso 9]>
      <xml>
        <o:DocumentProperties>
          <o:Author>RFQ Generator</o:Author>
          <o:LastAuthor>RFQ Generator</o:LastAuthor>
          <o:Created>${new Date().toISOString()}</o:Created>
          <o:LastSaved>${new Date().toISOString()}</o:LastSaved>
          <o:Version>16.00</o:Version>
        </o:DocumentProperties>
      </xml>
      <![endif]-->
      <style>
        @page WordSection1 {
          size: 8.5in 11.0in;
          margin: 1.0in 1.0in 1.0in 1.0in;
          mso-header-margin: .5in;
          mso-footer-margin: .5in;
          mso-paper-source: 0;
        }
        div.WordSection1 { page: WordSection1; }
        body { 
          font-family: 'Calibri', sans-serif; 
          font-size: 11pt;
          line-height: 1.15; 
          margin: 0; 
          color: #000000;
        }
        h1 { 
          font-family: 'Calibri', sans-serif;
          font-size: 18pt; 
          font-weight: bold; 
          text-align: center; 
          margin: 24pt 0 18pt 0; 
          color: #1f497d;
          text-decoration: underline;
        }
        h2 { 
          font-family: 'Calibri', sans-serif;
          font-size: 14pt; 
          font-weight: bold; 
          margin: 18pt 0 12pt 0; 
          color: #1f497d;
        }
        h3 { 
          font-family: 'Calibri', sans-serif;
          font-size: 12pt; 
          font-weight: bold; 
          margin: 12pt 0 6pt 0; 
          color: #1f497d;
        }
        p { 
          font-family: 'Calibri', sans-serif;
          font-size: 11pt;
          margin: 0 0 6pt 0; 
          line-height: 1.15;
        }
        ul, ol { 
          font-family: 'Calibri', sans-serif;
          font-size: 11pt;
          margin: 6pt 0 6pt 0; 
          padding-left: 18pt;
        }
        li { 
          margin: 3pt 0; 
          line-height: 1.15;
        }
        .header { 
          text-align: center; 
          margin: 0 0 24pt 0; 
        }
        .date { 
          text-align: right; 
          margin: 0 0 18pt 0; 
          font-weight: bold;
        }
        .signature-section {
          margin-top: 24pt;
          page-break-inside: avoid;
        }
        .contact-info {
          margin-top: 12pt;
          font-style: italic;
        }
        .table-section {
          margin: 12pt 0;
          padding: 6pt;
          background-color: #f9f9f9;
          border-left: 3pt solid #1f497d;
        }
        .table-header {
          font-weight: bold;
          color: #1f497d;
          margin-bottom: 6pt;
        }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        <div class="header">
          <h1>REQUEST FOR QUOTE (RFQ)</h1>
        </div>
        <div class="date">
          Date: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        <div>
          ${rfqContent
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convert markdown-style tables to bullet points
            .replace(/(\|[^|\n]*\|[^|\n]*\|[^\n]*)/g, (match) => {
              const rows = match.split('\n').filter(row => row.trim());
              if (rows.length < 2) return match;
              
              let bulletContent = '<div class="table-section">';
              let headerProcessed = false;
              
              rows.forEach((row, index) => {
                const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
                if (cells.length === 0) return;
                
                if (index === 0 && !headerProcessed) {
                  bulletContent += '<div class="table-header">Service Requirements:</div>';
                  headerProcessed = true;
                } else if (!row.includes('---') && cells.length > 0) {
                  bulletContent += '<ul>';
                  cells.forEach((cell, cellIndex) => {
                    if (cell && cell !== '') {
                      const label = cellIndex === 0 ? 'Description' : 
                                   cellIndex === 1 ? 'Unit' : 
                                   cellIndex === 2 ? 'Quantity' : 
                                   `Item ${cellIndex + 1}`;
                      bulletContent += `<li><strong>${label}:</strong> ${cell}</li>`;
                    }
                  });
                  bulletContent += '</ul>';
                }
              });
              
              bulletContent += '</div>';
              return bulletContent;
            })}
        </div>
      </div>
    </body>
    </html>
  `;
  
  return new Blob([wordContent], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
};

// Keep the old functions for backward compatibility but mark as deprecated
export const analyzeDocument = async (text: string, apiKey: string, fileName: string = 'document') => {
  console.warn('analyzeDocument is deprecated, use processDocumentAndGenerateRFQ instead');
  return processDocumentAndGenerateRFQ(text, apiKey, fileName);
};

export const generateRFQ = async (analysisData: any, apiKey: string) => {
  console.warn('generateRFQ is deprecated, use processDocumentAndGenerateRFQ instead');
  return analysisData.rfqContent || 'No RFQ content available';
};
