define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the sample plot from the python "matching" integration test
    // prettier-ignore
    var samplePlotJSON = {"config": {"view": {"width": 400, "height": 300}, "mark": {"tooltip": null}, "axis": {"labelBound": true}}, "data": {"name": "data-310d21641df02465dd0f9c9a466de9d4"}, "mark": {"type": "circle"}, "autosize": {"resize": true}, "background": "#FFFFFF", "encoding": {"color": {"type": "nominal", "field": "Metadata1"}, "tooltip": [{"type": "nominal", "field": "Sample ID"}, {"type": "quantitative", "field": "qurro_balance"}], "x": {"type": "quantitative", "field": "qurro_balance"}, "y": {"type": "quantitative", "field": "qurro_balance", "title": "log(Numerator / Denominator)"}}, "selection": {"selector016": {"type": "interval", "bind": "scales", "encodings": ["x", "y"]}}, "title": "Log Ratio of Abundances in Samples", "$schema": "https://vega.github.io/schema/vega-lite/v3.2.1.json", "datasets": {"data-310d21641df02465dd0f9c9a466de9d4": [{"Sample ID": "Sample1", "qurro_balance": null, "Metadata1": 1, "Metadata2": 2, "Metadata3": 3}, {"Sample ID": "Sample2", "qurro_balance": null, "Metadata1": 4, "Metadata2": 5, "Metadata3": 6}, {"Sample ID": "Sample3", "qurro_balance": null, "Metadata1": 7, "Metadata2": 8, "Metadata3": 9}, {"Sample ID": "Sample5", "qurro_balance": null, "Metadata1": 13, "Metadata2": 14, "Metadata3": 15}, {"Sample ID": "Sample6", "qurro_balance": null, "Metadata1": 16, "Metadata2": 17, "Metadata3": 18}, {"Sample ID": "Sample7", "qurro_balance": null, "Metadata1": 19, "Metadata2": 20, "Metadata3": 21}]}};
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
            chai.assert.sameMembers(
                [
                    "Sample ID",
                    "qurro_balance",
                    "Metadata1",
                    "Metadata2",
                    "Metadata3"
                ],
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
