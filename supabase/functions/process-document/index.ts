
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { extractedText, fileName } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const rfqContent = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      rfqContent,
      fileName,
      extractedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process document' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
