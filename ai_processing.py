
import json
import time
import openai
from concurrent.futures import ThreadPoolExecutor
from file_utils import split_text
from config import Config

# Set OpenAI API key
openai.api_key = Config.OPENAI_API_KEY

# Thread pool executor for concurrent processing
executor = ThreadPoolExecutor(max_workers=Config.THREAD_POOL_WORKERS)

def process_chunk(chunk):
    """Process a single text chunk with OpenAI"""
    prompt = f"""Analyze this government solicitation document chunk and extract all possible information to create a comprehensive Request for Quotation (RFQ). Extract all sections, requirements, specifications, terms, and any relevant details. Structure the output as follows:

1. GENERAL_INFORMATION: Include solicitation number, title, agency, date, etc.
2. REQUIREMENTS: Detailed technical requirements and specifications
3. DELIVERABLES: List of all required deliverables
4. PERIOD_OF_PERFORMANCE: Start/end dates or duration
5. EVALUATION_CRITERIA: How proposals will be evaluated
6. SUBMISSION_REQUIREMENTS: Format, deadlines, submission instructions
7. TERMS_AND_CONDITIONS: Contractual terms and conditions
8. CONTACT_INFORMATION: Points of contact

Document Text:
{chunk}

Provide the output in JSON format with these exact top-level keys. Include all relevant details under each section."""
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-1106-preview",
            messages=[
                {"role": "system", "content": "You are a government contracts specialist that analyzes solicitation documents and creates professional RFQs."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error processing chunk: {str(e)}")
        return {}

def generate_rfq(text):
    """Generate RFQ data from extracted text"""
    start_time = time.time()
    text_chunks = split_text(text)
    rfq_data = {
        'GENERAL_INFORMATION': {},
        'REQUIREMENTS': [],
        'DELIVERABLES': [],
        'PERIOD_OF_PERFORMANCE': {},
        'EVALUATION_CRITERIA': [],
        'SUBMISSION_REQUIREMENTS': [],
        'TERMS_AND_CONDITIONS': [],
        'CONTACT_INFORMATION': {}
    }
    
    futures = [executor.submit(process_chunk, chunk) for chunk in text_chunks]
    for future in futures:
        chunk_data = future.result()
        for section in rfq_data.keys():
            if section in chunk_data:
                if isinstance(rfq_data[section], dict):
                    rfq_data[section].update(chunk_data[section])
                elif isinstance(rfq_data[section], list):
                    if isinstance(chunk_data[section], list):
                        rfq_data[section].extend(chunk_data[section])
                    else:
                        rfq_data[section].append(chunk_data[section])
    
    print(f"RFQ generation completed in {time.time() - start_time:.2f} seconds")
    return rfq_data
