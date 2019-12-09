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
        finish: 'Done',
        next: "Next",
        previous: "Back"
    },
    onStepChanging: (e, i) => {
        // TODO: allow moving backward regardless of validation
        let invalid_inputs = get_invalid_inputs(i);
        if(invalid_inputs.length == 0) {
            $('.form-row', $(`section.page`, $wizard)[i])
                .each((i, e) => e.classList.remove('danger'));
            return true;
        }

        invalid_inputs.each((i, e) => $(e).closest('.form-row').addClass('danger'));

        return false;
    },
    onStepChanged: function(event, currentIndex) {
        if(currentIndex == 3){
            generateSummary();
        }
    },
    onFinished: function(event, currentIndex) {
        close_wizard();
    }
});
// We never want the form to submit
$wizard.on('submit', e=>e.preventDefault());

$('.steps li a', $wizard).click(function(){
    $(this).parent().addClass('checked');
    $(this).parent().prevAll().addClass('checked');
    $(this).parent().nextAll().removeClass('checked');
});

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

$('#export').on('click', _ => export_project());

$('#deploy').on('click', async _ => deploy_pipeline());

function get_invalid_inputs(step) {
    return $(':input:not(button)', $(`section.page`, $wizard)[step])
                .filter((i,e) =>
                        e.hasAttribute('data-required') ? e.value.length == 0 : !1);
}

function close_wizard() {
    console.log('Would close');
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
}

async function deploy_pipeline() {
    const stream_decode = (data) => Array.from(data.value, r => String.fromCharCode(r)).join('');
    // Object.fromEntries isn't supported in Edge - TODO: polyfill
    const resp = await fetch("/deploy", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(new FormData($wizard[0])))
    });

    const body_stream = resp.body.getReader();
    let stream_data = await body_stream.read();
    while(!stream_data.done) {
        console.log(stream_decode(stream_data));
        stream_data = await body_stream.read();
    }

    console.log('Done')
}

function generateSummary() {
    let input_frames = $('section > .form-content').slice(1).clone();
    let summary = $('#summary-content');
    summary.empty();
    input_frames.children().each((i, e) => {
        // We complicate the logic slightly to prevent id/name collisions
        if(e.classList.contains('form-row')) {
            e = $(e);

            e.removeClass('required-row');
            $('.tooltip', e)
                .removeClass('tooltip')
                .removeAttr('title');
            let val = $(':input:not(button)', e).val();
            $(':input:not(button)', e).replaceWith(`<p class="form-text">${val}</p>`);
            summary.append(e);
        } else {
            summary.append(e);
        }
    });
}
})(jQuery);

function autofill() {
    jQuery(':input:not(button)').each((i, e) => e.value = e.id);
}
