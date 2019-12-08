(($) => {
	"use strict";
	const $wizard = $("#wizard");
	$wizard.steps({
        headerTag: "h2",
        bodyTag: "section",
        transitionEffect: "fade",
        stepsOrientation: "horizontal",
        enableAllSteps: true,
        transitionEffectSpeed: 500,
        labels: {
            // finish: "Export",
            finish: '<i class="icon-download"></i>',
            next: "Next",
            previous: "Back"
        },
        onStepChanging: (e, i) => {
            let invalid_inputs = get_invalid_inputs(i);
            if(invalid_inputs.length == 0) {
                $('.form-row', $(`section.page`, $wizard)[i])
                    .each((i, e) => e.classList.remove('danger'));
                return true;
            }

            invalid_inputs.each((i, e) => $(e).closest('.form-row').addClass('danger'));

            return false;
        },
        onStepChanged: function(event, currentIndex){
            if(currentIndex == 3){
                generateSummary();
            }
        },
        onFinished: function(event, currentIndex){
            export_project();  
        }
    });

    $('.steps li a', $wizard).click(function(){
    	$(this).parent().addClass('checked');
		$(this).parent().prevAll().addClass('checked');
		$(this).parent().nextAll().removeClass('checked');
    });

    // Custom Jquery Step Button
    $('.forward').click(function(){
    	$wizard.steps('next');
    })
    $('.backward').click(function(){
        $wizard.steps('previous');
    })

    // Tooltipsters
    $(document.body).on('mouseenter', '.tooltip:not(.tooltipstered)', () => {
        $(this)
            .tooltipster({ 
                theme: 'tooltipster-light',
                maxWidth: 500,
                position: 'bottom',
                functionPosition: function(instance, helper, position){
                    position.target -= 80;
                    return position;
                }
            }).tooltipster('open');
    });

    function get_invalid_inputs(step) {
        return $(':input', $(`section.page`, $wizard)[step])
                    .filter((i,e) =>
                            e.hasAttribute('data-required') ? e.value.length == 0 : !1);
    }

function export_project() {
	window.app_name    = document.getElementById("app_name").value;
	window.api_runtime = document.getElementById("api_runtime").value;
	window.region      = document.getElementById("region").value;

	var serverless_yml = gen_serverless_yaml();
	var buildspec = getBuildSpecString();

	var zip = new JSZip();

	zip.file("serverless.yml", serverless_yml);
	zip.file("buildspec.build.yaml", buildspec);

	zip.generateAsync({type:"blob"})
	.then(function(content) {
	    saveAs(content, app_name + ".zip");
	});

	var pipeline_json = build_pipeline_json();
	
	send_data_to_server(pipeline_json);
}

function generateSummary() {
	document.getElementById("summary_central_account_id").innerText        = document.getElementById("central_account_id").value;
	document.getElementById("summary_dev_account_id").innerText            = document.getElementById("dev_account_id").value;
	document.getElementById("summary_prod_account_id").innerText           = document.getElementById("prod_account_id").value;
	document.getElementById("summary_region").innerText                    = document.getElementById("region").value;
	document.getElementById("summary_deployment_bucket_name").innerText    = document.getElementById("deployment_bucket_name").value;
	document.getElementById("summary_staging_bucket_key_prefix").innerText = document.getElementById("staging_bucket_key_prefix").value;
    //document.getElementById("summary_fuzzer_deployment_key").innerText     = document.getElementById("fuzzer_deployment_key").value;

    document.getElementById("summary_api_runtime").innerText               = document.getElementById("api_runtime").value;
	document.getElementById("summary_app_name").innerText                  = document.getElementById("app_name").value;
    document.getElementById("summary_branch").innerText                    = document.getElementById("branch").value;
    document.getElementById("summary_codecommit_group_name").innerText     = document.getElementById("codecommit_group_name").value;
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

function autofill() {
    document.getElementById("central_account_id").value = "833035787772";
    document.getElementById("dev_account_id").value = "171350118496";
    document.getElementById("prod_account_id").value = "220361783940";
    document.getElementById("region").value = "ap-southeast-2";
    document.getElementById("deployment_bucket_name").value = "unicorn-staging-bucket-9301secedu";
    document.getElementById("staging_bucket_key_prefix").value = "unicorn-staging-bucket-9301secedu";
    //document.getElementById("fuzzer_deployment_key").value = "herd/test1/deployment.zip";

    document.getElementById("api_runtime").value = "python3.7";
    document.getElementById("app_name").value = "Unicorn-API";
    document.getElementById("branch").value = "";
    document.getElementById("codebuild_version").value = "0.2";
    document.getElementById("runtime_versions").value = "";
    document.getElementById("pre_build_commands").value = "- echo 'pre build'";
    document.getElementById("build_commands").value = "- echo 'build'";
    document.getElementById("post_build_commands").value = "- echo 'post build'";
    document.getElementById("artifacts").value = "";

    document.getElementById("deployment_file_name").value = "";
    document.getElementById("changeset_name").value = "";
    document.getElementById("cfn_output").value = "";
    document.getElementById("fuzzer_timeout").value = "";
}
})(jQuery)
