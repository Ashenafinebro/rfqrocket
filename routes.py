
import os
from datetime import datetime
from flask import request, jsonify, send_from_directory, render_template
from werkzeug.utils import secure_filename
from config import Config
from file_utils import allowed_file, extract_text_from_file
from ai_processing import generate_rfq
from document_generator import create_rfq_document
from email_service import send_email_with_attachment

def init_routes(app):
    """Initialize all Flask routes"""
    
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/upload')
    def upload_page():
        return render_template('upload.html')

    @app.route('/api/upload', methods=['POST'])
    def upload_file():
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename, Config.ALLOWED_EXTENSIONS):
            filename = secure_filename(file.filename)
            upload_path = os.path.join(Config.UPLOAD_FOLDER, filename)
            file.save(upload_path)
            
            try:
                text = extract_text_from_file(upload_path, filename)
                if not text:
                    return jsonify({'error': 'Could not extract text from file'}), 500
                
                rfq_data = generate_rfq(text)
                if not rfq_data:
                    return jsonify({'error': 'Failed to generate RFQ data'}), 500
                
                output_filename = f"RFQ_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
                output_path = os.path.join(Config.PROCESSED_FOLDER, output_filename)
                
                if not create_rfq_document(rfq_data, output_path):
                    return jsonify({'error': 'Failed to create RFQ document'}), 500
                
                return jsonify({
                    'success': True,
                    'download_url': f'/download/{output_filename}',
                    'filename': output_filename
                })
            except Exception as e:
                return jsonify({'error': str(e)}), 500
            finally:
                if os.path.exists(upload_path):
                    os.remove(upload_path)
        else:
            return jsonify({'error': 'File type not allowed'}), 400

    @app.route('/api/send-email', methods=['POST'])
    def send_email():
        data = request.get_json()
        if not data or 'email' not in data or 'filename' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        email = data['email']
        filename = data['filename']
        filepath = os.path.join(Config.PROCESSED_FOLDER, filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        subject = "Your RFQ Document from RFQRocket"
        body = f"""Dear Recipient,

Please find attached the Request for Quotation (RFQ) document generated from your source file.

Document: {filename}
Generated on: {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}

If you have any questions or need further assistance, please don't hesitate to contact us.

Best regards,
The RFQRocket Team"""
        
        if send_email_with_attachment(email, subject, body, filepath):
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Failed to send email'}), 500

    @app.route('/download/<filename>')
    def download_file(filename):
        return send_from_directory(Config.PROCESSED_FOLDER, filename, as_attachment=True)
