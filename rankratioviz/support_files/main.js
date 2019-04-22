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
        var rankPlotJSON = {};
        var samplePlotJSON = {};
        rrv = new display.RRVDisplay(rankPlotJSON, samplePlotJSON);
    }
);
