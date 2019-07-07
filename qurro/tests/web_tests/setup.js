requirejs.config({
    paths: {
        display: "instrumented_js/display",
        dom_utils: "instrumented_js/dom_utils",
        feature_computation: "instrumented_js/feature_computation",
        vega: "../../support_files/vendor/vega.min",
        "vega-lite": "../../support_files/vendor/vega-lite.min",
        "vega-embed": "../../support_files/vendor/vega-embed.min",
        mocha: "vendor/mocha",
        chai: "vendor/chai",
        testing_utilities: "testing_utilities",
        test_compute_balance: "tests/test_compute_balance",
        test_dom_utils: "tests/test_dom_utils",
        test_filter_features: "tests/test_filter_features",
        test_identify_metadata_columns: "tests/test_identify_metadata_columns",
        test_identify_sample_ids: "tests/test_identify_sample_ids",
        test_data_export: "tests/test_data_export",
        test_rrvdisplay: "tests/test_rrvdisplay",
        test_rrvdisplay_compute_balance:
            "tests/test_rrvdisplay_compute_balance",
        test_rrvdisplay_update_feature_text_dom:
            "tests/test_rrvdisplay_update_feature_text_dom",
        test_rrvdisplay_update_feature_color:
            "tests/test_rrvdisplay_update_feature_color",
        test_rrvdisplay_getinvalidsampleids:
            "tests/test_rrvdisplay_getinvalidsampleids",
        test_rrvdisplay_getinvalidsampleids_samplestatstest:
            "tests/test_rrvdisplay_getinvalidsampleids_samplestatstest",
        test_rrvdisplay_destroy: "tests/test_rrvdisplay_destroy"
    },
    shim: {
        // Mocha shim based on
        // https://gist.github.com/michaelcox/3800736#gistcomment-1417093.
        // Without using this shim, the mocha module was undefined.
        mocha: {
            init: function() {
                mocha.setup("bdd");
                return mocha;
            }
        },
        // See https://github.com/vega/vega-embed/issues/8. These are needed to
        // get the Vega* libraries to load properly.
        "vega-lite": { deps: ["vega"] },
        "vega-embed": { deps: ["vega-lite"] }
    }
});
requirejs(
    [
        "display",
        "dom_utils",
        "feature_computation",
        "vega",
        "vega-lite",
        "vega-embed",
        "mocha",
        "chai",
        "testing_utilities",
        "test_compute_balance",
        "test_dom_utils",
        "test_filter_features",
        "test_identify_metadata_columns",
        "test_identify_sample_ids",
        "test_data_export",
        "test_rrvdisplay",
        "test_rrvdisplay_compute_balance",
        "test_rrvdisplay_update_feature_text_dom",
        "test_rrvdisplay_update_feature_color",
        "test_rrvdisplay_getinvalidsampleids",
        "test_rrvdisplay_getinvalidsampleids_samplestatstest",
        "test_rrvdisplay_destroy"
    ],
    function(
        display,
        dom_utils,
        feature_computation,
        vega,
        vegaLite,
        vegaEmbed,
        mocha,
        chai,
        testing_utilities,
        test_compute_balance,
        test_dom_utils,
        test_filter_features,
        test_identify_metadata_columns,
        test_identify_sample_ids,
        test_data_export,
        test_rrvdisplay,
        test_rrvdisplay_compute_balance,
        test_rrvdisplay_update_feature_text_dom,
        test_rrvdisplay_update_feature_color,
        test_rrvdisplay_getinvalidsampleids,
        test_rrvdisplay_getinvalidsampleids_samplestatstest,
        test_rrvdisplay_destroy
    ) {
        // Enables checking for global variables created while running tests
        mocha.checkLeaks();
        // Actually run tests :D
        mocha.run();
    }
);
