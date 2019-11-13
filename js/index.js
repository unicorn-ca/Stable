function createPipelineElement(name) {
	var pipeline = document.getElementById("pipeline");

	// pipeline element
	var pipelineElement = document.createElement("div");
	pipelineElement.className = "pipeline-element";

	var pipelineElementHeader = document.createElement("p");

	var text = document.createTextNode(name);
	pipelineElementHeader.appendChild(text);

	pipelineElement.appendChild(pipelineElementHeader);

	pipeline.appendChild(pipelineElement);
}

function showDefaultPipeline() {
	createPipelineElement("BUILD");
	createPipelineElement("DEPLOY");
	createPipelineElement("FUZZ");
}

function createTwoRowTable(elements) {
	var table = document.createElement("table");

	for (var i = 0; i < elements.length; i++) {
		var row = document.createElement("tr");

		var heading = document.createElement("td");
		var heading_text = document.createTextNode(elements[i].heading + ": ");
		heading.appendChild(heading_text);

		var element = document.createElement("td");
		element.appendChild(elements[i].element);

		row.appendChild(heading);
		row.appendChild(element);

		table.appendChild(row);
	}

	return table;
}

function showBuildOptions() {
	var pipeline_options = document.getElementById("pipeline-options");

	// version

	var version = document.createElement("input");
	version.type = "text";

	var version_table = createTwoRowTable([
		{heading: "Version", element: version}
	]);

	pipeline_options.appendChild(version_table);

	// pre_build

	var commands = document.createElement("textarea");


	var version_table = createTwoRowTable([
		{heading: "Commands", element: commands}
	]);

	pipeline_options.appendChild(version_table);

	// build


	// post_build
}

showDefaultPipeline();
showBuildOptions();