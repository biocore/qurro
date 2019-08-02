define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"gridColor": "#f2f2f2", "labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-d5bf6e97702c9e72a67a25d194eadce5"}, "datasets": {"data-d5bf6e97702c9e72a67a25d194eadce5": [{"Feature ID": "Taxon1", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0, "qurro_classification": "None"}, {"Feature ID": "Taxon2", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0, "qurro_classification": "None"}, {"Feature ID": "Taxon3", "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0, "qurro_classification": "None"}, {"Feature ID": "Taxon4", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0, "qurro_classification": "None"}, {"Feature ID": "Taxon5", "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0, "qurro_classification": "None"}], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2"]}, "encoding": {"color": {"field": "qurro_classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}, "title": "Log-Ratio Classification", "type": "nominal"}, "tooltip": [{"field": "qurro_x", "title": "Current Ranking", "type": "quantitative"}, {"field": "qurro_classification", "title": "Log-Ratio Classification", "type": "nominal"}, {"field": "Feature ID", "type": "nominal"}, {"field": "FeatureMetadata1", "type": "nominal"}, {"field": "FeatureMetadata2", "type": "nominal"}, {"field": "Intercept", "type": "quantitative"}, {"field": "Rank 1", "type": "quantitative"}, {"field": "Rank 2", "type": "quantitative"}], "x": {"axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Sorted Features", "type": "ordinal"}, "y": {"field": "Intercept", "type": "quantitative"}}, "mark": "bar", "selection": {"selector005": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Feature Ranks", "transform": [{"sort": [{"field": "Intercept", "order": "ascending"}], "window": [{"as": "qurro_x", "op": "row_number"}]}]};
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "range": {"category": {"scheme": "tableau10"}, "ramp": {"scheme": "blues"}}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-17ad6d7eb8d11fdb67d65d9f4abd5654"}, "datasets": {"data-17ad6d7eb8d11fdb67d65d9f4abd5654": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}], "qurro_sample_metadata_fields": ["Metadata1", "Metadata2", "Metadata3", "Sample ID"]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "type": "nominal"}, "y": {"field": "qurro_balance", "title": "log(Numerator / Denominator)", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector006": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Log-Ratio of Abundances in Samples"};
    // prettier-ignore
    var countJSON = {"Taxon1": {"Sample2": 1.0, "Sample3": 2.0, "Sample5": 4.0, "Sample6": 5.0, "Sample7": 6.0}, "Taxon2": {"Sample1": 6.0, "Sample2": 5.0, "Sample3": 4.0, "Sample5": 2.0, "Sample6": 1.0}, "Taxon3": {"Sample1": 2.0, "Sample2": 3.0, "Sample3": 4.0, "Sample5": 4.0, "Sample6": 3.0, "Sample7": 2.0}, "Taxon4": {"Sample1": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample5": 1.0, "Sample6": 1.0, "Sample7": 1.0}, "Taxon5": {"Sample3": 1.0, "Sample5": 2.0}};

    describe("Using RRVDisplay.getInvalidSampleIDs() to distinguish samples with invalid metadata field values", function() {
        var rrv, dataName;
        before(async function() {
            rrv = new display.RRVDisplay(
                rankPlotJSON,
                samplePlotJSON,
                countJSON
            );
            dataName = rrv.samplePlotJSON.data.name;
            await rrv.makePlots();
        });
        after(async function() {
            await rrv.destroy(true, true, true);
        });
        function testOnMetadata1AndX(expectedInvalidSampleIDs) {
            var observedInvalidSampleIDs = rrv.getInvalidSampleIDs(
                "Metadata1",
                "x"
            );
            chai.assert.sameMembers(
                expectedInvalidSampleIDs,
                observedInvalidSampleIDs
            );
        }
        function resetMetadata1Values() {
            // (These values are based on what's in the
            // sample_metadata.txt file for the matching test inputs.
            // Please don't change that unless you have a really good
            // reason.)
            rrv.samplePlotJSON.datasets[dataName][0].Metadata1 = 1;
            rrv.samplePlotJSON.datasets[dataName][1].Metadata1 = 4;
            rrv.samplePlotJSON.datasets[dataName][2].Metadata1 = 7;
            rrv.samplePlotJSON.datasets[dataName][3].Metadata1 = 13;
            rrv.samplePlotJSON.datasets[dataName][4].Metadata1 = 16;
            rrv.samplePlotJSON.datasets[dataName][5].Metadata1 = 19;
        }
        function fillMetadata1Vals(value) {
            for (
                var i = 0;
                i < rrv.samplePlotJSON.datasets[dataName].length;
                i++
            ) {
                rrv.samplePlotJSON.datasets[dataName][i].Metadata1 = value;
            }
        }
        var allSampleIDs = [
            "Sample1",
            "Sample2",
            "Sample3",
            "Sample5",
            "Sample6",
            "Sample7"
        ];
        describe("Works properly when all samples have a valid field", function() {
            it("...When there's a quantitative encoding", function() {
                rrv.samplePlotJSON.encoding.x.type = "quantitative";
                // We expect the list of invalid sample IDs to be [] --
                // that is, every sample should be "valid."
                testOnMetadata1AndX([]);
            });
            describe("...When there's a nominal encoding", function() {
                before(function() {
                    rrv.samplePlotJSON.encoding.x.type = "nominal";
                });
                it('Works properly with "normal" numerical values', function() {
                    testOnMetadata1AndX([]);
                });
                it('Accepts "special" values in strings like "NaN", "null", etc.', function() {
                    // These are just non-empty strings, so they should be
                    // acceptable.
                    rrv.samplePlotJSON.datasets[dataName][0].Metadata1 = "NaN";
                    rrv.samplePlotJSON.datasets[dataName][1].Metadata1 =
                        "Infinity";
                    rrv.samplePlotJSON.datasets[dataName][2].Metadata1 =
                        "-Infinity";
                    rrv.samplePlotJSON.datasets[dataName][3].Metadata1 = "null";
                    rrv.samplePlotJSON.datasets[dataName][4].Metadata1 =
                        "undefined";
                    rrv.samplePlotJSON.datasets[dataName][5].Metadata1 = '""';
                    testOnMetadata1AndX([]);
                });
                it('Works ok with just-whitespace strings (" ")', function() {
                    fillMetadata1Vals(" ");
                    testOnMetadata1AndX([]);
                });
            });
        });
        describe("Filtering out samples with null field values", function() {
            before(function() {
                resetMetadata1Values();
                // Manually set some samples' (1, 2, and 3) metadata vals
                // to null or "null". ("null" should be treated as a normal
                // string value, while actual null should be always
                // filtered out regardless of encoding)
                rrv.samplePlotJSON.datasets[dataName][0].Metadata1 = null;
                rrv.samplePlotJSON.datasets[dataName][1].Metadata1 = null;
                rrv.samplePlotJSON.datasets[dataName][2].Metadata1 = "null";
            });

            after(resetMetadata1Values);

            // The samples we adjusted above are Samples 1, 2, and 3.
            // (Sample 4 should be dropped on the python side of things due
            // to being unsupported in the BIOM table.)
            // So the "invalid" samples, then, should be 1, 2, and 3.
            var expectedSampleIDs = ["Sample1", "Sample2", "Sample3"];

            it("...When there's a quantitative encoding", function() {
                // Both the actual null values and normal strings (like the
                // "null" value that we set to Sample3) should be filtered
                // out for a quantitative encoding.
                rrv.samplePlotJSON.encoding.x.type = "quantitative";
                testOnMetadata1AndX(["Sample1", "Sample2", "Sample3"]);
            });
            it("...When there's a nominal encoding", function() {
                // "null" should be kept since it's just a normal string,
                // as tested above. The actual null values should be
                // filtered out -- even in a nominal encoding -- though.
                rrv.samplePlotJSON.encoding.x.type = "nominal";
                testOnMetadata1AndX(["Sample1", "Sample2"]);
            });
        });
        describe("Filtering out non-numeric values if encoding is quantitative", function() {
            before(function() {
                resetMetadata1Values();
                rrv.samplePlotJSON.encoding.x.type = "quantitative";
            });
            after(resetMetadata1Values);

            it("Works properly when only some samples' field values are non-numeric", function() {
                rrv.samplePlotJSON.datasets[dataName][0].Metadata1 =
                    "Missing: not provided";
                rrv.samplePlotJSON.datasets[dataName][1].Metadata1 = "3.2a";
                rrv.samplePlotJSON.datasets[dataName][2].Metadata1 =
                    "2019-07-14";
                testOnMetadata1AndX(["Sample1", "Sample2", "Sample3"]);
            });
            it("Works properly when all samples' field values are non-numeric", function() {
                fillMetadata1Vals("Missing: not provided");
                testOnMetadata1AndX(allSampleIDs);
            });
            it("Properly filters out string Infinity values", function() {
                fillMetadata1Vals("Infinity");
                testOnMetadata1AndX(allSampleIDs);
            });
            it("Properly filters out string -Infinity values", function() {
                fillMetadata1Vals("-Infinity");
                testOnMetadata1AndX(allSampleIDs);
            });
            it("Properly filters out string NaN values", function() {
                fillMetadata1Vals("NaN");
                testOnMetadata1AndX(allSampleIDs);
            });
            it("Properly filters out string undefined values", function() {
                fillMetadata1Vals("undefined");
                testOnMetadata1AndX(allSampleIDs);
            });
        });
    });
});
