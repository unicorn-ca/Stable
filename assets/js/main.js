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
    onStepChanging: (e, i, n) => {
        // Allow moving backward regardless of validation
        if (i > n) {
            changeStep(n);
            return true;
        }

        // Form validation
        let invalid_inputs = get_invalid_inputs(i);
        if(invalid_inputs.length == 0) { // All fields on this step are fine
            $('.form-row', $(`section.page`, $wizard)[i])
                .each((i, e) => e.classList.remove('danger'));

            changeStep(n);
            return true;
        }

        // Some fields in this step are not valid - highlight them
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

// Old way of changing step
// $('.steps li a', $wizard).click(function(){
    //     $(this).parent().addClass('checked');
    //     $(this).parent().prevAll().addClass('checked');
    //     $(this).parent().nextAll().removeClass('checked');
    // });
    
// Contrived way to change the step
// New way to change step
function changeStep(currentIndex){
    var steps = $('.steps li', $wizard);
    for(var i = 0; i < steps.length; i++){
        var c = steps[i];
        if(i <= currentIndex){
            c.classList.add('checked');
        } else {
            c.classList.remove('checked');
        }
    }
}


// Tooltipsters
$(document.body).on('mouseenter', '.tooltip:not(.tooltipstered)', function() {
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
    $('[data-modal="deploy"]').fadeIn(500);

    const stream_decode = (data) => Array.from(
        data.value, r => String.fromCharCode(r)
    ).join('').trim().split('\n').map(o => JSON.parse(o));
    const get_progress = (eid) => {
        let modifier = 100;
        let progress = 0;
        let major = 1;
        eid.split('.').forEach(part => {
            const div = part.split('/');
            // Magic: we want the major event_id to resolve correctly
            // i.e. 2/4 --> 50%
            // however minor ids should not be able to push to the next major jump
            //
            // e.g. if 1/4 --> 25%, 1/4.1/1 should not = 50%
            //         2/4 should be the first instance of 50%
            // We do this by subtracting 1 off minor versions
            // so 1/4.1/1 --> 1/4.0/1 --> 25%
            //    1/4.2/2 --> 1/4.1/2 --> 37.5%
            //
            // Which is expected
            progress += (modifier *= (div[0]-(2+~major))/div[1]);
            major = 0;
        });

        return progress;
    };

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
    let errored = false;
    while(!stream_data.done && !errored) {
        const message = stream_decode(stream_data);
        for(const m of message) {
            const total_progress = get_progress(m['event_id']);
            const major_eid = m['event_id'].split('.')[0];
            const client_view = `${major_eid}: ${m['message']}`;
            $('.progress-bar-progress').css('width', `${total_progress}%`);
            $('.progress-info').text(client_view);
            $('.event-log').append(`${client_view}<br>`);
            if(m['error']) {
                $('.progress-bar-progress').css('background', 'red');
                errored = true;
                break;
            }
        };
        stream_data = await body_stream.read();
    }

    if(!errored) {
        console.log('Success!');
    }
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


$(".modal-overlay").click(function(){
    $("body").find(".modal").fadeOut(500);
    $("body").find(".modal-overlay").fadeOut(500);
});