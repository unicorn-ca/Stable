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

function export_pipeline() {
	var build_options = document.getElementById("build_options");

	build_options.style.display = "none";

	var buildspec = document.createElement("textarea");

}

// functions to switch between views

function unicorn_to_pipeline() {
	document.getElementById("unicorn-options-wrapper").style.display = "none";
	document.getElementById("pipeline-wrapper").style.display = "block";
	document.getElementById("next_button").style.display = "none";
	document.getElementById("export_button").style.display = "block";

	var back_button = document.getElementById("back_button")
	back_button.style.display = "block";
	back_button.onclick = pipeline_to_unicorn;
}

function pipeline_to_unicorn() {
	document.getElementById("unicorn-options-wrapper").style.display = "block";
	document.getElementById("pipeline-wrapper").style.display = "none";
	document.getElementById("next_button").style.display = "block";
	document.getElementById("export_button").style.display = "none";
	document.getElementById("back_button").style.display = "none";
}

function pipeline_to_summary() {
	document.getElementById("summary-wrapper").style.display = "block";
	document.getElementById("pipeline-wrapper").style.display = "none";
	document.getElementById("download_button").style.display = "block";
	document.getElementById("export_button").style.display = "none";

	var back_button = document.getElementById("back_button")
	back_button.style.display = "block";
	back_button.onclick = summary_to_pipeline;

	generateSummary();
}

function summary_to_pipeline() {
	document.getElementById("summary-wrapper").style.display = "none";
	document.getElementById("pipeline-wrapper").style.display = "block";
	document.getElementById("download_button").style.display = "none";
	document.getElementById("export_button").style.display = "block";

	var back_button = document.getElementById("back_button")
	back_button.style.display = "block";
	back_button.onclick = pipeline_to_unicorn;
}

function generateSummary() {
	document.getElementById("summary_dev_account_id").innerText            = document.getElementById("dev_account_id").value;
	document.getElementById("summary_prod_account_id").innerText           = document.getElementById("prod_account_id").value;
	document.getElementById("summary_region").innerText                    = document.getElementById("region").value;
	document.getElementById("summary_deployment_bucket_name").innerText    = document.getElementById("deployment_bucket_name").value;
	document.getElementById("summary_staging_bucket_key_prefix").innerText = document.getElementById("staging_bucket_key_prefix").value;
	document.getElementById("summary_fuzzer_deployment_key").innerText     = document.getElementById("fuzzer_deployment_key").value;
	document.getElementById("summary_app_name").innerText                  = document.getElementById("app_name").value;
	document.getElementById("summary_branch").innerText                    = document.getElementById("branch").value;
	document.getElementById("summary_codebuild_version").innerText         = document.getElementById("codebuild_version").value;
	document.getElementById("summary_runtime_versions").innerText          = document.getElementById("runtime_versions").value;
	document.getElementById("summary_pre_build_commands").innerText        = document.getElementById("pre_build_commands").value;
	document.getElementById("summary_build_commands").innerText            = document.getElementById("build_commands").value;
	document.getElementById("summary_post_build_commands").innerText       = document.getElementById("post_build_commands").value;
	document.getElementById("summary_artifacts").innerText                 = document.getElementById("artifacts").value;

	document.getElementById("summary_deployment_file_name").innerText      = document.getElementById("deployment_file_name").value;
	document.getElementById("summary_changeset_name").innerText            = document.getElementById("changeset_name").value;
	document.getElementById("summary_cfn_output").innerText                = document.getElementById("cfn_output").value;
	document.getElementById("summary_fuzzer_timeout").innerText            = document.getElementById("fuzzer_timeout").value;
}

// function to download the project

function download() {

}

generateDefaultPipeline();