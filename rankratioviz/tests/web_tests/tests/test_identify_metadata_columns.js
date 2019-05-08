define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the sample plot from the python "matching" integration test
    // prettier-ignore
    var samplePlotJSON = {"config": {"view": {"width": 400, "height": 300}, "mark": {"tooltip": null}}, "data": {"name": "data-2726d002e1133092c83d9a599aab7af9"}, "mark": "circle", "autosize": {"resize": true}, "background": "#FFFFFF", "encoding": {"color": {"type": "nominal", "field": "Metadata1"}, "tooltip": [{"type": "nominal", "field": "Sample ID"}, {"type": "quantitative", "field": "rankratioviz_balance"}], "x": {"type": "quantitative", "field": "rankratioviz_balance"}, "y": {"type": "quantitative", "field": "rankratioviz_balance", "title": "log(Numerator / Denominator)"}}, "title": "Log Ratio of Abundances in Samples", "$schema": "https://vega.github.io/schema/vega-lite/v3.2.1.json", "datasets": {"data-2726d002e1133092c83d9a599aab7af9": [{"Sample ID": "Sample6", "rankratioviz_balance": null, "Metadata1": 16, "Metadata2": 17, "Metadata3": 18}, {"Sample ID": "Sample3", "rankratioviz_balance": null, "Metadata1": 7, "Metadata2": 8, "Metadata3": 9}, {"Sample ID": "Sample5", "rankratioviz_balance": null, "Metadata1": 13, "Metadata2": 14, "Metadata3": 15}, {"Sample ID": "Sample1", "rankratioviz_balance": null, "Metadata1": 1, "Metadata2": 2, "Metadata3": 3}, {"Sample ID": "Sample2", "rankratioviz_balance": null, "Metadata1": 4, "Metadata2": 5, "Metadata3": 6}, {"Sample ID": "Sample7", "rankratioviz_balance": null, "Metadata1": 19, "Metadata2": 20, "Metadata3": 21}], "rankratioviz_feature_counts": {"Taxon2": {"Sample6": 1.0, "Sample3": 4.0, "Sample5": 2.0, "Sample1": 6.0, "Sample2": 5.0, "Sample7": 0.0}, "Taxon5": {"Sample6": 0.0, "Sample3": 1.0, "Sample5": 2.0, "Sample1": 0.0, "Sample2": 0.0, "Sample7": 0.0}, "Taxon4": {"Sample6": 1.0, "Sample3": 1.0, "Sample5": 1.0, "Sample1": 1.0, "Sample2": 1.0, "Sample7": 1.0}, "Taxon3|Yeet|100": {"Sample6": 3.0, "Sample3": 4.0, "Sample5": 4.0, "Sample1": 2.0, "Sample2": 3.0, "Sample7": 2.0}, "Taxon1": {"Sample6": 5.0, "Sample3": 2.0, "Sample5": 4.0, "Sample1": 0.0, "Sample2": 1.0, "Sample7": 6.0}}}};
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
                    "rankratioviz_balance",
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
