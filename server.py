import os, webbrowser
import sys
import time
from multiprocessing import Process
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import mimetypes
import yaml
from herd import deployment_interfaces as hdi

PIPELINE_ROOT = './'

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def http_head(self, code=200, headers={}):
        self.send_response(code)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        if self.path.split('?')[0] == '/':
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

            self.http_head(200, {'Content-Type': 'text/plain'})
            self.send_message('1/3', 'Setting up configuration files')
            self.configure_predeploy(post_data)
            self.configure_children(post_data)
            self.configure_stack(post_data)

            self.send_message('2/3', 'Deploying installation stack')
            if not self.run_file_deployment('herd.predeploy.yaml', root_dir=PIPELINE_ROOT, root_eid='2/3'): return
            self.send_message('3/3', 'Running installation')
            if not self.run_file_deployment('herd.deploy.yaml', root_dir=PIPELINE_ROOT, root_eid='3/3'): return

            #exit()
        else:
            self.http_head(404)
            self.wfile.write(b'404 Not found')

    def herd_streamer(self, message, log_type, eid):
        if log_type == 'INFO': return
        self.send_message(eid, message, log_type == 'ERROR')

    def run_file_deployment(self, file, root_dir='./', root_eid=''):
        init_dir = os.getcwd()
        os.chdir(root_dir)

        cfg = yaml.load(open(file), Loader=yaml.SafeLoader)
        t_d = len(cfg['deployments'])
        for d_id, deployment in enumerate(cfg['deployments']):
            deployer = hdi.Deployer()
            deployer.set_logger(self.wfile, lambda m, p: self.herd_streamer(m, p, f'{root_eid}.{d_id+1}/{t_d}'))
            deployer.load_defaults(cfg['defaults'])
            if deployer.deploy(deployment) is None:
                os.chdir(init_dir)
                return False

        os.chdir(init_dir)
        return True

    def send_message(self, eid, message, error=None):
        self.wfile.write(
            json.dumps({'message': message, 'error': error, 'event_id': eid}).encode() +
            b'\n'
        )
        self.wfile.flush()

    def configure_load(self, path):
        class ConfigContextManager:
            def __init__(self, path):
                self._path = path

            def __enter__(self):
                self._data = yaml.load(open(f"{PIPELINE_ROOT}/{path}"), Loader=yaml.SafeLoader)
                return self._data

            def __exit__(self, exception_type, exception_value, traceback):
                if exception_type is not None:
                    # TODO: handle exceptions gracefully
                    print('Failed')
                else:
                    yaml.dump(self._data, open(f"{PIPELINE_ROOT}/{path}", 'w'))

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
                                   .sync.base_key                            : staging_bucket_key_prefix
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
                    config['deployments'][i]['sync']['base_key']      = data['staging_bucket_key_prefix']

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
                                   .sync.base_key                : staging_bucket_key_prefix
        Stack Options:
            stack/params.yaml - params.DevAwsAccountId      : DevAwsAccountId
                                params.ProdAwsAccountId     : ProdAwsAccountId
                                params.AppName              : appName
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
                config['deployments'][2]['sync']['base_key']          = data['staging_bucket_key_prefix']

        with self.configure_load('stack/params.yaml') as config:
            config['params']['DevAwsAccountId']  = data['DevAwsAccountId']
            config['params']['ProdAwsAccountId'] = data['ProdAwsAccountId']
            config['params']['AppName']          = data['appName']
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
    import sys
    try:
        PIPELINE_ROOT = sys.argv[1]
    except IndexError: pass
    p1 = Process(target=start_server)
    p1.start()

    #os.system("cmd.exe /C 'start http://127.0.0.1:8000'")
    url = "http://127.0.0.1:8000"
    webbrowser.open_new(url)
