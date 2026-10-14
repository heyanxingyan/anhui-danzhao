import http.server
import socketserver
import gzip
import io
import os

PORT = 8765

class GzipHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 对文本类资源启用gzip
        if self.path.endswith(('.js', '.css', '.html', '.json', '.svg')):
            self.send_header('Content-Encoding', 'gzip')
        super().end_headers()
    
    def do_GET(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, 'index.html')
        
        if not os.path.exists(path):
            self.send_error(404)
            return
        
        with open(path, 'rb') as f:
            content = f.read()
        
        # 对文本类资源gzip压缩
        if self.path.endswith(('.js', '.css', '.html', '.json', '.svg')):
            buf = io.BytesIO()
            with gzip.GzipFile(fileobj=buf, mode='wb', compresslevel=6) as f:
                f.write(content)
            content = buf.getvalue()
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(path))
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(path))
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)

os.chdir(r'C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site')
with socketserver.TCPServer(("", PORT), GzipHandler) as httpd:
    print(f"Gzip HTTP server running at http://localhost:{PORT}")
    httpd.serve_forever()
