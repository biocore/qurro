define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"config": {"view": {"width": 400, "height": 300}, "mark": {"tooltip": null}, "axis": {"gridColor": "#f2f2f2", "labelBound": true}}, "data": {"name": "data-7416c68b284d7fabf6066e786fa2c0aa"}, "mark": "bar", "autosize": {"resize": true}, "background": "#FFFFFF", "encoding": {"color": {"type": "nominal", "field": "Classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}}, "tooltip": [{"type": "quantitative", "field": "qurro_x", "title": "Current Ranking"}, {"type": "nominal", "field": "Classification"}, {"type": "nominal", "field": "Feature ID"}, {"type": "nominal", "field": "FeatureMetadata1"}, {"type": "nominal", "field": "FeatureMetadata2"}], "x": {"type": "ordinal", "axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Sorted Features"}, "y": {"type": "quantitative", "field": "Intercept"}}, "selection": {"selector015": {"type": "interval", "bind": "scales", "encodings": ["x", "y"]}}, "title": "Feature Ranks", "transform": [{"window": [{"op": "row_number", "as": "qurro_x"}], "sort": [{"field": "Intercept", "order": "ascending"}]}], "$schema": "https://vega.github.io/schema/vega-lite/v3.2.1.json", "datasets": {"data-7416c68b284d7fabf6066e786fa2c0aa": [{"Feature ID": "Taxon1", "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0, "FeatureMetadata1": null, "FeatureMetadata2": null, "Classification": "None"}, {"Feature ID": "Taxon2", "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0, "FeatureMetadata1": null, "FeatureMetadata2": null, "Classification": "None"}, {"Feature ID": "Taxon3", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0, "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Classification": "None"}, {"Feature ID": "Taxon4", "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0, "FeatureMetadata1": null, "FeatureMetadata2": null, "Classification": "None"}, {"Feature ID": "Taxon5", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0, "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Classification": "None"}], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2"], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"]}};
    // prettier-ignore
    var samplePlotJSON = {"config": {"view": {"width": 400, "height": 300}, "mark": {"tooltip": null}, "axis": {"labelBound": true}}, "data": {"name": "data-310d21641df02465dd0f9c9a466de9d4"}, "mark": {"type": "circle"}, "autosize": {"resize": true}, "background": "#FFFFFF", "encoding": {"color": {"type": "nominal", "field": "Metadata1"}, "tooltip": [{"type": "nominal", "field": "Sample ID"}, {"type": "quantitative", "field": "qurro_balance"}], "x": {"type": "quantitative", "field": "qurro_balance"}, "y": {"type": "quantitative", "field": "qurro_balance", "title": "log(Numerator / Denominator)"}}, "selection": {"selector016": {"type": "interval", "bind": "scales", "encodings": ["x", "y"]}}, "title": "Log Ratio of Abundances in Samples", "$schema": "https://vega.github.io/schema/vega-lite/v3.2.1.json", "datasets": {"data-310d21641df02465dd0f9c9a466de9d4": [{"Sample ID": "Sample1", "qurro_balance": null, "Metadata1": 1, "Metadata2": 2, "Metadata3": 3}, {"Sample ID": "Sample2", "qurro_balance": null, "Metadata1": 4, "Metadata2": 5, "Metadata3": 6}, {"Sample ID": "Sample3", "qurro_balance": null, "Metadata1": 7, "Metadata2": 8, "Metadata3": 9}, {"Sample ID": "Sample5", "qurro_balance": null, "Metadata1": 13, "Metadata2": 14, "Metadata3": 15}, {"Sample ID": "Sample6", "qurro_balance": null, "Metadata1": 16, "Metadata2": 17, "Metadata3": 18}, {"Sample ID": "Sample7", "qurro_balance": null, "Metadata1": 19, "Metadata2": 20, "Metadata3": 21}]}};
    // prettier-ignore
    var countJSON = {"Taxon4": {"Sample7": 1.0, "Sample1": 1.0, "Sample5": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample6": 1.0}, "Taxon2": {"Sample7": 0.0, "Sample1": 6.0, "Sample5": 2.0, "Sample2": 5.0, "Sample3": 4.0, "Sample6": 1.0}, "Taxon3": {"Sample7": 2.0, "Sample1": 2.0, "Sample5": 4.0, "Sample2": 3.0, "Sample3": 4.0, "Sample6": 3.0}, "Taxon5": {"Sample7": 0.0, "Sample1": 0.0, "Sample5": 2.0, "Sample2": 0.0, "Sample3": 1.0, "Sample6": 0.0}, "Taxon1": {"Sample7": 6.0, "Sample1": 0.0, "Sample5": 4.0, "Sample2": 1.0, "Sample3": 2.0, "Sample6": 5.0}};

    describe("Dynamic RRVDisplay class functionality", function() {
        var rrv = new display.RRVDisplay(
            rankPlotJSON,
            samplePlotJSON,
            countJSON
        );
        after(function() {
            rrv.destroy(true, true, true);
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
            // Check that DOM bindings were properly set
            chai.assert.isNotEmpty(rrv.elementsWithOnClickBindings);
            for (var i = 0; i < rrv.elementsWithOnClickBindings.length; i++) {
                chai.assert.isFunction(
                    document.getElementById(rrv.elementsWithOnClickBindings[i])
                        .onclick
                );
            }
        });

        it("Identifies nonexistent sample IDs", function() {
            chai.assert.doesNotThrow(function() {
                rrv.validateSampleID("Sample2");
            });
            chai.assert.throws(function() {
                rrv.validateSampleID("SuperFakeSampleName");
            });
        });

        describe("Computing sample log ratios", function() {
            describe("Single-feature selections", function() {
                it("Computes the correct sample log ratio", function() {
                    rrv.newFeatureHigh = { "Feature ID": "Taxon3" };
                    rrv.newFeatureLow = { "Feature ID": "Taxon4" };
                    chai.assert.equal(
                        Math.log(3),
                        rrv.updateBalanceSingle({ "Sample ID": "Sample6" })
                    );
                    // Test that flipping the counts within the log ratio works
                    rrv.newFeatureHigh = { "Feature ID": "Taxon4" };
                    rrv.newFeatureLow = { "Feature ID": "Taxon3" };
                    chai.assert.equal(
                        -Math.log(3),
                        rrv.updateBalanceSingle({ "Sample ID": "Sample6" })
                    );
                    // Try the same stuff out with different features and sample
                    rrv.newFeatureHigh = { "Feature ID": "Taxon1" };
                    rrv.newFeatureLow = { "Feature ID": "Taxon2" };
                    chai.assert.equal(
                        Math.log(2),
                        rrv.updateBalanceSingle({ "Sample ID": "Sample5" })
                    );
                    rrv.newFeatureHigh = { "Feature ID": "Taxon2" };
                    rrv.newFeatureLow = { "Feature ID": "Taxon1" };
                    chai.assert.equal(
                        -Math.log(2),
                        rrv.updateBalanceSingle({ "Sample ID": "Sample5" })
                    );
                });
                it("Returns NaN when numerator and/or denominator is 0", function() {
                    // In this first case, only the numerator is a 0.
                    rrv.newFeatureHigh = { "Feature ID": "Taxon1" };
                    rrv.newFeatureLow = { "Feature ID": "Taxon2" };
                    chai.assert.isNaN(
                        rrv.updateBalanceSingle({ "Sample ID": "Sample1" })
                    );
                    // In this next case, both the numerator and denominator are 0.
                    rrv.newFeatureHigh = { "Feature ID": "Taxon1" };
                    rrv.newFeatureLow = { "Feature ID": "Taxon1" };
                    chai.assert.isNaN(
                        rrv.updateBalanceSingle({ "Sample ID": "Sample1" })
                    );
                });

                it("Throws an error if sample ID isn't present in data", function() {
                    chai.assert.throws(function() {
                        rrv.updateBalanceSingle({
                            "Sample ID": "lolthisisntreal"
                        });
                    });
                });
            });
            describe("Multi-feature selections", function() {
                it("Computes the correct sample log ratio", function() {
                    // Standard 2-taxon / 2-taxon case
                    rrv.topFeatures = [
                        { "Feature ID": "Taxon1" },
                        { "Feature ID": "Taxon3" }
                    ];
                    rrv.botFeatures = [
                        { "Feature ID": "Taxon2" },
                        { "Feature ID": "Taxon4" }
                    ];
                    chai.assert.equal(
                        Math.log(2 / 7),
                        rrv.updateBalanceMulti({ "Sample ID": "Sample1" })
                    );
                    // only one feature over another (therefore should be equal to
                    // updateBalanceSingle -- this is the same test as done above)
                    rrv.topFeatures = [{ "Feature ID": "Taxon3" }];
                    rrv.botFeatures = [{ "Feature ID": "Taxon4" }];
                    chai.assert.equal(
                        Math.log(2),
                        rrv.updateBalanceMulti({ "Sample ID": "Sample1" })
                    );
                });
                it("Returns NaN when numerator and/or denominator feature lists are empty", function() {
                    // Test what happens when numerator and/or denominator feature
                    // lists are empty. If either or both of these feature lists are
                    // empty, we should get a NaN balance (since that corresponds to
                    // the numerator and/or denominator of the log ratio being 0).
                    // 1. Both numerator and denominator are empty
                    rrv.topFeatures = [];
                    rrv.botFeatures = [];
                    chai.assert.isNaN(
                        rrv.updateBalanceMulti({ "Sample ID": "Sample1" })
                    );
                    // 2. Just numerator is empty
                    rrv.botFeatures = [{ "Feature ID": "Taxon4" }];
                    chai.assert.isNaN(
                        rrv.updateBalanceMulti({ "Sample ID": "Sample1" })
                    );
                    // 3. Just denominator is empty
                    rrv.topFeatures = [{ "Feature ID": "Taxon2" }];
                    rrv.botFeatures = [];
                    chai.assert.isNaN(
                        rrv.updateBalanceMulti({ "Sample ID": "Sample1" })
                    );
                });
                it("Throws an error if sample ID isn't present in data", function() {
                    // Same as in the updateBalanceSingle test -- verify that
                    // a nonexistent sample ID causes an error
                    chai.assert.throws(function() {
                        rrv.updateBalanceMulti({
                            "Sample ID": "lolthisisntreal"
                        });
                    });
                });
            });
            describe("Summing feature abundances in a sample", function() {
                it("Correctly sums feature abundances in a sample", function() {
                    // Check case when number of features is just one
                    chai.assert.equal(
                        6,
                        rrv.sumAbundancesForSampleFeatures(
                            { "Sample ID": "Sample1" },
                            [{ "Feature ID": "Taxon2" }]
                        )
                    );
                    // Check with multiple features
                    chai.assert.equal(
                        7,
                        rrv.sumAbundancesForSampleFeatures(
                            { "Sample ID": "Sample1" },
                            [
                                { "Feature ID": "Taxon2" },
                                { "Feature ID": "Taxon4" }
                            ]
                        )
                    );
                    chai.assert.equal(
                        7,
                        rrv.sumAbundancesForSampleFeatures(
                            { "Sample ID": "Sample1" },
                            [
                                { "Feature ID": "Taxon2" },
                                { "Feature ID": "Taxon4" },
                                { "Feature ID": "Taxon1" }
                            ]
                        )
                    );
                    // Check with another sample + an annotated feature
                    chai.assert.equal(
                        8,
                        rrv.sumAbundancesForSampleFeatures(
                            { "Sample ID": "Sample2" },
                            [
                                { "Feature ID": "Taxon2" },
                                { "Feature ID": "Taxon3" }
                            ]
                        )
                    );
                });
                it("Returns 0 when the input list of features is empty", function() {
                    chai.assert.equal(
                        0,
                        rrv.sumAbundancesForSampleFeatures(
                            { "Sample ID": "Sample3" },
                            []
                        )
                    );
                });
                it("Throws an error if sample ID isn't present in data", function() {
                    // Check that an invalid sample ID causes an error
                    chai.assert.throws(function() {
                        rrv.sumAbundancesForSampleFeatures(
                            { "Sample ID": "lolthisisntreal" },
                            []
                        );
                    });
                });
            });
        });

        function checkHeaders(expTopCt, expBotCt) {
            chai.assert.equal(
                document.getElementById("numHeader").innerHTML,
                "Numerator Features (" +
                    expTopCt.toLocaleString() +
                    " selected)"
            );
            chai.assert.equal(
                document.getElementById("denHeader").innerHTML,
                "Denominator Features (" +
                    expBotCt.toLocaleString() +
                    " selected)"
            );
        }

        describe('Updating "feature text" DOM elements', function() {
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
                checkHeaders(1, 1);
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
                checkHeaders(1, 1);
            });
            it("Works for multi-feature selections", function() {
                // Standard case
                // only checking a single feature metadata field here, for my
                // own sanity
                rrv.featureMetadataFields = ["Feature ID"];
                rrv.topFeatures = [
                    { "Feature ID": "abc" },
                    { "Feature ID": "def" },
                    { "Feature ID": "ghi" },
                    { "Feature ID": "lmno pqrs" },
                    { "Feature ID": "tuv" }
                ];
                rrv.botFeatures = [
                    { "Feature ID": "asdf" },
                    { "Feature ID": "ghjk" }
                ];
                var expectedTopText = "abc\ndef\nghi\nlmno pqrs\ntuv";
                var expectedBotText = "asdf\nghjk";
                rrv.updateFeaturesTextDisplays();
                chai.assert.equal(
                    document.getElementById("topFeaturesDisplay").value,
                    expectedTopText
                );
                chai.assert.equal(
                    document.getElementById("botFeaturesDisplay").value,
                    expectedBotText
                );
                checkHeaders(5, 2);
                // Check case where there's only one feature in a list
                // In this case, the denominator + expected bottom text are the
                // same as before
                rrv.topFeatures = [{ "Feature ID": "onlyfeature" }];
                expectedTopText = "onlyfeature";
                rrv.updateFeaturesTextDisplays();
                chai.assert.equal(
                    document.getElementById("topFeaturesDisplay").value,
                    expectedTopText
                );
                chai.assert.equal(
                    document.getElementById("botFeaturesDisplay").value,
                    expectedBotText
                );
                checkHeaders(1, 2);
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
                checkHeaders(0, 0);
            });
            it('Clears the "feature text" DOM elements properly', function() {
                // Populate the DOM elements
                rrv.newFeatureHigh = "Thing 1!";
                rrv.newFeatureLow = "Thing 2!";
                rrv.updateFeaturesTextDisplays(true);
                // Just to be super sure, check that the headers were updated
                // correctly
                checkHeaders(1, 1);
                // Check that clearing works
                rrv.updateFeaturesTextDisplays(false, true);
                chai.assert.isEmpty(
                    document.getElementById("topFeaturesDisplay").value
                );
                chai.assert.isEmpty(
                    document.getElementById("botFeaturesDisplay").value
                );
                checkHeaders(0, 0);
                // Repopulate the DOM elements
                rrv.newFeatureHigh = "Thing 1!";
                rrv.newFeatureLow = "Thing 2!";
                rrv.updateFeaturesTextDisplays(true);
                checkHeaders(1, 1);
                // Check that clearing is done, even if "single" is true
                // (the "clear" argument takes priority)
                rrv.updateFeaturesTextDisplays(true, true);
                chai.assert.isEmpty(
                    document.getElementById("topFeaturesDisplay").value
                );
                chai.assert.isEmpty(
                    document.getElementById("botFeaturesDisplay").value
                );
                checkHeaders(0, 0);
            });
        });
        describe("Updating feature rank colors", function() {
            it("Works for single-feature selections", function() {
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

            it("Works for multi-feature selections", function() {
                rrv.topFeatures = [
                    { "Feature ID": "Feature1" },
                    { "Feature ID": "Feature2" },
                    { "Feature ID": "Feature3" }
                ];
                rrv.botFeatures = [
                    { "Feature ID": "Feature3" },
                    { "Feature ID": "Feature4" }
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
        describe("Identifying samples with a valid metadata field value", function() {
            function testOnMetadata1AndX(expectedSampleIDs) {
                var observedValidSamples = rrv.getValidSamples(
                    "Metadata1",
                    "x"
                );
                chai.assert.sameMembers(
                    expectedSampleIDs,
                    observedValidSamples
                );
            }
            describe("Works properly when all samples have a valid field", function() {
                var allSampleIDs = [
                    "Sample1",
                    "Sample2",
                    "Sample3",
                    "Sample5",
                    "Sample6",
                    "Sample7"
                ];
                it("...When there's a quantitative encoding", function() {
                    rrv.samplePlotJSON.encoding.x.type = "quantitative";
                    testOnMetadata1AndX(allSampleIDs);
                });
                it("...When there's a nominal encoding", function() {
                    rrv.samplePlotJSON.encoding.x.type = "nominal";
                    testOnMetadata1AndX(allSampleIDs);
                });
            });
            describe('Filters out samples with null/undefined/"" field values', function() {
                var dataName = rrv.samplePlotJSON.data.name;

                before(function() {
                    // Manually set some samples' metadata vals to
                    // null/undefined/"" for testing purposes
                    // (Samples 1, 2, and 3, respectively)
                    rrv.samplePlotJSON.datasets[dataName][0].Metadata1 = null;
                    rrv.samplePlotJSON.datasets[
                        dataName
                    ][1].Metadata1 = undefined;
                    rrv.samplePlotJSON.datasets[dataName][2].Metadata1 = "";
                });

                after(function() {
                    // Reset samples 1, 2, and 3's metadata values
                    // (These values are based on what's in the
                    // sample_metadata.txt file for the matching test inputs.
                    // Please don't change that unless you have a really good
                    // reason.)
                    rrv.samplePlotJSON.datasets[dataName][0].Metadata1 = 1;
                    rrv.samplePlotJSON.datasets[dataName][1].Metadata1 = 4;
                    rrv.samplePlotJSON.datasets[dataName][2].Metadata1 = 7;
                });

                // The samples we adjusted above are Samples 1, 2, and 3.
                // (Sample 4 should be dropped on the python side of things due
                // to being unsupported in the BIOM table.)
                // So the only "valid" samples, then, should be 5, 6, and 7.
                var expectedSampleIDs = ["Sample5", "Sample6", "Sample7"];

                it("...When there's a quantitative encoding", function() {
                    rrv.samplePlotJSON.encoding.x.type = "quantitative";
                    testOnMetadata1AndX(expectedSampleIDs);
                });
                it("...When there's a nominal encoding", function() {
                    rrv.samplePlotJSON.encoding.x.type = "nominal";
                    testOnMetadata1AndX(expectedSampleIDs);
                });
            });
        });
        describe("Selecting features to update the plots", function() {
            describe("Single-feature selections", function() {
                it("Works properly");
                // TODO refactor display callback code to make it more easily
                // testable (won't have to rely on clicks)
            });
            describe("Multi-feature selections", function() {
                it("Works properly");
                // Should be able to just call .click() on multiFeatureButton
                // (after populating search fields/types, of course)
            });
        });
        // TODO: Update these to test modifying the plot JSONs.
        describe("Modifying plot scales/axes", function() {
            // can use view.signal() to do this. Very feasible.
            describe("Changing the rank used on the rank plot", function() {
                it("Works properly");
            });
            describe("Changing the x-axis used on the sample plot", function() {
                it("Works properly");
            });
            describe("Changing the x-axis scale type used on the sample plot", function() {
                it("Works properly");
            });
            describe("Changing the color used on the sample plot", function() {
                it("Works properly");
            });
            describe("Changing the color scale type used on the sample plot", function() {
                it("Works properly");
            });
        });
    });
});
