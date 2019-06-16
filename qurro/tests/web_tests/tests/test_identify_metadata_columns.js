define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the sample plot from the python "matching" integration test
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-17ad6d7eb8d11fdb67d65d9f4abd5654"}, "datasets": {"data-17ad6d7eb8d11fdb67d65d9f4abd5654": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "type": "nominal"}, "y": {"field": "qurro_balance", "title": "log(Numerator / Denominator)", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector016": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Log Ratio of Abundances in Samples"};
    // badSpec is like samplePlotJSON, but none of the sample points have any
    // metadata fields defined
    // We make a deep copy of badSpec using JSON operations to avoid modifying
    // samplePlotJSON. See https://stackoverflow.com/q/122102/10730311 for details
    // of this approach -- this isn't really elegant, but it's just being used
    // in the test code so shouldn't be a ton to worry about
    var badSpec = JSON.parse(JSON.stringify(samplePlotJSON));
    badSpec.datasets[badSpec.data.name] = [{}, {}, {}, {}, {}, {}];
    describe("Identifying sample plot metadata columns", function() {
        it("Properly identifies all metadata columns", function() {
            // Note that we ignore qurro_balance explictly.
            chai.assert.sameMembers(
                ["Sample ID", "Metadata1", "Metadata2", "Metadata3"],
                display.RRVDisplay.identifyMetadataColumns(samplePlotJSON)
            );
        });
        it("Throws an error when no metadata columns present", function() {
            chai.assert.throws(function() {
                display.RRVDisplay.identifyMetadataColumns(badSpec);
            });
        });
    });
});
