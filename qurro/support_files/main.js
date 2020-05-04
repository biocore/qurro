requirejs.config({
    // https://github.com/vega/vega-embed/issues/8
    //
    // Also we name datatables "datatables.net" because the Bootstrap
    // DataTables code necessitates it -- see
    // https://stackoverflow.com/a/33748812/10730311
    //
    // Lastly, use of the Bootstrap Bundle based on this blessed comment:
    // https://stackoverflow.com/a/49839899/10730311 which saved time
    // debugging require.js and popper.js
    paths: {
        vega: "vendor/vega.min",
        "vega-lite": "vendor/vega-lite.min",
        "vega-embed": "vendor/vega-embed.min",
        jquery: "vendor/jquery-3.4.1.min",
        bootstrap: "vendor/bootstrap.bundle.min",
        "datatables.net": "vendor/jquery.dataTables.min",
        datatablesbs: "vendor/dataTables.bootstrap4.min",
    },
    shim: {
        "vega-lite": { deps: ["vega"] },
        "vega-embed": { deps: ["vega-lite"] },
        bootstrap: { deps: ["jquery"] },
        "datatables.net": { deps: ["jquery"] },
        datatablesbs: { deps: ["datatables.net", "bootstrap"] },
    },
});
requirejs(
    [
        "js/display",
        "js/feature_computation",
        "vega",
        "vega-lite",
        "vega-embed",
        "jquery",
        "bootstrap",
        "datatables.net",
        "datatablesbs",
    ],
    function (display, feature_computation, vega, vegaLite, vegaEmbed) {
        // DON'T CHANGE THESE LINES unless you know what you're doing -- the
        // "var *JSON = {};" lines are expected to contain that text by Qurro's
        // python code, which replaces the empty {}s with JSON objects that
        // contain all of the data needed for the Qurro visualization.
        var rankPlotJSON = {};
        var samplePlotJSON = {};
        var countJSON = {};
        new display.RRVDisplay(
            rankPlotJSON,
            samplePlotJSON,
            countJSON
        ).makePlots();
    }
);
