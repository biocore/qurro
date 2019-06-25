define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"gridColor": "#f2f2f2", "labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-7416c68b284d7fabf6066e786fa2c0aa"}, "datasets": {"data-7416c68b284d7fabf6066e786fa2c0aa": [{"Classification": "None", "Feature ID": "Taxon1", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0}, {"Classification": "None", "Feature ID": "Taxon2", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0}, {"Classification": "None", "Feature ID": "Taxon3", "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0}, {"Classification": "None", "Feature ID": "Taxon4", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0}, {"Classification": "None", "Feature ID": "Taxon5", "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0}], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2"]}, "encoding": {"color": {"field": "Classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}, "type": "nominal"}, "tooltip": [{"field": "qurro_x", "title": "Current Ranking", "type": "quantitative"}, {"field": "Classification", "type": "nominal"}, {"field": "Feature ID", "type": "nominal"}, {"field": "FeatureMetadata1", "type": "nominal"}, {"field": "FeatureMetadata2", "type": "nominal"}], "x": {"axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Sorted Features", "type": "ordinal"}, "y": {"field": "Intercept", "type": "quantitative"}}, "mark": "bar", "selection": {"selector019": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Feature Ranks", "transform": [{"sort": [{"field": "Intercept", "order": "ascending"}], "window": [{"as": "qurro_x", "op": "row_number"}]}]};
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-17ad6d7eb8d11fdb67d65d9f4abd5654"}, "datasets": {"data-17ad6d7eb8d11fdb67d65d9f4abd5654": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "type": "nominal"}, "y": {"field": "qurro_balance", "title": "log(Numerator / Denominator)", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector020": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Log Ratio of Abundances in Samples"};
    // prettier-ignore
    var countJSON = {"Taxon4": {"Sample7": 1.0, "Sample1": 1.0, "Sample5": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample6": 1.0}, "Taxon2": {"Sample7": 0.0, "Sample1": 6.0, "Sample5": 2.0, "Sample2": 5.0, "Sample3": 4.0, "Sample6": 1.0}, "Taxon3": {"Sample7": 2.0, "Sample1": 2.0, "Sample5": 4.0, "Sample2": 3.0, "Sample3": 4.0, "Sample6": 3.0}, "Taxon5": {"Sample7": 0.0, "Sample1": 0.0, "Sample5": 2.0, "Sample2": 0.0, "Sample3": 1.0, "Sample6": 0.0}, "Taxon1": {"Sample7": 6.0, "Sample1": 0.0, "Sample5": 4.0, "Sample2": 1.0, "Sample3": 2.0, "Sample6": 5.0}};

    describe("Computing sample log ratios of selected features in an RRVDisplay object", function() {
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
                        [{ "Feature ID": "Taxon2" }, { "Feature ID": "Taxon4" }]
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
                        [{ "Feature ID": "Taxon2" }, { "Feature ID": "Taxon3" }]
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
});