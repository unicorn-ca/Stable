var gen_serverless_yaml = () => 

`service: ${app_name}

provider:
  name: aws
  runtime: ${api_runtime}
  stage: dev
  region: ${region}

package:
  exclude:
    - README.md
    - .gitignore

functions:
#  sample_functions:
#    handler: sample_functions.handler
#    events:
#      - http:
#          path: /
#          method: get`;