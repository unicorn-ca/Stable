function createPipelineElement(name) {
	var pipeline = document.getElementById("pipeline");

	// pipeline element
	var pipelineElement = document.createElement("div");
	pipelineElement.className = "pipeline-element";
	
	var pipeImage = document.createElement("IMG");
	pipeImage.setAttribute("src", "img/pipe.png")

	var pipelineElementHeader = document.createElement("p");
	pipelineElementHeader.className = "vertical-text";

	var text = document.createTextNode(name);
	pipelineElementHeader.appendChild(text);

	pipelineElement.appendChild(pipeImage);
	pipelineElement.appendChild(pipelineElementHeader);

	pipeline.appendChild(pipelineElement);
}

function showDefaultPipeline() {
	createPipelineElement("DEPLOY");
	// createPipelineElement("CHECK");
	// createPipelineElement("DEPLOY");
	// createPipelineElement("FUZZ");
}

showDefaultPipeline();