define(["display", "mocha", "chai", "testing_utilities"], function(
    display,
    mocha,
    chai,
    testing_utilities
) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"gridColor": "#f2f2f2", "labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-d5bf6e97702c9e72a67a25d194eadce5"}, "datasets": {"data-d5bf6e97702c9e72a67a25d194eadce5": [{"Feature ID": "Taxon1", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0, "qurro_classification": "None"}, {"Feature ID": "Taxon2", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0, "qurro_classification": "None"}, {"Feature ID": "Taxon3", "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0, "qurro_classification": "None"}, {"Feature ID": "Taxon4", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0, "qurro_classification": "None"}, {"Feature ID": "Taxon5", "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0, "qurro_classification": "None"}], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2"]}, "encoding": {"color": {"field": "qurro_classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}, "title": "Log-Ratio Classification", "type": "nominal"}, "tooltip": [{"field": "qurro_x", "title": "Current Ranking", "type": "quantitative"}, {"field": "qurro_classification", "title": "Log-Ratio Classification", "type": "nominal"}, {"field": "Feature ID", "type": "nominal"}, {"field": "FeatureMetadata1", "type": "nominal"}, {"field": "FeatureMetadata2", "type": "nominal"}, {"field": "Intercept", "type": "quantitative"}, {"field": "Rank 1", "type": "quantitative"}, {"field": "Rank 2", "type": "quantitative"}], "x": {"axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Sorted Features", "type": "ordinal"}, "y": {"field": "Intercept", "type": "quantitative"}}, "mark": "bar", "selection": {"selector005": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Feature Ranks", "transform": [{"sort": [{"field": "Intercept", "order": "ascending"}], "window": [{"as": "qurro_x", "op": "row_number"}]}]};
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "range": {"category": {"scheme": "tableau10"}, "ramp": {"scheme": "blues"}}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-17ad6d7eb8d11fdb67d65d9f4abd5654"}, "datasets": {"data-17ad6d7eb8d11fdb67d65d9f4abd5654": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}], "qurro_sample_metadata_fields": ["Metadata1", "Metadata2", "Metadata3", "Sample ID"]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "type": "nominal"}, "y": {"field": "qurro_balance", "title": "log(Numerator / Denominator)", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector006": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Log-Ratio of Abundances in Samples"};
    // prettier-ignore
    var countJSON = {"Taxon1": {"Sample2": 1.0, "Sample3": 2.0, "Sample5": 4.0, "Sample6": 5.0, "Sample7": 6.0}, "Taxon2": {"Sample1": 6.0, "Sample2": 5.0, "Sample3": 4.0, "Sample5": 2.0, "Sample6": 1.0}, "Taxon3": {"Sample1": 2.0, "Sample2": 3.0, "Sample3": 4.0, "Sample5": 4.0, "Sample6": 3.0, "Sample7": 2.0}, "Taxon4": {"Sample1": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample5": 1.0, "Sample6": 1.0, "Sample7": 1.0}, "Taxon5": {"Sample3": 1.0, "Sample5": 2.0}};

    describe('Updating "feature text" DOM elements via RRVDisplay.updateFeaturesTextDisplays()', function() {
        var rrv;
        before(async function() {
            rrv = new display.RRVDisplay(
                rankPlotJSON,
                samplePlotJSON,
                countJSON
            );
            await rrv.makePlots();
        });
        after(async function() {
            await rrv.destroy(true, true, true);
        });
        it("Works for single-feature selections", function() {
            rrv.newFeatureHigh = {
                "Feature ID": "New feature name high",
                FeatureMetadata1: 5,
                FeatureMetadata2: "test"
            };
            rrv.newFeatureLow = {
                "Feature ID": "New feature name low",
                FeatureMetadata1: 10,
                FeatureMetadata2: 3
            };
            rrv.updateFeaturesTextDisplays(true);
            chai.assert.equal(
                document.getElementById("topFeaturesDisplay").value,
                "New feature name high / 5 / test"
            );
            chai.assert.equal(
                document.getElementById("botFeaturesDisplay").value,
                "New feature name low / 10 / 3"
            );
            testing_utilities.checkHeaders(1, 1, 5);
            // Check it again -- ensure that the updating action overwrites the
            // previous values
            rrv.newFeatureHigh = {
                "Feature ID": "Thing 1!",
                FeatureMetadata2: "lol"
            };
            rrv.newFeatureLow = { "Feature ID": "Thing 2!" };
            rrv.updateFeaturesTextDisplays(true);
            chai.assert.equal(
                document.getElementById("topFeaturesDisplay").value,
                "Thing 1! / / lol"
            );
            chai.assert.equal(
                document.getElementById("botFeaturesDisplay").value,
                "Thing 2! / / "
            );
            testing_utilities.checkHeaders(1, 1, 5);
        });
        it("Works for multi-feature selections", function() {
            // Standard case
            // only checking a single feature metadata field here, for my
            // own sanity
            rrv.featureMetadataFields = ["f1"];
            rrv.topFeatures = [
                { "Feature ID": "abc", f1: 1 },
                { "Feature ID": "def", f1: 2 },
                { "Feature ID": "ghi", f1: 3 },
                { "Feature ID": "lmno pqrs", f1: 4 },
                { "Feature ID": "tuv", f1: null }
            ];
            rrv.botFeatures = [
                { "Feature ID": "asdf", f1: null },
                { "Feature ID": "ghjk", f1: 7 }
            ];
            var expectedTopText =
                "abc / 1\ndef / 2\nghi / 3\nlmno pqrs / 4\ntuv / ";
            var expectedBotText = "asdf / \nghjk / 7";
            rrv.updateFeaturesTextDisplays();
            chai.assert.equal(
                document.getElementById("topFeaturesDisplay").value,
                expectedTopText
            );
            chai.assert.equal(
                document.getElementById("botFeaturesDisplay").value,
                expectedBotText
            );
            testing_utilities.checkHeaders(5, 2, 5);
            // Check case where there's only one feature in a list
            // In this case, the denominator + expected bottom text are the
            // same as before
            rrv.topFeatures = [{ "Feature ID": "onlyfeature", f1: 100 }];
            expectedTopText = "onlyfeature / 100";
            rrv.updateFeaturesTextDisplays();
            chai.assert.equal(
                document.getElementById("topFeaturesDisplay").value,
                expectedTopText
            );
            chai.assert.equal(
                document.getElementById("botFeaturesDisplay").value,
                expectedBotText
            );
            testing_utilities.checkHeaders(1, 2, 5);
            // Check case where lists are empty
            // This could happen if, e.g., both of the user's text queries
            // don't have any results.
            rrv.topFeatures = [];
            rrv.botFeatures = [];
            rrv.updateFeaturesTextDisplays();
            chai.assert.isEmpty(
                document.getElementById("topFeaturesDisplay").value
            );
            chai.assert.isEmpty(
                document.getElementById("botFeaturesDisplay").value
            );
            testing_utilities.checkHeaders(0, 0, 5);
        });
        it('Clears the "feature text" DOM elements properly', function() {
            // Populate the DOM elements
            rrv.newFeatureHigh = "Thing 1!";
            rrv.newFeatureLow = "Thing 2!";
            rrv.updateFeaturesTextDisplays(true);
            // Just to be super sure, check that the headers were updated
            // correctly
            testing_utilities.checkHeaders(1, 1, 5);
            // Check that clearing works
            rrv.updateFeaturesTextDisplays(false, true);
            chai.assert.isEmpty(
                document.getElementById("topFeaturesDisplay").value
            );
            chai.assert.isEmpty(
                document.getElementById("botFeaturesDisplay").value
            );
            testing_utilities.checkHeaders(0, 0, 5);
            // Repopulate the DOM elements
            rrv.newFeatureHigh = "Thing 1!";
            rrv.newFeatureLow = "Thing 2!";
            rrv.updateFeaturesTextDisplays(true);
            testing_utilities.checkHeaders(1, 1, 5);
            // Check that clearing is done, even if "single" is true
            // (the "clear" argument takes priority)
            rrv.updateFeaturesTextDisplays(true, true);
            chai.assert.isEmpty(
                document.getElementById("topFeaturesDisplay").value
            );
            chai.assert.isEmpty(
                document.getElementById("botFeaturesDisplay").value
            );
            testing_utilities.checkHeaders(0, 0, 5);
        });
    });
});
