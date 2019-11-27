var app_name = "";
var api_runtime = "";
var region = "";

function getBuildSpecString() {
	var codebuild_version   = document.getElementById("codebuild_version").value;
	var runtime_versions    = document.getElementById("runtime_versions").value.split("\n");
	var pre_build_commands  = document.getElementById("pre_build_commands").value.split("\n");
	var build_commands      = document.getElementById("build_commands").value.split("\n");
	var post_build_commands = document.getElementById("post_build_commands").value.split("\n");
	var artifacts           = document.getElementById("artifacts").value.split("\n");

	var buildspec = "";

	buildspec += "version: " + codebuild_version + "\n";
	buildspec += "phases:\n";
	buildspec += "  install:\n";
	buildspec += "    runtime-versions:\n";

	for (var i = 0; i < runtime_versions.length; i++) {
		buildspec += "      " + runtime_versions[i] + "\n";
	}

	// pre_build_commands

	buildspec += "  pre_build:\n";
	buildspec += "    commands:\n";

	buildspec += "      - curl -L https://github.com/mikefarah/yq/releases/download/2.4.0/yq_linux_amd64 -o /bin/yq\n";
  buildspec += "      - chmod +x /bin/yq\n";
  buildspec += "      - npm install -g serverless\n";

	for (var i = 0; i < pre_build_commands.length; i++) {
		buildspec += "      " + pre_build_commands[i] + "\n";
	}

	// build_commands

	buildspec += "  build:\n";
	buildspec += "    commands:\n";

	buildspec += "      - |\n";
	buildspec += "        if [ `yq r serverless.yml provider.deploymentBucket.name` = 'null' ]; then\n";
	buildspec += "          echo 'No deployment bucket found - using $SAM_BUCKET';\n";
	buildspec += "          yq w --inplace serverless.yml provider.deploymentBucket.name $SAM_BUCKET;\n";
	buildspec += "        else";
	buildspec += "          echo 'Currently custom deployment buckets cannot be used';\n";
	buildspec += "          exit 1;\n";
	buildspec += "        fi\n";

	buildspec += "      - sls package\n";
	buildspec += "      - |\n";
	buildspec += "        UNI_LOCAL_ARTF=`jq -r .service.artifact .serverless/serverless-state.json`\n";
	buildspec += "        UNI_S3_ARTF_DR=`jq -r .package.artifactDirectoryName .serverless/serverless-state.json`\n";
	buildspec += "        UNI_S3_ARTF_NM=`jq -r .package.artifact .serverless/serverless-state.json`\n";
	buildspec += "        aws s3 cp $UNI_LOCAL_ARTF s3://$SAM_BUCKET/$UNI_S3_ARTF_DR/$UNI_S3_ARTF_NM\n";

	buildspec += "      - >-\n";
	buildspec += "        echo '{\"Parameters\": {}}' > empty-configuration.json\n";

	for (var i = 0; i < build_commands.length; i++) {
		buildspec += "      " + build_commands[i] + "\n";
	}

	// post_build_commands

	buildspec += "  post_build:\n";
	buildspec += "    commands:\n";

	buildspec += "      - cp empty-configuration.json sample-configuration-dev.json\n";
	buildspec += "      - cp empty-configuration.json sample-configuration-prod.json\n";
	buildspec += "      - mv .serverless/cloudformation-template-update-stack.json sample-transformed.yaml\n";

	for (var i = 0; i < post_build_commands.length; i++) {
		buildspec += "      " + post_build_commands[i] + "\n";
	}

	// artifacts

	buildspec += "artifacts:\n";
	buildspec += "  files:\n";

	for (var i = 0; i < artifacts.length; i++) {
		buildspec += "    - " + artifacts[i] + "\n";
	}

	return buildspec;
}

