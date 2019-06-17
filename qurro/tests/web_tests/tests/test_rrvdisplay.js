define(["display", "mocha", "chai", "testing_utilities"], function(
    display,
    mocha,
    chai,
    testing_utilities
) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"gridColor": "#f2f2f2", "labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-7416c68b284d7fabf6066e786fa2c0aa"}, "datasets": {"data-7416c68b284d7fabf6066e786fa2c0aa": [{"Classification": "None", "Feature ID": "Taxon1", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0}, {"Classification": "None", "Feature ID": "Taxon2", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0}, {"Classification": "None", "Feature ID": "Taxon3", "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0}, {"Classification": "None", "Feature ID": "Taxon4", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0}, {"Classification": "None", "Feature ID": "Taxon5", "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0}], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2"]}, "encoding": {"color": {"field": "Classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}, "type": "nominal"}, "tooltip": [{"field": "qurro_x", "title": "Current Ranking", "type": "quantitative"}, {"field": "Classification", "type": "nominal"}, {"field": "Feature ID", "type": "nominal"}, {"field": "FeatureMetadata1", "type": "nominal"}, {"field": "FeatureMetadata2", "type": "nominal"}], "x": {"axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Sorted Features", "type": "ordinal"}, "y": {"field": "Intercept", "type": "quantitative"}}, "mark": "bar", "selection": {"selector015": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Feature Ranks", "transform": [{"sort": [{"field": "Intercept", "order": "ascending"}], "window": [{"as": "qurro_x", "op": "row_number"}]}]};
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-17ad6d7eb8d11fdb67d65d9f4abd5654"}, "datasets": {"data-17ad6d7eb8d11fdb67d65d9f4abd5654": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "type": "nominal"}, "y": {"field": "qurro_balance", "title": "log(Numerator / Denominator)", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector016": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Log Ratio of Abundances in Samples"};
    // prettier-ignore
    var countJSON = {"Taxon4": {"Sample7": 1.0, "Sample1": 1.0, "Sample5": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample6": 1.0}, "Taxon2": {"Sample7": 0.0, "Sample1": 6.0, "Sample5": 2.0, "Sample2": 5.0, "Sample3": 4.0, "Sample6": 1.0}, "Taxon3": {"Sample7": 2.0, "Sample1": 2.0, "Sample5": 4.0, "Sample2": 3.0, "Sample3": 4.0, "Sample6": 3.0}, "Taxon5": {"Sample7": 0.0, "Sample1": 0.0, "Sample5": 2.0, "Sample2": 0.0, "Sample3": 1.0, "Sample6": 0.0}, "Taxon1": {"Sample7": 6.0, "Sample1": 0.0, "Sample5": 4.0, "Sample2": 1.0, "Sample3": 2.0, "Sample6": 5.0}};

    function getNewRRVDisplay() {
        return new display.RRVDisplay(
            JSON.parse(JSON.stringify(rankPlotJSON)),
            JSON.parse(JSON.stringify(samplePlotJSON)),
            JSON.parse(JSON.stringify(countJSON))
        );
    }

    describe("Dynamic RRVDisplay class functionality", function() {
        var rrv, dataName;
        async function resetRRVDisplay() {
            rrv.destroy(true, true, true);
            rrv = getNewRRVDisplay();
            await rrv.makePlots();
        }
        before(async function() {
            rrv = getNewRRVDisplay();
            dataName = rrv.samplePlotJSON.data.name;
            await rrv.makePlots();
        });
        after(function() {
            rrv.destroy(true, true, true);
        });

        it("Initializes an RRVDisplay object", function() {
            // We don't bother checking that the JSONs are equal b/c all we do
            // is just set them equal. Also, there are some things done on init
            // (that modify the RRVDisplay object's copy of the JSON) that
            // change things, so comparing equality wouldn't work anyway.
            //
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
                it("Returns null when numerator and/or denominator is 0", function() {
                    // In this first case, only the numerator is a 0.
                    rrv.newFeatureHigh = { "Feature ID": "Taxon1" };
                    rrv.newFeatureLow = { "Feature ID": "Taxon2" };
                    chai.assert.isNull(
                        rrv.updateBalanceSingle({ "Sample ID": "Sample1" })
                    );
                    // In this next case, both the numerator and denominator are 0.
                    rrv.newFeatureHigh = { "Feature ID": "Taxon1" };
                    rrv.newFeatureLow = { "Feature ID": "Taxon1" };
                    chai.assert.isNull(
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
                it("Returns null when numerator and/or denominator feature lists are empty", function() {
                    // Test what happens when numerator and/or denominator
                    // feature lists are empty. If either or both of these
                    // feature lists are empty, we should get a null balance
                    // (since that corresponds to the numerator and/or
                    // denominator of the log ratio being 0, due to how we
                    // define compute_balance()).
                    // 1. Both numerator and denominator are empty
                    rrv.topFeatures = [];
                    rrv.botFeatures = [];
                    chai.assert.isNull(
                        rrv.updateBalanceMulti({ "Sample ID": "Sample1" })
                    );
                    // 2. Just numerator is empty
                    rrv.botFeatures = [{ "Feature ID": "Taxon4" }];
                    chai.assert.isNull(
                        rrv.updateBalanceMulti({ "Sample ID": "Sample1" })
                    );
                    // 3. Just denominator is empty
                    rrv.topFeatures = [{ "Feature ID": "Taxon2" }];
                    rrv.botFeatures = [];
                    chai.assert.isNull(
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
                testing_utilities.checkHeaders(1, 1);
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
                testing_utilities.checkHeaders(1, 1);
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
                testing_utilities.checkHeaders(5, 2);
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
                testing_utilities.checkHeaders(1, 2);
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
                testing_utilities.checkHeaders(0, 0);
            });
            it('Clears the "feature text" DOM elements properly', function() {
                // Populate the DOM elements
                rrv.newFeatureHigh = "Thing 1!";
                rrv.newFeatureLow = "Thing 2!";
                rrv.updateFeaturesTextDisplays(true);
                // Just to be super sure, check that the headers were updated
                // correctly
                testing_utilities.checkHeaders(1, 1);
                // Check that clearing works
                rrv.updateFeaturesTextDisplays(false, true);
                chai.assert.isEmpty(
                    document.getElementById("topFeaturesDisplay").value
                );
                chai.assert.isEmpty(
                    document.getElementById("botFeaturesDisplay").value
                );
                testing_utilities.checkHeaders(0, 0);
                // Repopulate the DOM elements
                rrv.newFeatureHigh = "Thing 1!";
                rrv.newFeatureLow = "Thing 2!";
                rrv.updateFeaturesTextDisplays(true);
                testing_utilities.checkHeaders(1, 1);
                // Check that clearing is done, even if "single" is true
                // (the "clear" argument takes priority)
                rrv.updateFeaturesTextDisplays(true, true);
                chai.assert.isEmpty(
                    document.getElementById("topFeaturesDisplay").value
                );
                chai.assert.isEmpty(
                    document.getElementById("botFeaturesDisplay").value
                );
                testing_utilities.checkHeaders(0, 0);
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
                        rrv.samplePlotJSON.datasets[dataName][0].Metadata1 =
                            "NaN";
                        rrv.samplePlotJSON.datasets[dataName][1].Metadata1 =
                            "Infinity";
                        rrv.samplePlotJSON.datasets[dataName][2].Metadata1 =
                            "-Infinity";
                        rrv.samplePlotJSON.datasets[dataName][3].Metadata1 =
                            "null";
                        rrv.samplePlotJSON.datasets[dataName][4].Metadata1 =
                            "undefined";
                        rrv.samplePlotJSON.datasets[dataName][5].Metadata1 =
                            '""';
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
        describe("Selecting features to update the plots", function() {
            /* Resets an RRVDisplay object so we're working with a blank slate
             * before test(s).
             */
            async function updateSingleAndCheckAllBalancesNull() {
                await rrv.updateSamplePlotSingle();
                var data = rrv.samplePlotView.data(dataName);
                for (var i = 0; i < data.length; i++) {
                    chai.assert.isNull(data[i].qurro_balance);
                }
                testing_utilities.checkHeaders(0, 0);
            }
            describe("Single-feature selections", function() {
                beforeEach(async function() {
                    await resetRRVDisplay(rrv);
                });
                it("Doesn't do anything if .newFeatureLow and/or .newFeatureHigh is null or undefined", async function() {
                    // Since we just called resetRRVDisplay(),
                    // rrv.newFeatureLow and rrv.newFeatureHigh should both be
                    // undefined.
                    // Check (low = undefined, high = undefined)
                    await updateSingleAndCheckAllBalancesNull();

                    // Check (low = null, high = undefined)
                    // and (low = undefined, high = null)
                    rrv.newFeatureLow = null;
                    await updateSingleAndCheckAllBalancesNull();
                    rrv.newFeatureLow = undefined;
                    await updateSingleAndCheckAllBalancesNull();

                    // Check (low = null, high = null)
                    rrv.newFeatureHigh = null;
                    await updateSingleAndCheckAllBalancesNull();

                    // Check (low = null, high = an actual feature object)
                    // and (low = undefined, high = an actual feature object)
                    rrv.newFeatureHigh = { "Feature ID": "Taxon1" };
                    await updateSingleAndCheckAllBalancesNull();
                    rrv.newFeatureLow = undefined;
                    await updateSingleAndCheckAllBalancesNull();

                    // Check (low = an actual feature object, high = null)
                    // and (low = an actual feature object, high = undefined)
                    rrv.newFeatureLow = { "Feature ID": "Taxon1" };
                    rrv.newFeatureHigh = null;
                    await updateSingleAndCheckAllBalancesNull();
                    rrv.newFeatureHigh = undefined;
                    await updateSingleAndCheckAllBalancesNull();
                });
                it("Doesn't do anything if the newly selected features don't differ from the old ones", async function() {
                    rrv.oldFeatureLow = { "Feature ID": "Taxon1" };
                    rrv.oldFeatureHigh = { "Feature ID": "Taxon2" };
                    rrv.newFeatureLow = { "Feature ID": "Taxon1" };
                    rrv.newFeatureHigh = { "Feature ID": "Taxon2" };
                    await updateSingleAndCheckAllBalancesNull();
                });
                it("Works properly when actually changing the plots", async function() {
                    rrv.newFeatureLow = { "Feature ID": "Taxon2" };
                    rrv.newFeatureHigh = { "Feature ID": "Taxon1" };
                    await rrv.updateSamplePlotSingle();
                    // Check that the sample log ratios were properly updated
                    // Sample1 has a Taxon1 count of 0, so its log ratio should
                    // be null (because log(0/x) is undefined).
                    chai.assert.isNull(
                        rrv.samplePlotJSON.datasets[dataName][0].qurro_balance
                    );
                    // Sample2
                    chai.assert.equal(
                        Math.log(1 / 5),
                        rrv.samplePlotJSON.datasets[dataName][1].qurro_balance
                    );
                    // Sample3
                    chai.assert.equal(
                        Math.log(2 / 4),
                        rrv.samplePlotJSON.datasets[dataName][2].qurro_balance
                    );
                    // Sample5
                    chai.assert.equal(
                        Math.log(4 / 2),
                        rrv.samplePlotJSON.datasets[dataName][3].qurro_balance
                    );
                    // Sample6
                    chai.assert.equal(
                        Math.log(5 / 1),
                        rrv.samplePlotJSON.datasets[dataName][4].qurro_balance
                    );
                    // Sample7
                    chai.assert.isNull(
                        rrv.samplePlotJSON.datasets[dataName][5].qurro_balance
                    );
                    // Check that various DOM elements were properly updated
                    testing_utilities.checkHeaders(1, 1);
                    chai.assert.equal(
                        "2 / 6 samples (33.33%) can't be shown due to having an invalid (i.e. containing zero) log ratio.",
                        document.getElementById("balanceSamplesDroppedDiv")
                            .textContent
                    );
                    chai.assert.equal(
                        "4 / 6 samples (66.67%) currently shown.",
                        document.getElementById("mainSamplesDroppedDiv")
                            .textContent
                    );
                    chai.assert.isFalse(
                        document
                            .getElementById("mainSamplesDroppedDiv")
                            .classList.contains("invisible")
                    );
                    chai.assert.isFalse(
                        document
                            .getElementById("balanceSamplesDroppedDiv")
                            .classList.contains("invisible")
                    );
                    chai.assert.isTrue(
                        document
                            .getElementById("xAxisSamplesDroppedDiv")
                            .classList.contains("invisible")
                    );
                    chai.assert.isTrue(
                        document
                            .getElementById("colorSamplesDroppedDiv")
                            .classList.contains("invisible")
                    );
                });
            });
            describe("Multi-feature selections", function() {
                before(async function() {
                    await resetRRVDisplay(rrv);
                    document.getElementById("topSearch").value = "Feature ID";
                    document.getElementById("botSearch").value =
                        "FeatureMetadata1";
                    document.getElementById("topSearchType").value = "text";
                    document.getElementById("botSearchType").value = "text";
                    document.getElementById("topText").value = "Taxon";
                    document.getElementById("botText").value = "Yeet";
                    // This should just result in rrv.updateSamplePlotMulti()
                    // being called. The added benefit is that this also tests
                    // that the onclick event of the multiFeatureButton was set
                    // properly :)
                    await document.getElementById("multiFeatureButton").click();
                });
                it("Properly updates topFeatures and botFeatures", function() {
                    chai.assert.sameMembers(
                        ["Taxon1", "Taxon2", "Taxon3", "Taxon4", "Taxon5"],
                        testing_utilities.getFeatureIDsFromObjectArray(
                            rrv.topFeatures
                        )
                    );
                    chai.assert.sameMembers(
                        ["Taxon3"],
                        testing_utilities.getFeatureIDsFromObjectArray(
                            rrv.botFeatures
                        )
                    );
                });
                // TODO: We will probably need to change changeSamplePlot() to
                // be an async function that updates the rank and sample plot
                // with runAsync() instead of run(), and awaits that result.
                // Then we can make updateSamplePlotMulti async (and have it
                // await changeSamplePlot()), and then await
                // updateSamplePlotMulti's result here. Yay!
                it("Properly updates the rank plot and sample plot Vega Views");
                it('Properly updates the "feature text" headers', function() {
                    testing_utilities.checkHeaders(5, 1);
                    chai.assert.sameMembers(
                        [
                            "Taxon1 / / ",
                            "Taxon2 / / ",
                            "Taxon3 / Yeet / 100",
                            "Taxon4 / / ",
                            "Taxon5 / null / lol"
                        ],
                        document
                            .getElementById("topFeaturesDisplay")
                            .value.split("\n")
                    );
                    chai.assert.equal(
                        "Taxon3 / Yeet / 100",
                        document.getElementById("botFeaturesDisplay").value
                    );
                });
            });
        });
        describe("Modifying plot scales/axes", function() {
            beforeEach(async function() {
                await resetRRVDisplay(rrv);
            });
            describe("Changing the rank used on the rank plot", function() {
                it("Works properly");
            });
            describe("Changing the x-axis field used on the sample plot", function() {
                var xFieldEle = document.getElementById("xAxisField");
                it("Works properly in the basic case (no boxplots involved)", async function() {
                    xFieldEle.value = "Metadata2";
                    // Kind of a lazy solution, but we assume that .onchange()
                    // works well enough: this is derived from
                    // https://stackoverflow.com/a/2856602/10730311
                    await xFieldEle.onchange();

                    chai.assert.equal(
                        "Metadata2",
                        rrv.samplePlotJSON.encoding.x.field
                    );
                    // Color field shouldn't change (since we're not messing
                    // with boxplots yet)
                    chai.assert.equal(
                        "Metadata1",
                        rrv.samplePlotJSON.encoding.color.field
                    );
                });
                it('Also updates color field when in "boxplot" mode', async function() {
                    // There's obviously more stuff we could test here re:
                    // details of the boxplot functionality, but that's for
                    // another test.
                    await document.getElementById("boxplotCheckbox").click();
                    xFieldEle.value = "Metadata2";
                    await xFieldEle.onchange();
                    chai.assert.equal(
                        "Metadata2",
                        rrv.samplePlotJSON.encoding.x.field
                    );
                    chai.assert.equal(
                        "Metadata2",
                        rrv.samplePlotJSON.encoding.color.field
                    );
                });
            });
            describe("Changing the x-axis scale type used on the sample plot", function() {
                // TODO test filters, tooltips, etc.
                var xScaleEle = document.getElementById("xAxisScale");
                async function testCategoricalToQuantitative() {
                    xScaleEle.value = "quantitative";
                    await xScaleEle.onchange();
                    chai.assert.equal(
                        "quantitative",
                        rrv.samplePlotJSON.encoding.x.type
                    );
                    chai.assert.notExists(rrv.samplePlotJSON.encoding.x.axis);
                }
                it(
                    "Works properly for basic case of (non-boxplot) categorical -> quantitative",
                    testCategoricalToQuantitative
                );
                it("Works properly for basic case of quantitative -> (non-boxplot) categorical", async function() {
                    await testCategoricalToQuantitative();
                    xScaleEle.value = "nominal";
                    await xScaleEle.onchange();
                    chai.assert.equal(
                        "nominal",
                        rrv.samplePlotJSON.encoding.x.type
                    );
                    chai.assert.exists(rrv.samplePlotJSON.encoding.x.axis);
                    chai.assert.isObject(rrv.samplePlotJSON.encoding.x.axis);
                    chai.assert.equal(
                        -45,
                        rrv.samplePlotJSON.encoding.x.axis.labelAngle
                    );
                });
                it(
                    "Works properly for case of (boxplot) categorical -> quantitative"
                );
                it(
                    "Works properly for case of quantitative -> (boxplot) categorical"
                );
            });
            describe("Changing the color used on the sample plot", function() {
                it("Works properly");
            });
            describe("Changing the color scale type used on the sample plot", function() {
                it("Works properly");
            });
        });
    });
    describe("The RRVDisplay destructor (destroy())", function() {
        // TODO: add tests that leaving certain args as false still lets
        // destroy() work partially
        var rrv;
        beforeEach(async function() {
            rrv = getNewRRVDisplay();
            await rrv.makePlots();
            await rrv.destroy(true, true, true);
        });
        it("Properly clears DOM element bindings", async function() {
            for (var i = 0; i < rrv.elementsWithOnClickBindings.length; i++) {
                chai.assert.isNull(
                    document.getElementById(rrv.elementsWithOnClickBindings[i])
                        .onclick
                );
            }
            for (var j = 0; j < rrv.elementsWithOnChangeBindings.length; j++) {
                chai.assert.isNull(
                    document.getElementById(rrv.elementsWithOnChangeBindings[j])
                        .onchange
                );
            }
        });
        it("Properly clears the #rankPlot and #samplePlot divs", async function() {
            chai.assert.isEmpty(document.getElementById("rankPlot").innerHTML);
            chai.assert.isEmpty(
                document.getElementById("samplePlot").innerHTML
            );
        });
        it("Properly clears the ranking/metadata field <select>s", async function() {
            chai.assert.isEmpty(document.getElementById("rankField").innerHTML);
            chai.assert.isEmpty(document.getElementById("topSearch").innerHTML);
            chai.assert.isEmpty(document.getElementById("botSearch").innerHTML);
            chai.assert.isEmpty(
                document.getElementById("xAxisField").innerHTML
            );
            chai.assert.isEmpty(
                document.getElementById("colorField").innerHTML
            );
        });
        it("Properly resets other UI elements to their defaults", async function() {
            await document.getElementById("boxplotCheckbox").click();
            document.getElementById("topSearchType").value = "rank";
            document.getElementById("botSearchType").value = "rank";
            document.getElementById("topText").value = "Test top search text";
            document.getElementById("botText").value =
                "Test bottom search text";
            // TODO: actually call the callback functions (e.g.
            // updateSamplePlotScale()) to change these? I don't want to do
            // that just yet b/c it will completely mess with JS code coverage,
            // but eventually that'd be a good idea.
            document.getElementById("xAxisScale").value = "quantitative";
            document.getElementById("colorScale").value = "quantitative";
            document.getElementById("barSize").value = "3";
            await rrv.destroy(true, true, true);

            chai.assert.isFalse(
                document.getElementById("boxplotCheckbox").checked
            );
            chai.assert.equal(
                "text",
                document.getElementById("topSearchType").value
            );
            chai.assert.equal(
                "text",
                document.getElementById("botSearchType").value
            );
            chai.assert.isEmpty(document.getElementById("topText").value);
            chai.assert.isEmpty(document.getElementById("botText").value);
            chai.assert.equal(
                "nominal",
                document.getElementById("xAxisScale").value
            );
            chai.assert.equal(
                "nominal",
                document.getElementById("colorScale").value
            );
            chai.assert.equal("1", document.getElementById("barSize").value);
        });
    });
});
