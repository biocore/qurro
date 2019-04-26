define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var testSpec = {"config": {"view": {"width": 400, "height": 300}}, "data": {"name": "data-33b482effd2339a0422dedfb6f7fcd0c"}, "mark": "circle", "encoding": {"color": {"type": "nominal", "field": "Metadata1"}, "tooltip": [{"type": "nominal", "field": "Sample ID"}], "x": {"type": "quantitative", "field": "Metadata1"}, "y": {"type": "quantitative", "field": "rankratioviz_balance", "title": "log(Numerator / Denominator)"}}, "title": "Log Ratio of Abundances in Samples", "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json", "datasets": {"data-33b482effd2339a0422dedfb6f7fcd0c": [{"Sample ID": "Sample7", "rankratioviz_balance": null, "Metadata1": 19, "Metadata2": 20, "Metadata3": 21}, {"Sample ID": "Sample6", "rankratioviz_balance": null, "Metadata1": 16, "Metadata2": 17, "Metadata3": 18}, {"Sample ID": "Sample2", "rankratioviz_balance": null, "Metadata1": 4, "Metadata2": 5, "Metadata3": 6}, {"Sample ID": "Sample1", "rankratioviz_balance": null, "Metadata1": 1, "Metadata2": 2, "Metadata3": 3}, {"Sample ID": "Sample5", "rankratioviz_balance": null, "Metadata1": 13, "Metadata2": 14, "Metadata3": 15}, {"Sample ID": "Sample3", "rankratioviz_balance": null, "Metadata1": 7, "Metadata2": 8, "Metadata3": 9}], "rankratioviz_feature_col_ids": {"Taxon3|Yeet|100": "0", "Taxon4": "1", "Taxon1": "2", "Taxon5": "3", "Taxon2": "4"}, "rankratioviz_feature_counts": {"0": {"Sample7": 2.0, "Sample6": 3.0, "Sample2": 3.0, "Sample1": 2.0, "Sample5": 4.0, "Sample3": 4.0}, "1": {"Sample7": 1.0, "Sample6": 1.0, "Sample2": 1.0, "Sample1": 1.0, "Sample5": 1.0, "Sample3": 1.0}, "2": {"Sample7": 6.0, "Sample6": 5.0, "Sample2": 1.0, "Sample1": 0.0, "Sample5": 4.0, "Sample3": 2.0}, "3": {"Sample7": 0.0, "Sample6": 0.0, "Sample2": 0.0, "Sample1": 0.0, "Sample5": 2.0, "Sample3": 1.0}, "4": {"Sample7": 0.0, "Sample6": 1.0, "Sample2": 5.0, "Sample1": 6.0, "Sample5": 2.0, "Sample3": 4.0}}}};
    // Like testSpec, but none of the sample points have any metadata
    // fields defined
    // prettier-ignore
    var badSpec = {"config": {"view": {"width": 400, "height": 300}}, "data": {"name": "data-33b482effd2339a0422dedfb6f7fcd0c"}, "mark": "circle", "encoding": {"color": {"type": "nominal", "field": "Metadata1"}, "tooltip": [{"type": "nominal", "field": "Sample ID"}], "x": {"type": "quantitative", "field": "Metadata1"}, "y": {"type": "quantitative", "field": "rankratioviz_balance", "title": "log(Numerator / Denominator)"}}, "title": "Log Ratio of Abundances in Samples", "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json", "datasets": {"data-33b482effd2339a0422dedfb6f7fcd0c": [{}, {}, {}, {}, {}, {}], "rankratioviz_feature_col_ids": {"Taxon3|Yeet|100": "0", "Taxon4": "1", "Taxon1": "2", "Taxon5": "3", "Taxon2": "4"}, "rankratioviz_feature_counts": {"0": {"Sample7": 2.0, "Sample6": 3.0, "Sample2": 3.0, "Sample1": 2.0, "Sample5": 4.0, "Sample3": 4.0}, "1": {"Sample7": 1.0, "Sample6": 1.0, "Sample2": 1.0, "Sample1": 1.0, "Sample5": 1.0, "Sample3": 1.0}, "2": {"Sample7": 6.0, "Sample6": 5.0, "Sample2": 1.0, "Sample1": 0.0, "Sample5": 4.0, "Sample3": 2.0}, "3": {"Sample7": 0.0, "Sample6": 0.0, "Sample2": 0.0, "Sample1": 0.0, "Sample5": 2.0, "Sample3": 1.0}, "4": {"Sample7": 0.0, "Sample6": 1.0, "Sample2": 5.0, "Sample1": 6.0, "Sample5": 2.0, "Sample3": 4.0}}}};
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
                display.RRVDisplay.identifyMetadataColumns(testSpec)
            );
        });
        it("Throws an error when no metadata columns present", function() {
            chai.assert.throws(function() {
                display.RRVDisplay.identifyMetadataColumns(badSpec);
            });
        });
    });
});
