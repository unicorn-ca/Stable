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

function addText(element, text, parent) {
	var heading = document.createElement(element);
	var heading_text = document.createTextNode(text);
	heading.appendChild(heading_text);

	parent.appendChild(heading);
}