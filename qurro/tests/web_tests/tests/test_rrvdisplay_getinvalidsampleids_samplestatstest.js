define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var SSTrankPlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"gridColor": "#f2f2f2", "labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-894cdc6bae3acd6c15990d236eade86a"}, "datasets": {"data-894cdc6bae3acd6c15990d236eade86a": [{"Feature ID": "Taxon1", "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0, "qurro_classification": "None"}, {"Feature ID": "Taxon2", "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0, "qurro_classification": "None"}, {"Feature ID": "Taxon3", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0, "qurro_classification": "None"}, {"Feature ID": "Taxon4", "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0, "qurro_classification": "None"}, {"Feature ID": "Taxon5", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0, "qurro_classification": "None"}], "qurro_feature_metadata_ordering": [], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2"]}, "encoding": {"color": {"field": "qurro_classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}, "title": "Log-Ratio Classification", "type": "nominal"}, "tooltip": [{"field": "qurro_x", "title": "Current Ranking", "type": "quantitative"}, {"field": "qurro_classification", "title": "Log-Ratio Classification", "type": "nominal"}, {"field": "Feature ID", "type": "nominal"}, {"field": "Intercept", "type": "quantitative"}, {"field": "Rank 1", "type": "quantitative"}, {"field": "Rank 2", "type": "quantitative"}], "x": {"axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Sorted Features", "type": "ordinal"}, "y": {"field": "Intercept", "type": "quantitative"}}, "mark": "bar", "selection": {"selector023": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Feature Ranks", "transform": [{"sort": [{"field": "Intercept", "order": "ascending"}], "window": [{"as": "qurro_x", "op": "row_number"}]}]};
    // prettier-ignore
    var SSTsamplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "range": {"category": {"scheme": "tableau10"}, "ramp": {"scheme": "blues"}}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-9c21cff52a57c81bf8460e80ed775623"}, "datasets": {"data-9c21cff52a57c81bf8460e80ed775623": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "NaN", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "Infinity", "Metadata2": "null", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": null, "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "'14'", "Metadata3": null, "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "Missing: not provided", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}], "qurro_sample_metadata_fields": ["Metadata1", "Metadata2", "Metadata3", "Sample ID"]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "type": "nominal"}, "y": {"field": "qurro_balance", "title": "log(Numerator / Denominator)", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector024": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Log-Ratio of Abundances in Samples"};
    // prettier-ignore
    var SSTcountJSON = {"Taxon1": {"Sample2": 1.0, "Sample3": 2.0, "Sample5": 4.0, "Sample6": 5.0, "Sample7": 6.0}, "Taxon2": {"Sample1": 6.0, "Sample2": 5.0, "Sample3": 4.0, "Sample5": 2.0, "Sample6": 1.0}, "Taxon3": {"Sample1": 2.0, "Sample2": 3.0, "Sample3": 4.0, "Sample5": 4.0, "Sample6": 3.0, "Sample7": 2.0}, "Taxon4": {"Sample1": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample5": 1.0, "Sample6": 1.0, "Sample7": 1.0}, "Taxon5": {"Sample3": 1.0, "Sample5": 2.0}};

    describe('Sample metadata values in JSON, "samples shown" statistics, and sample plot filtering', function() {
        var rrv, dataName;
        async function resetRRVDisplay() {
            rrv = new display.RRVDisplay(
                JSON.parse(JSON.stringify(SSTrankPlotJSON)),
                JSON.parse(JSON.stringify(SSTsamplePlotJSON)),
                JSON.parse(JSON.stringify(SSTcountJSON))
            );
            dataName = rrv.samplePlotJSON.data.name;
            await rrv.makePlots();
        }
        beforeEach(resetRRVDisplay);
        afterEach(async function() {
            await rrv.destroy(true, true, true);
        });
        it("Sample metadata values are passed from python to JSON to JS correctly", function() {
            var sampleArray = rrv.samplePlotJSON.datasets[dataName];
            chai.assert.equal(6, sampleArray.length);

            // Sample1
            chai.assert.equal("1", sampleArray[0].Metadata1);
            chai.assert.equal("2", sampleArray[0].Metadata2);
            chai.assert.equal("NaN", sampleArray[0].Metadata3);

            // Sample2
            chai.assert.equal("Infinity", sampleArray[1].Metadata1);
            chai.assert.equal("null", sampleArray[1].Metadata2);
            chai.assert.equal("6", sampleArray[1].Metadata3);

            // Sample3
            chai.assert.equal("7", sampleArray[2].Metadata1);
            chai.assert.equal("8", sampleArray[2].Metadata2);
            chai.assert.equal(null, sampleArray[2].Metadata3);

            // Sample5 (Sample4 was dropped)
            chai.assert.equal("13", sampleArray[3].Metadata1);
            chai.assert.equal("'14'", sampleArray[3].Metadata2);
            chai.assert.equal(null, sampleArray[3].Metadata3);

            // Sample6
            chai.assert.equal(
                "Missing: not provided",
                sampleArray[4].Metadata1
            );
            chai.assert.equal("17", sampleArray[4].Metadata2);
            chai.assert.equal("18", sampleArray[4].Metadata3);

            // Sample7
            chai.assert.equal("19", sampleArray[5].Metadata1);
            chai.assert.equal("20", sampleArray[5].Metadata2);
            chai.assert.equal("21", sampleArray[5].Metadata3);
        });
        describe("Sample plot filters are properly set", function() {
            /* Small helper function. encoding should be "xAxis" or "color",
             * and newValue should be whatever the new value you want to set
             * is.
             *
             * If isScale is truthy, this will change the "Scale" instead of
             * "Field" selector (and in this case newValue can be "nominal" or
             * "quantitative").
             */
            async function changeEncoding(encoding, newValue, isScale) {
                var fieldName;
                if (isScale) {
                    fieldName = encoding + "Scale";
                } else {
                    fieldName = encoding + "Field";
                }
                document.getElementById(fieldName).value = newValue;
                await document.getElementById(fieldName).onchange();
            }
            // NOTE: if we get around to removing the redundancy in the
            // filters generated when x-axis and color fields are equal,
            // these tests will need to be changed accordingly.
            it("When both x-axis and color are categorical", async function() {
                // Just once, test the "starting" filters
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata1"] != null && ' +
                        'datum["Metadata1"] != null',
                    rrv.samplePlotJSON.transform[0].filter
                );
                // No actual nulls in Metadata1, so we shouldn't drop any
                // samples.
                chai.assert.empty(rrv.getInvalidSampleIDs("Metadata1", "x"));
                chai.assert.empty(
                    rrv.getInvalidSampleIDs("Metadata1", "color")
                );

                // Try changing the color field to Metadata3, and verify that
                // the filters are updated accordingly
                await changeEncoding("color", "Metadata3");
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata1"] != null && ' +
                        'datum["Metadata3"] != null',
                    rrv.samplePlotJSON.transform[0].filter
                );
                // Metadata3 has an "empty" value for two samples (Sample3 and
                // Sample5), so these values get converted to a null in the
                // sample plot JSON. (Note that the "NaN" value in Metadata3
                // for Sample1 is just treated as a normal string, so we still
                // show it here.)
                chai.assert.empty(rrv.getInvalidSampleIDs("Metadata1", "x"));
                chai.assert.sameMembers(
                    ["Sample3", "Sample5"],
                    rrv.getInvalidSampleIDs("Metadata3", "color")
                );

                // Try changing the x-axis field to Sample ID, and verify that
                // the filters are again updated accordingly
                await changeEncoding("xAxis", "Sample ID");
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Sample ID"] != null && ' +
                        'datum["Metadata3"] != null',
                    rrv.samplePlotJSON.transform[0].filter
                );
                chai.assert.empty(rrv.getInvalidSampleIDs("Sample ID", "x"));
                chai.assert.sameMembers(
                    ["Sample3", "Sample5"],
                    rrv.getInvalidSampleIDs("Metadata3", "color")
                );
            });
            it("When x-axis is quantitative and color is categorical", async function() {
                await changeEncoding("xAxis", "quantitative", true);
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata1"] != null && ' +
                        'datum["Metadata1"] != null && ' +
                        'isFinite(toNumber(datum["Metadata1"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                chai.assert.sameMembers(
                    ["Sample2", "Sample6"],
                    rrv.getInvalidSampleIDs("Metadata1", "x")
                );
                chai.assert.empty(
                    rrv.getInvalidSampleIDs("Metadata1", "color")
                );

                // Change color field and verify filters updated accordingly
                await changeEncoding("color", "Metadata2");
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata1"] != null && ' +
                        'datum["Metadata2"] != null && ' +
                        'isFinite(toNumber(datum["Metadata1"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                chai.assert.sameMembers(
                    ["Sample2", "Sample6"],
                    rrv.getInvalidSampleIDs("Metadata1", "x")
                );
                chai.assert.empty(
                    rrv.getInvalidSampleIDs("Metadata2", "color")
                );

                // Change x-axis field and verify filters updated accordingly
                await changeEncoding("xAxis", "Sample ID");
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Sample ID"] != null && ' +
                        'datum["Metadata2"] != null && ' +
                        'isFinite(toNumber(datum["Sample ID"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                chai.assert.sameMembers(
                    [
                        "Sample1",
                        "Sample2",
                        "Sample3",
                        "Sample5",
                        "Sample6",
                        "Sample7"
                    ],
                    rrv.getInvalidSampleIDs("Sample ID", "x")
                );
                chai.assert.empty(
                    rrv.getInvalidSampleIDs("Metadata2", "color")
                );
            });
            it("When x-axis is categorical and color is quantitative", async function() {
                await changeEncoding("color", "quantitative", true);
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata1"] != null && ' +
                        'datum["Metadata1"] != null && ' +
                        'isFinite(toNumber(datum["Metadata1"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                chai.assert.empty(rrv.getInvalidSampleIDs("Metadata1", "x"));
                chai.assert.sameMembers(
                    ["Sample2", "Sample6"],
                    rrv.getInvalidSampleIDs("Metadata1", "color")
                );

                // Change x-axis field and verify filters updated accordingly
                await changeEncoding("xAxis", "Metadata2");
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata2"] != null && ' +
                        'datum["Metadata1"] != null && ' +
                        'isFinite(toNumber(datum["Metadata1"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                chai.assert.empty(rrv.getInvalidSampleIDs("Metadata2", "x"));
                chai.assert.sameMembers(
                    ["Sample2", "Sample6"],
                    rrv.getInvalidSampleIDs("Metadata1", "color")
                );

                // Change color field and verify filters updated accordingly
                await changeEncoding("color", "Sample ID");
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata2"] != null && ' +
                        'datum["Sample ID"] != null && ' +
                        'isFinite(toNumber(datum["Sample ID"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                chai.assert.empty(rrv.getInvalidSampleIDs("Metadata2", "x"));
                chai.assert.sameMembers(
                    [
                        "Sample1",
                        "Sample2",
                        "Sample3",
                        "Sample5",
                        "Sample6",
                        "Sample7"
                    ],
                    rrv.getInvalidSampleIDs("Sample ID", "color")
                );
            });
            it("When both x-axis and color are quantitative", async function() {
                await changeEncoding("color", "quantitative", true);
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata1"] != null && ' +
                        'datum["Metadata1"] != null && ' +
                        'isFinite(toNumber(datum["Metadata1"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                // "Infinity" and "Missing: not provided" should be filtered
                // out for quantitative scales but not categorical scales
                chai.assert.empty(rrv.getInvalidSampleIDs("Metadata1", "x"));
                chai.assert.sameMembers(
                    ["Sample2", "Sample6"],
                    rrv.getInvalidSampleIDs("Metadata1", "color")
                );

                await changeEncoding("xAxis", "quantitative", true);
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata1"] != null && ' +
                        'datum["Metadata1"] != null && ' +
                        'isFinite(toNumber(datum["Metadata1"])) && ' +
                        'isFinite(toNumber(datum["Metadata1"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                chai.assert.sameMembers(
                    ["Sample2", "Sample6"],
                    rrv.getInvalidSampleIDs("Metadata1", "x")
                );
                chai.assert.sameMembers(
                    ["Sample2", "Sample6"],
                    rrv.getInvalidSampleIDs("Metadata1", "color")
                );

                // Change color field and verify filters updated accordingly
                await changeEncoding("color", "Metadata3");
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata1"] != null && ' +
                        'datum["Metadata3"] != null && ' +
                        'isFinite(toNumber(datum["Metadata1"])) && ' +
                        'isFinite(toNumber(datum["Metadata3"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                chai.assert.sameMembers(
                    ["Sample2", "Sample6"],
                    rrv.getInvalidSampleIDs("Metadata1", "x")
                );
                // Now that we're looking at Metadata3 on a quantitative scale,
                // we exclude both the empty-input values (Sample3 and Sample5)
                // and the non-numeric values (Sample1).
                chai.assert.sameMembers(
                    ["Sample1", "Sample3", "Sample5"],
                    rrv.getInvalidSampleIDs("Metadata3", "color")
                );

                // Change x-axis field and verify filters updated accordingly
                await changeEncoding("xAxis", "Metadata2");
                chai.assert.equal(
                    "datum.qurro_balance != null && " +
                        'datum["Metadata2"] != null && ' +
                        'datum["Metadata3"] != null && ' +
                        'isFinite(toNumber(datum["Metadata2"])) && ' +
                        'isFinite(toNumber(datum["Metadata3"]))',
                    rrv.samplePlotJSON.transform[0].filter
                );
                // "null" and "'14'" should be filtered out for quant. scales
                chai.assert.sameMembers(
                    ["Sample2", "Sample5"],
                    rrv.getInvalidSampleIDs("Metadata2", "x")
                );
                chai.assert.sameMembers(
                    ["Sample1", "Sample3", "Sample5"],
                    rrv.getInvalidSampleIDs("Metadata3", "color")
                );
            });
        });
    });
});
