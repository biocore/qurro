define(["mocha", "chai", "testing_utilities"], function (
    mocha,
    chai,
    testing_utilities
) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v5.20.1.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"gridColor": "#f2f2f2", "labelBound": true}, "view": {"continuousHeight": 300, "continuousWidth": 300}}, "data": {"name": "data-5786322ff080b593c2b67d29ec714ae6"}, "datasets": {"data-5786322ff080b593c2b67d29ec714ae6": [{"Feature ID": "Taxon1", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 5.0}, {"Feature ID": "Taxon2", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 5.0}, {"Feature ID": "Taxon3", "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 6.0}, {"Feature ID": "Taxon4", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 6.0}, {"Feature ID": "Taxon5", "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 2.0}], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2", "Rank 3", "Rank 4"], "qurro_rank_type": "Differential"}, "encoding": {"color": {"field": "qurro_classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}, "title": "Log-Ratio Classification", "type": "nominal"}, "tooltip": [{"field": "qurro_x", "title": "Current Ranking", "type": "quantitative"}, {"field": "qurro_classification", "title": "Log-Ratio Classification", "type": "nominal"}, {"field": "qurro_spc", "title": "Sample Presence Count", "type": "quantitative"}, {"field": "Feature ID", "type": "nominal"}, {"field": "FeatureMetadata1", "type": "nominal"}, {"field": "FeatureMetadata2", "type": "nominal"}, {"field": "Intercept", "type": "quantitative"}, {"field": "Rank 1", "type": "quantitative"}, {"field": "Rank 2", "type": "quantitative"}, {"field": "Rank 3", "type": "quantitative"}, {"field": "Rank 4", "type": "quantitative"}], "x": {"axis": {"labelAngle": 0, "labelOverlap": true, "labelSeparation": 4, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1}, "title": "Feature Rankings", "type": "ordinal"}, "y": {"field": "Intercept", "type": "quantitative"}}, "mark": {"type": "bar"}, "params": [{"bind": "scales", "name": "param_5", "select": {"encodings": ["x", "y"], "type": "interval"}}], "title": "Features", "transform": [{"sort": [{"field": "Intercept", "order": "ascending"}], "window": [{"as": "qurro_x", "op": "row_number"}]}], "width": {"step": 1}};
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v5.20.1.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "range": {"category": {"scheme": "tableau10"}, "ramp": {"scheme": "blues"}}, "view": {"continuousHeight": 300, "continuousWidth": 300}}, "data": {"name": "data-7e86bed68a58096f8c231249526ce664"}, "datasets": {"data-7e86bed68a58096f8c231249526ce664": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}], "qurro_sample_metadata_fields": ["Metadata1", "Metadata2", "Metadata3", "Sample ID"]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "scale": {"zero": false}, "type": "nominal"}, "y": {"field": "qurro_balance", "scale": {"zero": false}, "title": "Current Natural Log-Ratio", "type": "quantitative"}}, "mark": {"type": "circle"}, "params": [{"bind": "scales", "name": "param_6", "select": {"encodings": ["x", "y"], "type": "interval"}}], "title": "Samples"};
    // prettier-ignore
    var countJSON = {"Taxon1": {"Sample2": 1.0, "Sample3": 2.0, "Sample5": 4.0, "Sample6": 5.0, "Sample7": 6.0}, "Taxon2": {"Sample1": 6.0, "Sample2": 5.0, "Sample3": 4.0, "Sample5": 2.0, "Sample6": 1.0}, "Taxon3": {"Sample1": 2.0, "Sample2": 3.0, "Sample3": 4.0, "Sample5": 4.0, "Sample6": 3.0, "Sample7": 2.0}, "Taxon4": {"Sample1": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample5": 1.0, "Sample6": 1.0, "Sample7": 1.0}, "Taxon5": {"Sample3": 1.0, "Sample5": 2.0}};

    describe("Updating features' colors in the rank plot based on the current selection", function () {
        var rrv;
        before(async function () {
            rrv = testing_utilities.getNewRRVDisplay(
                rankPlotJSON,
                samplePlotJSON,
                countJSON
            );
            await rrv.makePlots();
        });
        after(async function () {
            await rrv.destroy(true, true, true);
        });
        it("Works for single-feature selections", function () {
            rrv.newFeatureHigh = { "Feature ID": "FH" };
            rrv.newFeatureLow = { "Feature ID": "FL" };
            chai.assert.equal(
                "Numerator",
                rrv.updateRankColorSingle({ "Feature ID": "FH" })
            );
            chai.assert.equal(
                "Denominator",
                rrv.updateRankColorSingle({ "Feature ID": "FL" })
            );
            chai.assert.equal(
                "None",
                rrv.updateRankColorSingle({ "Feature ID": "FN" })
            );
            // Test "both" case
            rrv.newFeatureLow = { "Feature ID": "FH" };
            chai.assert.equal(
                "Both",
                rrv.updateRankColorSingle({ "Feature ID": "FH" })
            );
        });

        it("Works for multi-feature selections", function () {
            rrv.topFeatures = [
                { "Feature ID": "Feature1" },
                { "Feature ID": "Feature2" },
                { "Feature ID": "Feature3" },
            ];
            rrv.botFeatures = [
                { "Feature ID": "Feature3" },
                { "Feature ID": "Feature4" },
            ];
            chai.assert.equal(
                "Numerator",
                rrv.updateRankColorMulti({ "Feature ID": "Feature1" })
            );
            chai.assert.equal(
                "Denominator",
                rrv.updateRankColorMulti({ "Feature ID": "Feature4" })
            );
            chai.assert.equal(
                "None",
                rrv.updateRankColorMulti({ "Feature ID": "FeatureN" })
            );
            chai.assert.equal(
                "Both",
                rrv.updateRankColorMulti({ "Feature ID": "Feature3" })
            );
        });
    });
});
