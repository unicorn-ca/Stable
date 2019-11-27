import os, webbrowser
import sys
import time
from multiprocessing import Process
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

# Predeploy
# Deploy

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(open('index.html', 'rb').read())
        elif os.path.basename(self.path) in ['full-stack.template.yaml']:
            self.send_response(200)
            self.send_header('Content-Type', 'text/yaml')
            self.end_headers()
            self.wfile.write(open(self.path[1:], 'rb').read())
        elif self.path.split('/')[1] in ["assets", "lib"]:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(open(self.path[1:].split('?')[0], 'rb').read())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'404 Not found')

    def do_POST(self):
        if self.path == '/deploy':
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            print(post_data)

            post_data = json.loads(post_data)

            # Edit stack/params.yaml
            with open('../../stack/params.yaml', 'r') as file:
                params = file.readlines()
            
            params[2]  = f"    DevAwsAccountId: {post_data['DevAwsAccountId']}\n"
            params[3]  = f"    ProdAwsAccountId: {post_data['ProdAwsAccountId']}\n"
            params[4]  = f"    AppName: {post_data['appName']}\n"
            params[5]  = f"    BuildImageName: aws/codebuild/standard:2.0\n"
            params[6]  = f"    QSS3BucketName: {post_data['QSS3BucketName']}\n"
            params[7]  = f"    QSS3KeyPrefix:  herd/test1\n"
            params[8]  = f"    QSS3BucketRegion: {post_data['region']}\n"
            params[9]  = f"    ProdChildAccountRoleName: pipeline-prod-role\n"
            params[10] = f"    DevChildAccountRoleName: pipeline-dev-role\n"
            params[11] = f"    StagingBucket: {post_data['StagingBucket']}\n"
            params[12] = f"    FuzzerDeployKey: {post_data['fuzzer_deployment_key']}\n"

            with open('../../stack/params.yaml', 'w') as file:
                file.writelines(params)


            # Edit child/dev.params.yaml
            with open('../../child/dev.params.yaml', 'r') as file:
                params = file.readlines()

            params[2] = f"    CentralAwsAccountId: {post_data['CentralAwsAccountId']}\n"
            params[3] = f"    ChildAccountRoleName: pipeline-dev-role\n"
            
            with open('../../child/dev.params.yaml', 'w') as file:
                file.writelines(params)

            
            # Edit child/prod.params.yaml
            with open('../../child/prod.params.yaml', 'r') as file:
                params = file.readlines()

            params[2] = f"    DevAwsAccountId: {post_data['DevAwsAccountId']}\n"
            params[3] = f"    ChildAccountRoleName: pipeline-prod-role\n"
            
            with open('../../child/prod.params.yaml', 'w') as file:
                file.writelines(params)


            # Edit predeploy/params.yaml
            with open('../../predeploy/params.yaml', 'r') as file:
                params = file.readlines()

            params[2] = f"    StagingBucketName: {post_data['StagingBucket']}\n"
            params[3] = f"    DevAwsAccountId: {post_data['DevAwsAccountId']}\n"
            params[4] = f"    ProdAwsAccountId: {post_data['ProdAwsAccountId']}\n"
            
            with open('../../predeploy/params.yaml', 'w') as file:
                file.writelines(params)

            # herd.run_deployments(config)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{success: true}') # Send something so fetch doesnt produce an error

def start_server():
    httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
    httpd.serve_forever()

if __name__ == '__main__':
    p1 = Process(target=start_server)
    p1.start()

    os.system("cmd.exe /C 'start http://127.0.0.1:8000'")
    url = "http://127.0.0.1:8000"
    webbrowser.open_new(url)
    
    # print("Error no default browser found on your device. To view the wizard open a browser and go to 'http://127.0.0.1:8000' cheers")