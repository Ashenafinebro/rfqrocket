
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mergedText, rfqFileName, solicitationFileName } = await req.json();

    if (!mergedText || mergedText.trim().length < 100) {
      throw new Error('Insufficient content from documents. Please ensure both documents contain readable text.');
    }

    console.log('Generating proposal for:', rfqFileName, 'and', solicitationFileName);
    console.log('Merged text length:', mergedText.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a Government Proposal Writer specializing in creating professional, compliant proposals for federal contracting opportunities.

Your task is to generate a comprehensive government proposal that directly responds to the provided RFQ and Solicitation documents. This proposal will be submitted to a government agency by a prime contractor.

📋 **PROPOSAL STRUCTURE:**

**PART 1: EXECUTIVE SUMMARY**
• Brief overview of your company's understanding of the requirement
• Key value propositions and competitive advantages
• Summary of proposed approach and solution

**PART 2: TECHNICAL APPROACH**
• Detailed methodology for meeting all technical requirements
• Work breakdown structure with phases and milestones
• Quality assurance and control measures
• Risk mitigation strategies

**PART 3: MANAGEMENT APPROACH**
• Project management methodology
• Organizational structure and team composition
• Communication plan and reporting procedures
• Schedule management and delivery timelines

**PART 4: PERSONNEL QUALIFICATIONS**
• Key personnel biographies and qualifications
• Relevant experience and certifications
• Staff allocation and responsibility matrix
• Training and professional development plans

**PART 5: PAST PERFORMANCE**
• Relevant contract experience with similar scope
• Client references and performance ratings
• Lessons learned and best practices applied
• Capability demonstrations

**PART 6: COST PROPOSAL OVERVIEW**
• Cost structure and pricing strategy
• Cost-benefit analysis
• Value engineering opportunities
• Payment schedule and terms

**PART 7: COMPLIANCE MATRIX**
• Point-by-point response to all solicitation requirements
• Regulatory compliance statements
• Certification and representation requirements
• Exception and deviation statements (if any)

🎯 **TONE & STYLE:**
- Professional, authoritative, and confident
- Government-compliant language and terminology
- Clear, concise, and well-organized
- Demonstrates deep understanding of government contracting
- Shows commitment to excellence and mission success

✅ **REQUIREMENTS:**
- Address ALL requirements from both RFQ and Solicitation
- Use proper government contracting terminology
- Include compliance statements and certifications
- Demonstrate understanding of the government's mission and needs
- Show how your solution provides best value to the government

Generate a comprehensive, professional government proposal that positions the contractor as the ideal choice for this opportunity.`
          },
          {
            role: 'user',
            content: `Please generate a comprehensive government proposal based on the following RFQ and Solicitation documents. Create a professional response that addresses all requirements and positions our company as the best choice for this contract opportunity:

MERGED DOCUMENT CONTENT:
${mergedText}

Generate a complete government proposal now:`
          }
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const proposalContent = data.choices[0]?.message?.content;
    
    if (!proposalContent) {
      throw new Error('Failed to generate proposal content');
    }

    return new Response(JSON.stringify({ 
      proposalContent,
      rfqFileName,
      solicitationFileName,
      mergedText: mergedText.substring(0, 1000) + '...' // Return truncated version for reference
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-proposal function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
