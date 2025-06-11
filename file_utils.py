
import PyPDF2
from docx import Document

def allowed_file(filename, allowed_extensions):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def extract_text_from_file(filepath, filename):
    """Extract text from various file formats"""
    text = ""
    try:
        if filename.endswith('.pdf'):
            with open(filepath, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                text = '\n'.join([page.extract_text() for page in reader.pages if page.extract_text()])
        elif filename.endswith('.docx'):
            doc = Document(filepath)
            text = '\n'.join([para.text for para in doc.paragraphs if para.text])
        elif filename.endswith('.txt'):
            with open(filepath, 'r', encoding='utf-8') as f:
                text = f.read()
        return text.strip()
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        return ""

def split_text(text, max_length=5000):
    """Split text into chunks for processing"""
    paragraphs = text.split('\n')
    chunks = []
    current_chunk = []
    current_length = 0
    
    for para in paragraphs:
        para_length = len(para)
        if current_length + para_length > max_length:
            chunks.append('\n'.join(current_chunk))
            current_chunk = [para]
            current_length = para_length
        else:
            current_chunk.append(para)
            current_length += para_length
    
    if current_chunk:
        chunks.append('\n'.join(current_chunk))
    
    return chunks
