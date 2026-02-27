import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

import download_invoice

app = Flask(__name__)
CORS(app)

@app.route('/api/download_invoices', methods=['POST'])
def trigger_download():
    data = request.json or {}
    target_invoices = data.get('invoices', [])
    
    if not target_invoices or not isinstance(target_invoices, list):
        return jsonify({"status": "error", "message": "Invalid format, expected list of invoices."}), 400
        
    try:
        custom_path = data.get('custom_path', '')
        
        print(f"API received request to download invoices: {len(target_invoices)} items...")
        print(f"Items: {target_invoices}")
        print(f"Custom Path: {custom_path}")
        
        # This runs synchronously and blocks the HTTP request. Wait times could be long for many items.
        zip_path = download_invoice.main(target_invoices, custom_path=custom_path)
        
        if zip_path and os.path.exists(zip_path):
            return send_file(zip_path, as_attachment=True)
            
        return jsonify({"status": "success", "message": f"เซฟลงโฟลเดอร์ {custom_path} เรียบร้อย!"})
    except Exception as e:
        print(f"Error occurred during download: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("Starting Invoice API Server on port 5000...")
    print("Make sure your FKB-Front-Kanban web app can reach http://localhost:5000")
    app.run(host='0.0.0.0', port=5000)
