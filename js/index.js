const version_docs = `Required mapping. Represents the build spec version. We recommend that you use 0.2.`;

const phases_docs  = `Required sequence. Represents the commands CodeBuild runs during each phase of the build.`;
const install_docs = `Optional sequence. Represents the commands, if any, that CodeBuild runs during installation. We recommend that you use the install phase only for installing packages in the build environment. For example, you might use this phase to install a code testing framework such as Mocha or RSpec.`;

const runtime_versions_docs    = `Required if using the Ubuntu standard image 2.0 or later, or the Amazon Linux (AL2) standard image 1.0 or later. A runtime version is not supported with a custom image or the Ubuntu standard image 1.0. If specified, at least one runtime must be included in this section. Specify a runtime using a major version only, such as "java: openjdk11" or "ruby: 2.6." You can specify the runtime using a number or an environment variable. For example, if you use the Amazon Linux 2 standard image 1.0, then the following specifies that version 8 of Java, version 29 of Android, and a version contained in an environment variable of Ruby is installed. For more information, see Docker Images Provided by CodeBuild.`;

const pre_build_docs           = `Optional sequence. Represents the commands, if any, that CodeBuild runs before the build. For example, you might use this phase to sign in to Amazon ECR, or you might install npm dependencies.`;
const pre_build_commands_docs  = `Required sequence if pre_build is specified. Contains a sequence of scalars, where each scalar represents a single command that CodeBuild runs before the build. CodeBuild runs each command, one at a time, in the order listed, from beginning to end.`;

const build_docs               = `Optional sequence. Represents the commands, if any, that CodeBuild runs during the build. For example, you might use this phase to run Mocha, RSpec, or sbt.`;
const build_commands_docs      = `Required if build is specified. Contains a sequence of scalars, where each scalar represents a single command that CodeBuild runs during the build. CodeBuild runs each command, one at a time, in the order listed, from beginning to end.`;

const post_build_docs          = `Optional sequence. Represents the commands, if any, that CodeBuild runs after the build. For example, you might use Maven to package the build artifacts into a JAR or WAR file, or you might push a Docker image into Amazon ECR. Then you might send a build notification through Amazon SNS.`;
const post_build_commands_docs = `Required if post_build is specified. Contains a sequence of scalars, where each scalar represents a single command that CodeBuild runs after the build. CodeBuild runs each command, one at a time, in the order listed, from beginning to end.`;

const artifacts_docs           = `Optional sequence. Represents information about where CodeBuild can find the build output and how CodeBuild prepares it for uploading to the Amazon S3 output bucket. This sequence is not required if, for example, you are building and pushing a Docker image to Amazon ECR, or you are running unit tests on your source code, but not building it.`;
const artifacts_files_docs     = `Required sequence. Represents the locations that contain the build output artifacts in the build environment. Contains a sequence of scalars, with each scalar representing a separate location where CodeBuild can find build output artifacts, relative to the original build location or, if set, the base directory.`;

function createPipelineElement(name, img="img/pipe.png", selected="false") {
	var pipeline = document.getElementById("pipeline");

	// pipeline element
	var pipelineElement = document.createElement("div");
	pipelineElement.className = "pipeline-element";
	pipelineElement.setAttribute("data-selected", selected);
	
	// Left half of pipeline
	var pipelineText = document.createElement("div");
	pipelineText.className = "pipeline-text";
	
	// Text of pipeline
	var pipelineElementHeader = document.createElement("p");
	pipelineElementHeader.className = "vertical-text";
	var text = document.createTextNode(name);
	pipelineElementHeader.appendChild(text);
	pipelineText.appendChild(pipelineElementHeader);

	// Right half of pipeline
	var pipelineImage = document.createElement("div");
	pipelineImage.className = "pipeline-image";

	// Image of pipe
	var pipeImage = document.createElement("IMG");
	pipeImage.setAttribute("src", img);
	pipelineImage.appendChild(pipeImage);
	
	// If its the first pipeline element set its image to initially be selected
	if (pipelineElement.getAttribute("data-selected") == "true") {
		pipeImage.setAttribute("src", "img/pipe2.png");
	}

	// Append to single object
	pipelineElement.appendChild(pipelineText);
	pipelineElement.appendChild(pipelineImage);

	pipelineElement.addEventListener("mouseover", function() {
		pipeImage.src = "img/pipe2.png";
	});
	
	pipelineElement.addEventListener("mouseleave", function() {
		if (this.getAttribute("data-selected") == "false") {
			pipeImage.src = img;
		}
	});

	pipelineElement.addEventListener("click", function() {
		var pipelineElements = document.querySelectorAll('.pipeline-element');

		for (i = 0; i < pipelineElements.length - 1; i++) {
			pipelineElements[i].children[1].children[0].src = "img/pipe.png";
			pipelineElements[i].setAttribute("data-selected", "false");
		}
		
		pipeImage.src = "img/pipe2.png";
		pipelineElement.setAttribute("data-selected", "true");

		var pipeline_options = document.getElementById("pipeline-options");

		for (var i = 0; i < pipeline_options.children.length; i++) {
			if (name.toLowerCase() + "_options" == pipeline_options.children[i].id) {
				pipeline_options.children[i].style.display = "block";
			} else {
				pipeline_options.children[i].style.display = "none";
			}
		}
	});

	pipeline.appendChild(pipelineElement);
}

function generateDefaultPipeline() {
	createPipelineElement("COMMIT", img="img/pipe.png", selected="true");
	createPipelineElement("BUILD");
	createPipelineElement("DEPLOY");
	createPipelineElement("FUZZ");
	createPipelineElement("ADD", "img/addPipe.png");
}

function createThreeRowTable(elements) {
	var table = document.createElement("table");

	for (var i = 0; i < elements.length; i++) {
		var row = document.createElement("tr");

		var heading = document.createElement("td");
		var heading_text = document.createTextNode(elements[i].heading + ": ");
		heading.appendChild(heading_text);

		var element = document.createElement("td");
		element.appendChild(elements[i].element);

		var docs = document.createElement("td");
		var docs_text = document.createTextNode(elements[i].docs);
		docs.appendChild(docs_text);

		row.appendChild(heading);
		row.appendChild(element);
		row.appendChild(docs);

		table.appendChild(row);
	}

	return table;
}

function addText(element, text, parent) {
	var heading = document.createElement(element);
	var heading_text = document.createTextNode(text);
	heading.appendChild(heading_text);

	parent.appendChild(heading);
}

function generatePipelineOptions() {
	// dev account id
	// prod account id

	/// pipeline deployment options

	// region
	// deployment bucket name
	// staging bucket key prefix (optional)
	// fuzzer deployment key (optional)
}

function generateCommitOptions() {
	//AppName
	// Branch
	//

	var commit_options = document.createElement("div");
	commit_options.id = "commit_options";
	commit_options.className = "pipeline-options-container";

	addText("h1", "Commit Options", commit_options);

	return commit_options;
}

function generateBuildOptions() {
	var build_options = document.createElement("div");
	build_options.id = "build_options";
	build_options.className = "pipeline-options-container";

	addText("h1", "Build Options", build_options);

	// docker image name

	// version

	var version = document.createElement("input");
	version.id = "codebuild_version";
	version.type = "text";
	version.value = "0.2";

	var version_table = createThreeRowTable([
		{heading: "version", element: version, docs: version_docs}
	]);

	build_options.appendChild(version_table);

	// phases

	addText("h1", "Phases", build_options);
	addText("p", phases_docs, build_options);

	// install

	addText("h2", "Install", build_options);
	addText("p", install_docs, build_options);

	var runtime_versions = document.createElement("textarea");
	runtime_versions.id = "runtime_versions";
	runtime_versions.placeholder = "runtime: version";

	var version_table = createThreeRowTable([
		{heading: "runtime-versions", element: runtime_versions, docs: runtime_versions_docs}
	]);

	build_options.appendChild(version_table);

	// pre_build

	addText("h2", "Pre Build", build_options);
	addText("p", pre_build_docs, build_options);

	var commands = document.createElement("textarea");
	commands.id = "pre_build_commands";
	commands.placeholder = "- command\n\n- |\n  multiline\n  command";

	var version_table = createThreeRowTable([
		{heading: "commands", element: commands, docs: pre_build_commands_docs}
	]);

	build_options.appendChild(version_table);

	// build

	addText("h2", "Build", build_options);
	addText("p", build_docs, build_options);

	var commands = document.createElement("textarea");
	commands.id = "build_commands";
	commands.placeholder = "- command\n\n- |\n  multiline\n  command";

	var version_table = createThreeRowTable([
		{heading: "commands", element: commands, docs: build_commands_docs}
	]);

	build_options.appendChild(version_table);

	// post_build

	addText("h2", "Post Build", build_options);
	addText("p", post_build_docs, build_options);

	var commands = document.createElement("textarea");
	commands.id = "post_build_commands";
	commands.placeholder = "- command\n\n- |\n  multiline\n  command";

	var version_table = createThreeRowTable([
		{heading: "commands", element: commands, docs: post_build_commands_docs}
	]);

	build_options.appendChild(version_table);

	// post_build

	addText("h1", "Artifacts", build_options);
	addText("p", artifacts_docs, build_options);

	var artifacts = document.createElement("textarea");
	artifacts.id = "artifacts";

	var version_table = createThreeRowTable([
		{heading: "artifacts", element: artifacts, docs: artifacts_files_docs}
	]);

	build_options.appendChild(version_table);

	return build_options;
}

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
		buildspec += "      - " + build_commands[i] + "\n";
	}

	// post_build_commands

	buildspec += "  build:\n";
	buildspec += "    commands:\n";

	buildspec += "      - cp empty-configuration.json sample-configuration-dev.json";
	buildspec += "      - cp empty-configuration.json sample-configuration-prod.json";
	buildspec += "      - mv .serverless/cloudformation-template-update-stack.json sample-transformed.yaml";

	for (var i = 0; i < post_build_commands.length; i++) {
		buildspec += "      - " + post_build_commands[i] + "\n";
	}

	// artifacts

	buildspec += "artifacts:\n";
	buildspec += "  files:\n";

	for (var i = 0; i < artifacts.length; i++) {
		buildspec += "    - " + artifacts[i] + "\n";
	}

	return buildspec;
}

function export_pipeline() {
	var build_options = document.getElementById("build_options");

	build_options.style.display = "none";

	var buildspec = document.createElement("textarea");

}

function generatePipelineBuilder() {
	var pipeline_options = document.getElementById("pipeline-options");

	generateDefaultPipeline();

	var commit_options = generateCommitOptions();
	pipeline_options.appendChild(commit_options);

	var build_options = generateBuildOptions();
	build_options.style.display = "none";
	pipeline_options.appendChild(build_options);
}

generatePipelineBuilder();