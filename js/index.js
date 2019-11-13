function createPipelineElement(name) {
	var pipeline = document.getElementById("pipeline");

	// pipeline element
	var pipelineElement = document.createElement("div");
	pipelineElement.className = "pipeline-element";
	
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
	pipeImage.setAttribute("src", "img/pipe.png");
	pipelineImage.appendChild(pipeImage);

	// Append to single object
	pipelineElement.appendChild(pipelineText);
	pipelineElement.appendChild(pipelineImage);

	pipelineElement.addEventListener("mouseover", function() {
		pipelineElementHeader.style.color = "white";
		pipeImage.src = "img/pipe2.png";
	});
	
	pipelineElement.addEventListener("mouseleave", function() {
		pipelineElementHeader.style.color = "black";
		pipeImage.src = "img/pipe.png";
	});

	pipeline.appendChild(pipelineElement);
}

function showDefaultPipeline() {
	createPipelineElement("DEPLOY");
	createPipelineElement("CHECK");
	createPipelineElement("DEPLOY");
	createPipelineElement("FUZZ");
}

showDefaultPipeline();