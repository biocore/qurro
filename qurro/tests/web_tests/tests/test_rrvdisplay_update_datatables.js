define(["display", "mocha", "chai", "testing_utilities"], function(
    display,
    mocha,
    chai,
    testing_utilities
) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"gridColor": "#f2f2f2", "labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-ceb3e53dd82dc2b785cc2ba76931c96b"}, "datasets": {"data-ceb3e53dd82dc2b785cc2ba76931c96b": [{"Feature ID": "Taxon1", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 5.0}, {"Feature ID": "Taxon2", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 5.0}, {"Feature ID": "Taxon3", "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 6.0}, {"Feature ID": "Taxon4", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 6.0}, {"Feature ID": "Taxon5", "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0, "Rank 3": 0.0, "Rank 4": 4.0, "qurro_classification": "None", "qurro_spc": 2.0}], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2", "Rank 3", "Rank 4"], "qurro_rank_type": "Differential"}, "encoding": {"color": {"field": "qurro_classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}, "title": "Log-Ratio Classification", "type": "nominal"}, "tooltip": [{"field": "qurro_x", "title": "Current Ranking", "type": "quantitative"}, {"field": "qurro_classification", "title": "Log-Ratio Classification", "type": "nominal"}, {"field": "qurro_spc", "title": "Sample Presence Count", "type": "quantitative"}, {"field": "Feature ID", "type": "nominal"}, {"field": "FeatureMetadata1", "type": "nominal"}, {"field": "FeatureMetadata2", "type": "nominal"}, {"field": "Intercept", "type": "quantitative"}, {"field": "Rank 1", "type": "quantitative"}, {"field": "Rank 2", "type": "quantitative"}, {"field": "Rank 3", "type": "quantitative"}, {"field": "Rank 4", "type": "quantitative"}], "x": {"axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Feature Rankings", "type": "ordinal"}, "y": {"field": "Intercept", "type": "quantitative"}}, "mark": "bar", "selection": {"selector005": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Features", "transform": [{"sort": [{"field": "Intercept", "order": "ascending"}], "window": [{"as": "qurro_x", "op": "row_number"}]}]};
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "range": {"category": {"scheme": "tableau10"}, "ramp": {"scheme": "blues"}}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-17ad6d7eb8d11fdb67d65d9f4abd5654"}, "datasets": {"data-17ad6d7eb8d11fdb67d65d9f4abd5654": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}], "qurro_sample_metadata_fields": ["Metadata1", "Metadata2", "Metadata3", "Sample ID"]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "scale": {"zero": false}, "type": "nominal"}, "y": {"field": "qurro_balance", "scale": {"zero": false}, "title": "Current Natural Log-Ratio", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector006": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Samples"};
    // prettier-ignore
    var countJSON = {"Taxon1": {"Sample2": 1.0, "Sample3": 2.0, "Sample5": 4.0, "Sample6": 5.0, "Sample7": 6.0}, "Taxon2": {"Sample1": 6.0, "Sample2": 5.0, "Sample3": 4.0, "Sample5": 2.0, "Sample6": 1.0}, "Taxon3": {"Sample1": 2.0, "Sample2": 3.0, "Sample3": 4.0, "Sample5": 4.0, "Sample6": 3.0, "Sample7": 2.0}, "Taxon4": {"Sample1": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample5": 1.0, "Sample6": 1.0, "Sample7": 1.0}, "Taxon5": {"Sample3": 1.0, "Sample5": 2.0}};

    describe("Updating the feature DataTables in RRVDisplay.updateFeaturesDisplays()", function() {
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

        /* Starts an integration test using the feature filtering controls.
         *
         * Assumes that rrv is already in a "blank slate" state, but I don't
         * think that should matter too much (esp due to the before/after hooks
         * of these tests).
         *
         * Yes, this function is shamelessly copied from test_rrvdisplay.js
         * because refactoring things so that resetRRVDisplay(),
         * runFeatureFiltering(), etc. were in testing_utilities was going
         * to be painful.
         *
         * This code duplication is a bandaid solution; ideally this will be
         * fixed in the future when I have spare time haha haha oh no
         */
        async function runFeatureFiltering(
            numField,
            numText,
            numSearchType,
            denField,
            denText,
            denSearchType
        ) {
            document.getElementById("topSearch").value = numField;
            document.getElementById("botSearch").value = denField;
            document.getElementById("topSearchType").value = numSearchType;
            document.getElementById("botSearchType").value = denSearchType;
            document.getElementById("topText").value = numText;
            document.getElementById("botText").value = denText;
            // should result in rrv.regenerateFromFiltering() being called
            await document.getElementById("multiFeatureButton").onclick();
        }

        it("Works for single-feature selections", function() {
            rrv.newFeatureHigh = testing_utilities.getFeatureRow(rrv, "Taxon3");
            rrv.newFeatureLow = testing_utilities.getFeatureRow(rrv, "Taxon4");
            rrv.updateFeaturesDisplays(true);

            // Check that tables are updated properly
            testing_utilities.checkDataTable("topFeaturesDisplay", {
                Taxon3: [4, 5, 6, 0, 4, "Yeet", "100"]
            });
            testing_utilities.checkDataTable("botFeaturesDisplay", {
                Taxon4: [9, 8, 7, 0, 4, null, null]
            });
            // Check that headers are updated accordingly
            testing_utilities.checkHeaders(1, 1, 5);

            // Check stuff again -- ensure that the updating action overwrites the
            // previous values
            rrv.newFeatureHigh = testing_utilities.getFeatureRow(rrv, "Taxon1");
            rrv.newFeatureLow = testing_utilities.getFeatureRow(rrv, "Taxon2");
            rrv.updateFeaturesDisplays(true);

            // ...and check results again
            testing_utilities.checkDataTable("topFeaturesDisplay", {
                Taxon1: [5, 6, 7, 0, 4, null, null]
            });
            testing_utilities.checkDataTable("botFeaturesDisplay", {
                Taxon2: [1, 2, 3, 0, 4, null, null]
            });
            testing_utilities.checkHeaders(1, 1, 5);
        });
        it("Works for multi-feature selections", async function() {
            await runFeatureFiltering(
                "Feature ID",
                "Taxon",
                "text",
                "Feature ID",
                "3",
                "text"
            );
            testing_utilities.checkDataTable("topFeaturesDisplay", {
                Taxon1: [5, 6, 7, 0, 4, null, null],
                Taxon2: [1, 2, 3, 0, 4, null, null],
                Taxon3: [4, 5, 6, 0, 4, "Yeet", "100"],
                Taxon4: [9, 8, 7, 0, 4, null, null],
                Taxon5: [6, 5, 4, 0, 4, "null", "lol"]
            });
            testing_utilities.checkDataTable("botFeaturesDisplay", {
                Taxon3: [4, 5, 6, 0, 4, "Yeet", "100"]
            });
            testing_utilities.checkHeaders(5, 1, 5);
        });
        it('Clears the "feature text" DOM elements properly', function() {
            // PART 1
            // Populate the DOM elements
            rrv.newFeatureHigh = testing_utilities.getFeatureRow(rrv, "Taxon1");
            rrv.newFeatureLow = testing_utilities.getFeatureRow(rrv, "Taxon4");
            rrv.updateFeaturesDisplays(true);
            // Just to be super sure, check that the headers were updated
            // correctly
            testing_utilities.checkHeaders(1, 1, 5);
            // Check that clearing works
            rrv.updateFeaturesDisplays(false, true);
            testing_utilities.checkDataTable("topFeaturesDisplay", {});
            testing_utilities.checkDataTable("botFeaturesDisplay", {});
            testing_utilities.checkHeaders(0, 0, 5);

            // PART 2
            // Repopulate the DOM elements
            rrv.newFeatureHigh = testing_utilities.getFeatureRow(rrv, "Taxon1");
            rrv.newFeatureLow = testing_utilities.getFeatureRow(rrv, "Taxon4");
            rrv.updateFeaturesDisplays(true);
            // Again, be paranoid and check that headers were properly updated
            testing_utilities.checkHeaders(1, 1, 5);
            // Check that clearing is done, even if "single" is true
            // (the "clear" argument should take priority)
            rrv.updateFeaturesDisplays(true, true);
            testing_utilities.checkDataTable("topFeaturesDisplay", {});
            testing_utilities.checkDataTable("botFeaturesDisplay", {});
            testing_utilities.checkHeaders(0, 0, 5);
        });
        it("Works when both selected feature list(s) are empty", async function() {
            await runFeatureFiltering(
                "Feature ID",
                "aoisdjfoisdjfoasidj",
                "text",
                "Feature ID",
                "oijaoqwijedoqwiejqowiejqowiej",
                "text"
            );
            testing_utilities.checkDataTable("topFeaturesDisplay", {});
            testing_utilities.checkDataTable("botFeaturesDisplay", {});
            testing_utilities.checkHeaders(0, 0, 5);
        });
        it("Works when just one selected feature list is empty", async function() {
            await runFeatureFiltering(
                "Feature ID",
                "Taxon3",
                "text",
                "Feature ID",
                "oijaoqwijedoqwiejqowiejqowiej",
                "text"
            );
            testing_utilities.checkDataTable("topFeaturesDisplay", {
                Taxon3: [4, 5, 6, 0, 4, "Yeet", "100"]
            });
            testing_utilities.checkDataTable("botFeaturesDisplay", {});
            testing_utilities.checkHeaders(1, 0, 5);
        });
    });
});
