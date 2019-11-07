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

showDefaultPipeline();