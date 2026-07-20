#!/usr/bin/env python3
"""
CareerFlow AI - Lightweight Data Sync Server
Provides automatic cross-device synchronization between Phone & Desktop
using standard Python 3 (no dependencies required).
"""

import http.server
import socketserver
import json
import os

PORT = 8765
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')

# Initial Default Data if data.json does not exist
DEFAULT_DATA = {
    "profile": {
        "name": "Alex Vance",
        "contact": "alex.vance@example.com | (555) 019-2831",
        "linkedin": "https://linkedin.com/in/alexvance-dev",
        "portfolio": "https://github.com/alexvance-code",
        "summary": "Full-stack software engineer with 5+ years of experience building high-performance web applications, cloud microservices, and slick user interfaces with React, Node.js, and TypeScript.",
        "pitch": "I excel at bringing ambitious products from zero to one. Passionate about system design, frontend performance, and delivering memorable developer and end-user experiences."
    },
    "jobs": [
        {
            "id": "job_101",
            "company": "Vercel",
            "position": "Senior Frontend Engineer",
            "status": "Offered",
            "workMode": "Remote",
            "salary": "$165,000 - $190,000",
            "url": "https://vercel.com/careers",
            "location": "San Francisco, CA (Remote)",
            "dateApplied": "2026-06-25",
            "followUpDate": "2026-07-22",
            "contact": "Elena Rostova (Recruiting Manager)",
            "notes": "Completed 4 rounds of interviews including system design & pair programming. Team was super friendly. Offer received on July 18th!"
        },
        {
            "id": "job_102",
            "company": "Stripe",
            "position": "Staff Software Engineer - Dashboard",
            "status": "Interviewing",
            "workMode": "Hybrid",
            "salary": "$180,000 - $215,000",
            "url": "https://stripe.com/jobs",
            "location": "Seattle, WA",
            "dateApplied": "2026-07-02",
            "followUpDate": "2026-07-21",
            "contact": "Marcus Vance (Technical Recruiter)",
            "notes": "Initial recruiter screen completed. Onsite technical interview scheduled for next Tuesday. Focus on API design and payment processing resilience."
        },
        {
            "id": "job_103",
            "company": "Airbnb",
            "position": "Full Stack Engineer - Host Systems",
            "status": "Screening",
            "workMode": "Remote",
            "salary": "$150,000 - $180,000",
            "url": "https://careers.airbnb.com",
            "location": "Remote",
            "dateApplied": "2026-07-10",
            "followUpDate": "2026-07-23",
            "contact": "Jordan Lee (Talent Acquisition)",
            "notes": "Submitted customized resume and referral from Chris. Waiting for recruiter screen confirmation."
        },
        {
            "id": "job_104",
            "company": "OpenAI",
            "position": "AI Applications Engineer",
            "status": "Applied",
            "workMode": "Onsite",
            "salary": "$190,000 - $240,000",
            "url": "https://openai.com/careers",
            "location": "San Francisco, CA",
            "dateApplied": "2026-07-14",
            "followUpDate": "2026-07-24",
            "contact": "Recruiting Team",
            "notes": "Applied with cover letter focusing on AI agent workflows and LLM tool integrations."
        },
        {
            "id": "job_105",
            "company": "Figma",
            "position": "Product Engineer - Canvas UI",
            "status": "Applied",
            "workMode": "Hybrid",
            "salary": "$160,000 - $185,000",
            "url": "https://figma.com/careers",
            "location": "San Francisco, CA",
            "dateApplied": "2026-07-16",
            "followUpDate": "2026-07-25",
            "contact": "Careers Portal",
            "notes": "Highlighted WebGL and canvas rendering experience in application response."
        },
        {
            "id": "job_106",
            "company": "Linear",
            "position": "Senior Systems Engineer",
            "status": "Wishlist",
            "workMode": "Remote",
            "salary": "$170,000 - $200,000",
            "url": "https://linear.app/careers",
            "location": "Remote (US/EU)",
            "dateApplied": "",
            "followUpDate": "",
            "contact": "",
            "notes": "Love their product design and speed. Need to tweak resume to highlight local-first synchronization engine work before applying."
        },
        {
            "id": "job_107",
            "company": "Datadog",
            "position": "Frontend Systems Architect",
            "status": "Rejected",
            "workMode": "Remote",
            "salary": "$155,000 - $175,000",
            "url": "https://datadoghq.com/careers",
            "location": "New York, NY",
            "dateApplied": "2026-06-10",
            "followUpDate": "",
            "contact": "Dave Miller",
            "notes": "Position filled internally. Received standard polite rejection note on June 28."
        }
    ]
}

def load_data():
    if not os.path.exists(DATA_FILE):
        save_data(DEFAULT_DATA)
        return DEFAULT_DATA
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {DATA_FILE}: {e}")
        return DEFAULT_DATA

def save_data(data):
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving {DATA_FILE}: {e}")

class SyncHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow CORS for easy cross-origin mobile sync
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/data':
            data = load_data()
            payload = json.dumps(data).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/data':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                new_data = json.loads(body.decode('utf-8'))
                save_data(new_data)
                response = json.dumps({"status": "ok", "message": "Synced successfully"}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response)))
                self.end_headers()
                self.wfile.write(response)
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SyncHTTPRequestHandler) as httpd:
        print(f"CareerFlow Sync Server running on port {PORT}...")
        httpd.serve_forever()
