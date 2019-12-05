import os, webbrowser
import sys
import time
from multiprocessing import Process
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import mimetypes
import yaml

# Predeploy
# Deploy

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def http_head(self, code=200, headers={}):
        self.send_response(code)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.http_head(200, {'Content-Type': 'text/html'})
            self.wfile.write(open('index.html', 'rb').read())
        elif os.path.basename(self.path) in ['full-stack.template.yaml']:
            self.http_head(200, {'Content-Type': 'text/yaml'})
            self.wfile.write(open(self.path[1:], 'rb').read())
        elif self.path.split('/')[1] in ["assets", "lib"]:
            file_path = self.path[1:].split('?')[0]
            self.http_head(200, {'Content-Type': mimetypes.guess_type(file_path)[0]})
            self.wfile.write(open(self.path[1:].split('?')[0], 'rb').read())
        else:
            self.http_head(404)
            self.wfile.write(b'404 Not found')

    def do_POST(self):
        if self.path == '/deploy':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            post_data = json.loads(post_data)

            self.configure_predeploy(post_data)
            self.configure_children(post_data)
            self.configure_stack(post_data)

            self.http_head(200, {'Content-Type': 'application/json'})
            self.wfile.write(b'{"success":true}')
            exit()
        else:
            self.http_head(404)
            self.wfile.write(b'404 Not found')

    def configure_load(self, path):
        class ConfigContextManager:
            def __init__(self, path):
                self._path = path

            def __enter__(self):
                self._data = yaml.load(open(f"../../{path}"), Loader=yaml.SafeLoader)
                return self._data

            def __exit__(self, exception_type, exception_value, traceback):
                if exception_type is not None:
                    # TODO: handle exceptions gracefully
                    print('Failed')
                else:
                    yaml.dump(self._data, open(f"../../{path}", 'w'))

        return ConfigContextManager(path)

    def configure_predeploy(self, data):
        """
        configure_predeploy
        -------------------

        Configures predeploy options.
        Herd Options:
            herd.predeploy.yaml - deployments.authentication.profile : master_profile
                                - deployments.stack_name             : predeploy_stack_name
                                - defaults.region                    : region
        Stack Options:
            predeploy/params.yaml - params.StagingBucketName : StagingBucket 
                                  - params.DevAwsAccountId   : DevAwsAccountId
                                  - params.ProdAwsAccountId  : ProdAwsAccountId
        """
        with self.configure_load('herd.predeploy.yaml') as config:
            config['deployments'][0]['authentication']['profile'] = data['master_profile']

            if len(data['predeploy_stack_name']) > 0:
                config['deployments'][0]['stack_name'] = data['predeploy_stack_name']

            if len(data['region']) > 0:
                config['defaults']['region'] = data['region']

        with self.configure_load('predeploy/params.yaml') as config:
            config['params']['DevAwsAccountId'] = data['DevAwsAccountId']
            config['params']['ProdAwsAccountId'] = data['ProdAwsAccountId']
            if len(data['StagingBucket']) > 0:
                config['params']['StagingBucketName'] = data['StagingBucket']



    def configure_children(self, data):
        """
        configure_children
        ------------------

        Configures child options.
        Herd Options:
            herd.deploy.yaml - deployments[name=Unicorn dev | Unicorn prod]
                                   .stack_name                               : [dev|prod]_stack_name
                                   .authentication.profile                   : [dev|prod]_profile
                                   .sync.bucket                              : StagingBucket
                                   .sync.staging_bucket_key_prefix                            : staging_bucket_key_prefix
        Stack Options:
            child/dev.params.yaml  - params.CentralAwsAccountId : CentralAwsAccountId
            child/prod.params.yaml - params.CentralAwsAccountId : CentralAwsAccountId
        """
        with self.configure_load('herd.deploy.yaml') as config:
            for i, t in enumerate(('dev', 'prod')):
                if len(data[f"{t}_stack_name"]) > 0:
                    config['deployments'][i]['stack_name']                = data[f'{t}_stack_name']
                config['deployments'][i]['authentication']['profile'] = data[f'{t}_profile']
                if len(data['StagingBucket']) > 0:
                    config['deployments'][i]['sync']['bucket']        = data['StagingBucket']
                if len(data['staging_bucket_key_prefix']) > 0:
                    config['deployments'][i]['sync']['staging_bucket_key_prefix']      = data['staging_bucket_key_prefix']

        for it in ('dev', 'prod'):
            with self.configure_load(f'child/{it}.params.yaml') as config:
                config['params']['CentralAwsAccountId'] = data['CentralAwsAccountId']

    def configure_stack(self, data):
        """
        configure_stack
        ---------------

        Configures stack topions.
        Herd Options:
            herd.deploy.yaml - deployments[name=Unicorn Tooling]
                                   .stack_name                   : master_stack_name
                                   .authentication.profile       : master_profile
                                   .sync.bucket                  : StagingBucket
                                   .sync.staging_bucket_key_prefix                : staging_bucket_key_prefix
        Stack Options:
            stack/params.yaml - params.DevAwsAccountId      : DevAwsAccountId
                                params.ProdAwsAccountId     : ProdAwsAccountId
                                params.appName              : appName
                                params.QSS3BucketName       : StagingBucket
                                params.QSS3KeyPrefix        : staging_bucket_key_prefix
                                params.StagingBucket        : StagingBucket
                                params.CCGroupName          : codecommit_group_name
        """
        with self.configure_load('herd.deploy.yaml') as config:
            config['deployments'][2]['authentication']['profile'] = data['master_profile']
            if len(data['master_stack_name']) > 0:
                config['deployments'][2]['stack_name']                = data['master_stack_name']
            if len(data['StagingBucket']) > 0:
                config['deployments'][2]['sync']['bucket']            = data['StagingBucket']
            if len(data['staging_bucket_key_prefix']) > 0:
                config['deployments'][2]['sync']['staging_bucket_key_prefix']          = data['staging_bucket_key_prefix']

        with self.configure_load('stack/params.yaml') as config:
            config['params']['DevAwsAccountId']  = data['DevAwsAccountId']
            config['params']['ProdAwsAccountId'] = data['ProdAwsAccountId']
            config['params']['appName']          = data['appName']
            if len(data['staging_bucket_key_prefix']) > 0:
                config['params']['QSS3KeyPrefix']    = data['staging_bucket_key_prefix']
                config['params']['FuzzerDeployKey']  = f"{data['staging_bucket_key_prefix']}/deployment.zip"
                config['params']['AssuranceDeployKey']  = f"{data['staging_bucket_key_prefix']}/assurance.zip"
            if len(data['StagingBucket']) > 0:
                config['params']['QSS3BucketName']   = data['StagingBucket']
                config['params']['StagingBucket']    = data['StagingBucket']
            config['params']['CCGroupName']      = data['codecommit_group_name']

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
