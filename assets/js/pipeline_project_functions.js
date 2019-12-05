function build_pipeline_json() {
	return {
		CentralAwsAccountId:       document.getElementById("central_account_id").value,
		DevAwsAccountId:           document.getElementById("dev_account_id").value,
	    ProdAwsAccountId:          document.getElementById("prod_account_id").value,
		region:                    document.getElementById("region").value,
		QSS3BucketName:            document.getElementById("deployment_bucket_name").value,
		staging_bucket_key_prefix: document.getElementById("staging_bucket_key_prefix").value,
		StagingBucket:             document.getElementById('deployment_bucket_name').value,
		//fuzzer_deployment_key:     document.getElementById("fuzzer_deployment_key").value,
		appName:                   document.getElementById("app_name").value,
		branch:                    document.getElementById("branch").value,
	    codebuild_version:         document.getElementById("codebuild_version").value,
	    runtime_versions:          document.getElementById("runtime_versions").value,
		pre_build_commands:        document.getElementById("pre_build_commands").value,
		deployment_file_name:      document.getElementById("deployment_file_name").value,
		changeset_name:            document.getElementById("changeset_name").value,
		cfn_output:                document.getElementById("cfn_output").value,
		fuzzer_timeout:            document.getElementById("fuzzer_timeout").value,
		codecommit_group_name:     document.getElementById("codecommit_group_name").value,

		master_profile: document.getElementById('master_profile').value,
		dev_profile: document.getElementById('dev_profile').value,
	    prod_profile: document.getElementById('prod_profile').value,

        predeploy_stack_name: document.getElementById('predeploy_stack_name').value,
	    master_stack_name: document.getElementById('master_stack_name').value,
	    dev_stack_name: document.getElementById('dev_stack_name').value,
	    prod_stack_name: document.getElementById('prod_stack_name').value 
	};
}

function send_data_to_server(data) {
	fetch("/deploy", {
	  method: 'post',
	  headers: {
	    'Accept': 'application/json, text/plain, */*',
	    'Content-Type': 'application/json'
	  },
	  body: JSON.stringify(data)
	});
}
