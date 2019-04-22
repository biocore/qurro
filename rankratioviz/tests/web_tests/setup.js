requirejs.config({
    paths: {
        display: "instrumented_js/display",
        feature_computation: "instrumented_js/feature_computation",
        vega: "../../support_files/vendor/vega.min",
        "vega-lite": "../../support_files/vendor/vega-lite.min",
        "vega-embed": "../../support_files/vendor/vega-embed.min",
        mocha: "vendor/mocha",
        chai: "vendor/chai",
        test_compute_balance: "tests/test_compute_balance",
        test_identify_metadata_columns: "tests/test_identify_metadata_columns",
        test_make_plots: "tests/test_make_plots"
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
        "feature_computation",
        "vega",
        "vega-lite",
        "vega-embed",
        "mocha",
        "chai",
        "test_compute_balance",
        "test_identify_metadata_columns",
        "test_make_plots"
    ],
    function(
        display,
        feature_computation,
        vega,
        vegaLite,
        vegaEmbed,
        mocha,
        chai,
        test_compute_balance,
        test_identify_metadata_columns,
        test_make_plots
    ) {
        // Enables checking for global variables created while running tests
        mocha.checkLeaks();
        // Actually run tests :D
        mocha.run();
    }
);
