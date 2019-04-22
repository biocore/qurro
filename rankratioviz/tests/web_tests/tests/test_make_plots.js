define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"config": {"view": {"width": 400, "height": 300}, "axis": {"gridColor": "#f2f2f2"}}, "data": {"name": "data-9a1dd79e18e69cf28db67fccfed0f389"}, "mark": "bar", "encoding": {"color": {"type": "nominal", "field": "Classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}}, "size": {"value": 1.0}, "tooltip": [{"type": "quantitative", "field": "x"}, {"type": "nominal", "field": "Classification"}, {"type": "nominal", "field": "Feature ID"}], "x": {"type": "quantitative", "field": "x", "title": "Features"}, "y": {"type": "quantitative", "field": "Intercept"}}, "selection": {"selector005": {"type": "interval", "bind": "scales", "encodings": ["x", "y"]}}, "title": "Feature Ranks", "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json", "datasets": {"data-9a1dd79e18e69cf28db67fccfed0f389": [{"Feature ID": "Taxon2", "x": 0, "Classification": "None", "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0}, {"Feature ID": "Taxon3|Yeet|100", "x": 1, "Classification": "None", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0}, {"Feature ID": "Taxon1", "x": 2, "Classification": "None", "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0}, {"Feature ID": "Taxon5", "x": 3, "Classification": "None", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0}, {"Feature ID": "Taxon4", "x": 4, "Classification": "None", "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0}], "rankratioviz_rank_ordering": ["Intercept", "Rank 1", "Rank 2"]}};
    // prettier-ignore
    var samplePlotJSON = {"config": {"view": {"width": 400, "height": 300}}, "data": {"name": "data-33b482effd2339a0422dedfb6f7fcd0c"}, "mark": "circle", "encoding": {"color": {"type": "nominal", "field": "Metadata1"}, "tooltip": [{"type": "nominal", "field": "Sample ID"}], "x": {"type": "quantitative", "field": "Metadata1"}, "y": {"type": "quantitative", "field": "rankratioviz_balance", "title": "log(Numerator / Denominator)"}}, "title": "Log Ratio of Abundances in Samples", "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json", "datasets": {"data-33b482effd2339a0422dedfb6f7fcd0c": [{"Sample ID": "Sample7", "rankratioviz_balance": null, "Metadata1": 19, "Metadata2": 20, "Metadata3": 21}, {"Sample ID": "Sample6", "rankratioviz_balance": null, "Metadata1": 16, "Metadata2": 17, "Metadata3": 18}, {"Sample ID": "Sample2", "rankratioviz_balance": null, "Metadata1": 4, "Metadata2": 5, "Metadata3": 6}, {"Sample ID": "Sample1", "rankratioviz_balance": null, "Metadata1": 1, "Metadata2": 2, "Metadata3": 3}, {"Sample ID": "Sample5", "rankratioviz_balance": null, "Metadata1": 13, "Metadata2": 14, "Metadata3": 15}, {"Sample ID": "Sample3", "rankratioviz_balance": null, "Metadata1": 7, "Metadata2": 8, "Metadata3": 9}], "rankratioviz_feature_col_ids": {"Taxon3|Yeet|100": "0", "Taxon4": "1", "Taxon1": "2", "Taxon5": "3", "Taxon2": "4"}, "rankratioviz_feature_counts": {"0": {"Sample7": 2.0, "Sample6": 3.0, "Sample2": 3.0, "Sample1": 2.0, "Sample5": 4.0, "Sample3": 4.0}, "1": {"Sample7": 1.0, "Sample6": 1.0, "Sample2": 1.0, "Sample1": 1.0, "Sample5": 1.0, "Sample3": 1.0}, "2": {"Sample7": 6.0, "Sample6": 5.0, "Sample2": 1.0, "Sample1": 0.0, "Sample5": 4.0, "Sample3": 2.0}, "3": {"Sample7": 0.0, "Sample6": 0.0, "Sample2": 0.0, "Sample1": 0.0, "Sample5": 2.0, "Sample3": 1.0}, "4": {"Sample7": 0.0, "Sample6": 1.0, "Sample2": 5.0, "Sample1": 6.0, "Sample5": 2.0, "Sample3": 4.0}}}};
    describe("Basic RRVDisplay class functionality", function() {
        var rrv = new display.RRVDisplay(rankPlotJSON, samplePlotJSON);
        after(function() {
            rrv.destroy();
        });
        it("Initializes an RRVDisplay object", function() {
            // This test doesn't check much. Unit tests of the RRVDisplay
            // methods are needed to validate things more carefully.
            chai.assert.strictEqual(rrv.rankPlotJSON, rankPlotJSON);
            chai.assert.strictEqual(rrv.samplePlotJSON, samplePlotJSON);
            // RRVDisplay.onHigh indicates that the next "single"-selected
            // feature from the rank plot will be the numerator of a log
            // ratio
            chai.assert.isTrue(rrv.onHigh);
            chai.assert.exists(rrv.rankPlotView);
            chai.assert.exists(rrv.samplePlotView);
        });
        it('Computes the correct sample log ratio in "single" feature selections', function() {
            // Recall that .featureHighCol and .featureLowCol correspond to the
            // feature column IDs (as an example, in this case:
            // "0" -> "Taxon3|Yeet|100" and "1" -> "Taxon4").
            rrv.featureHighCol = "0";
            rrv.featureLowCol = "1";
            chai.assert.equal(
                Math.log(3),
                rrv.updateBalanceSingle({ "Sample ID": "Sample6" })
            );
            // Test that flipping the counts within the log ratio works
            rrv.featureHighCol = "1";
            rrv.featureLowCol = "0";
            chai.assert.equal(
                -Math.log(3),
                rrv.updateBalanceSingle({ "Sample ID": "Sample6" })
            );
            // Try the same stuff out with different features and sample
            rrv.featureHighCol = "2";
            rrv.featureLowCol = "4";
            chai.assert.equal(
                Math.log(2),
                rrv.updateBalanceSingle({ "Sample ID": "Sample5" })
            );
            rrv.featureHighCol = "4";
            rrv.featureLowCol = "2";
            chai.assert.equal(
                -Math.log(2),
                rrv.updateBalanceSingle({ "Sample ID": "Sample5" })
            );
            // Test that NaNs are returned
            // In this first case, only the numerator is a 0.
            rrv.featureHighCol = "2";
            rrv.featureLowCol = "4";
            chai.assert.isNaN(
                rrv.updateBalanceSingle({ "Sample ID": "Sample1" })
            );
            // In this next case, both the numerator and denominator are 0.
            rrv.featureHighCol = "2";
            rrv.featureLowCol = "2";
            chai.assert.isNaN(
                rrv.updateBalanceSingle({ "Sample ID": "Sample1" })
            );
            // Test that invalid sample IDs result in an error
            chai.assert.throws(function() {
                rrv.updateBalanceSingle({ "Sample ID": "lolthisisntreal" });
            });
        });
        // TODO add tests that things like balance computations (via
        // updateBalance*, and sumAbundancesForSampleFeatures) work
        // properly based on this object. Now that we can arbitrarily
        // define rrv objects, this should be feasible!!!!
    });
});
