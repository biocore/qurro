requirejs.config({
    // https://github.com/vega/vega-embed/issues/8
    paths: {
        vega: "vendor/vega.min",
        "vega-lite": "vendor/vega-lite.min",
        "vega-embed": "vendor/vega-embed.min"
    },
    shim: {
        "vega-lite": { deps: ["vega"] },
        "vega-embed": { deps: ["vega-lite"] }
    }
});
requirejs(
    ["js/display", "js/feature_computation", "vega", "vega-lite", "vega-embed"],
    function(display, feature_computation, vega, vegaLite, vegaEmbed) {
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
