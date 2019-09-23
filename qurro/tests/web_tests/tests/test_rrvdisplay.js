define(["display", "mocha", "chai", "testing_utilities", "dom_utils"], function(
    display,
    mocha,
    chai,
    testing_utilities,
    dom_utils
) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"gridColor": "#f2f2f2", "labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-f6e0ffb88129e70d1b63bcb147a9fa3c"}, "datasets": {"data-f6e0ffb88129e70d1b63bcb147a9fa3c": [{"Feature ID": "Taxon1", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0, "qurro_classification": "None", "qurro_spc": 5.0}, {"Feature ID": "Taxon2", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0, "qurro_classification": "None", "qurro_spc": 5.0}, {"Feature ID": "Taxon3", "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0, "qurro_classification": "None", "qurro_spc": 6.0}, {"Feature ID": "Taxon4", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0, "qurro_classification": "None", "qurro_spc": 6.0}, {"Feature ID": "Taxon5", "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0, "qurro_classification": "None", "qurro_spc": 2.0}], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2"], "qurro_rank_type": "Differential"}, "encoding": {"color": {"field": "qurro_classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}, "title": "Log-Ratio Classification", "type": "nominal"}, "tooltip": [{"field": "qurro_x", "title": "Current Ranking", "type": "quantitative"}, {"field": "qurro_classification", "title": "Log-Ratio Classification", "type": "nominal"}, {"field": "qurro_spc", "title": "Sample Presence Count", "type": "quantitative"}, {"field": "Feature ID", "type": "nominal"}, {"field": "FeatureMetadata1", "type": "nominal"}, {"field": "FeatureMetadata2", "type": "nominal"}, {"field": "Intercept", "type": "quantitative"}, {"field": "Rank 1", "type": "quantitative"}, {"field": "Rank 2", "type": "quantitative"}], "x": {"axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Feature Rankings", "type": "ordinal"}, "y": {"field": "Intercept", "type": "quantitative"}}, "mark": "bar", "selection": {"selector005": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Features", "transform": [{"sort": [{"field": "Intercept", "order": "ascending"}], "window": [{"as": "qurro_x", "op": "row_number"}]}]};
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "range": {"category": {"scheme": "tableau10"}, "ramp": {"scheme": "blues"}}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-17ad6d7eb8d11fdb67d65d9f4abd5654"}, "datasets": {"data-17ad6d7eb8d11fdb67d65d9f4abd5654": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}], "qurro_sample_metadata_fields": ["Metadata1", "Metadata2", "Metadata3", "Sample ID"]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "scale": {"zero": false}, "type": "nominal"}, "y": {"field": "qurro_balance", "scale": {"zero": false}, "title": "Current Natural Log-Ratio", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector006": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Samples"};
    // prettier-ignore
    var countJSON = {"Taxon1": {"Sample2": 1.0, "Sample3": 2.0, "Sample5": 4.0, "Sample6": 5.0, "Sample7": 6.0}, "Taxon2": {"Sample1": 6.0, "Sample2": 5.0, "Sample3": 4.0, "Sample5": 2.0, "Sample6": 1.0}, "Taxon3": {"Sample1": 2.0, "Sample2": 3.0, "Sample3": 4.0, "Sample5": 4.0, "Sample6": 3.0, "Sample7": 2.0}, "Taxon4": {"Sample1": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample5": 1.0, "Sample6": 1.0, "Sample7": 1.0}, "Taxon5": {"Sample3": 1.0, "Sample5": 2.0}};

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
            await rrv.destroy(true, true, true);
            rrv = getNewRRVDisplay();
            await rrv.makePlots();
        }
        async function testXAxisCategoricalToQuantitative() {
            var xScaleEle = document.getElementById("xAxisScale");
            xScaleEle.value = "quantitative";
            await xScaleEle.onchange();
            chai.assert.equal(
                "quantitative",
                rrv.samplePlotJSON.encoding.x.type
            );
            chai.assert.notExists(rrv.samplePlotJSON.encoding.x.axis);
        }
        before(async function() {
            rrv = getNewRRVDisplay();
            dataName = rrv.samplePlotJSON.data.name;
            await rrv.makePlots();
        });
        after(async function() {
            await rrv.destroy(true, true, true);
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

            // Check that the qurro_rank_type has been properly integrated into
            // the interface
            chai.assert.equal(
                "Differential",
                document.getElementById("rankFieldLabel").textContent
            );
        });

        it("RRVDisplay.validateSampleID() identifies nonexistent sample IDs", function() {
            chai.assert.doesNotThrow(function() {
                rrv.validateSampleID("Sample2");
            });
            chai.assert.throws(function() {
                rrv.validateSampleID("SuperFakeSampleName");
            });
        });

        describe("Selecting features to update the plots", function() {
            /* Resets an RRVDisplay object so we're working with a blank slate
             * before test(s).
             */
            async function updateSingleAndCheckAllBalancesNull() {
                await rrv.regenerateFromClicking();
                var data = rrv.samplePlotView.data(dataName);
                for (var i = 0; i < data.length; i++) {
                    chai.assert.isNull(data[i].qurro_balance);
                }
                testing_utilities.checkHeaders(0, 0, 5);
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
                    await rrv.regenerateFromClicking();
                    // Check that the sample log-ratios were properly updated
                    // Sample1 has a Taxon1 count of 0, so its log-ratio should
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
                    testing_utilities.checkHeaders(1, 1, 5);
                    chai.assert.equal(
                        "2 / 6 samples (33.33%) can't be shown due to having an invalid (i.e. containing zero) log-ratio.",
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
            describe("Multi-feature selections (basic case)", function() {
                before(async function() {
                    await resetRRVDisplay(rrv);
                    document.getElementById("topSearch").value = "Feature ID";
                    document.getElementById("botSearch").value =
                        "FeatureMetadata1";
                    document.getElementById("topSearchType").value = "text";
                    document.getElementById("botSearchType").value = "text";
                    document.getElementById("topText").value = "Taxon";
                    document.getElementById("botText").value = "Yeet";
                    // This should just result in rrv.regenerateFromFiltering()
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
                // Then we can make regenerateFromFiltering async (and have it
                // await changeSamplePlot()), and then await
                // regenerateFromFiltering's result here. Yay!
                it("Properly updates the sample plot balances");
                it("Properly updates the rank plot classifications");
                it('Properly updates the "feature text" headers', function() {
                    testing_utilities.checkHeaders(5, 1, 5);
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
            describe("Multi-feature selections (corner cases)", function() {
                describe("Empty search fields provided", function() {
                    it("Clears feature classifications and sample balances");
                });
            });
        });
        describe("Modifying rank plot field/size/color", function() {
            beforeEach(async function() {
                await resetRRVDisplay(rrv);
            });
            describe("Changing the ranking used on the rank plot", function() {
                it("Updates rank plot field, title, and window sort transform", async function() {
                    document.getElementById("rankField").value = "Rank 1";
                    await document.getElementById("rankField").onchange();
                    // Check that the rank plot JSON was updated accordingly:
                    // 1. y-axis field updated
                    // 2. y-axis title updated to say
                    //    "Differential: [rank name]"
                    //    (the "Differential" text comes from the
                    //    qurro_rank_type "dataset" in the rank plot JSON)
                    // 3. The lone transform of the rank plot JSON should now
                    //    sort by the new rank field
                    chai.assert.equal(
                        "Rank 1",
                        rrv.rankPlotJSON.encoding.y.field
                    );
                    chai.assert.equal(
                        "Differential: Rank 1",
                        rrv.rankPlotJSON.encoding.y.title
                    );
                    // Sanity check -- verify there's only one transform, and
                    // it has just one sort property
                    chai.assert.equal(1, rrv.rankPlotJSON.transform.length);
                    chai.assert.equal(
                        1,
                        rrv.rankPlotJSON.transform.sort.length
                    );
                    chai.assert.equal(
                        "Rank 1",
                        rrv.rankPlotJSON.transform[0].sort[0].field
                    );
                });
            });
            describe("Changing the bar width", function() {
                async function triggerBarSizeUpdate(newValue) {
                    document.getElementById("barSizeSlider").value = newValue;
                    await document.getElementById("barSizeSlider").onchange();
                }
                it("Changing the bar width to a constant size updates JSON and DOM properly", async function() {
                    await triggerBarSizeUpdate("3");
                    chai.assert.equal(
                        3,
                        rrv.rankPlotJSON.encoding.x.scale.rangeStep
                    );
                    chai.assert.isTrue(
                        document
                            .getElementById("barSizeWarning")
                            .classList.contains("invisible")
                    );
                });
                describe("Changing the bar width to fit to the rank plot width", function() {
                    it("Works properly in basic case", async function() {
                        // Set bar size to 3 using the slider
                        await triggerBarSizeUpdate("3");
                        chai.assert.equal(
                            3,
                            rrv.rankPlotJSON.encoding.x.scale.rangeStep
                        );
                        // "Fit" the bars
                        // NOTE: for some reason, this doesn't work if I just
                        // say "await document.getElementById(...).click();",
                        // like I'm doing with the boxplot checkbox. No idea
                        // why.
                        document.getElementById(
                            "fitBarSizeCheckbox"
                        ).checked = true;
                        await document
                            .getElementById("fitBarSizeCheckbox")
                            .onchange();
                        // We have 5 features in this test rank plot JSON, and
                        // the rank plot width is set to 400. 400 / 5 = 80.
                        chai.assert.equal(
                            80,
                            rrv.rankPlotJSON.encoding.x.scale.rangeStep
                        );
                        chai.assert.isTrue(
                            document
                                .getElementById("barSizeWarning")
                                .classList.contains("invisible")
                        );
                        chai.assert.isTrue(
                            document.getElementById("barSizeSlider").disabled
                        );
                        // Stop "fitting" the bars. This should cause the bar
                        // size to go back to 3, and re-enable the slider.
                        document.getElementById(
                            "fitBarSizeCheckbox"
                        ).checked = false;
                        await document
                            .getElementById("fitBarSizeCheckbox")
                            .onchange();
                        chai.assert.equal(
                            3,
                            rrv.rankPlotJSON.encoding.x.scale.rangeStep
                        );
                        chai.assert.isFalse(
                            document.getElementById("barSizeSlider").disabled
                        );
                        // this definitely shouldn't change in either case, but
                        // i'm checking the barSizeWarning here just to be safe
                        chai.assert.isTrue(
                            document
                                .getElementById("barSizeWarning")
                                .classList.contains("invisible")
                        );
                    });
                    it("Un-hides a warning element when the bar size is less than 1 pixel", async function() {
                        function isInvisible() {
                            // Silly helper function to reduce repetitive code
                            return document
                                .getElementById("barSizeWarning")
                                .classList.contains("invisible");
                        }
                        chai.assert.isTrue(isInvisible());

                        await rrv.updateRankPlotBarSize(0.8, true);
                        chai.assert.isFalse(isInvisible());

                        // Clean up and hide the warning again -- this also
                        // tests that it's removable
                        await rrv.updateRankPlotBarSize(10, true);
                        chai.assert.isTrue(isInvisible());
                    });
                });
            });
            describe("Changing the rank plot color scheme", function() {
                it("Updating works properly", async function() {
                    document.getElementById("rankPlotColorScheme").value =
                        "#5fa2c8,#daa520,#029e73";
                    await document
                        .getElementById("rankPlotColorScheme")
                        .onchange();
                    chai.assert.equal(
                        "#5fa2c8",
                        rrv.rankPlotJSON.encoding.color.scale.range[1]
                    );
                    chai.assert.equal(
                        "#daa520",
                        rrv.rankPlotJSON.encoding.color.scale.range[2]
                    );
                    chai.assert.equal(
                        "#029e73",
                        rrv.rankPlotJSON.encoding.color.scale.range[3]
                    );
                    // Check to make sure the background color wasn't changed
                    chai.assert.equal(
                        "#e0e0e0",
                        rrv.rankPlotJSON.encoding.color.scale.range[0]
                    );
                });
            });
        });
        describe("Modifying sample plot fields/scales/colorschemes", function() {
            beforeEach(async function() {
                await resetRRVDisplay(rrv);
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
                it(
                    "Works properly for basic case of (non-boxplot) categorical -> quantitative",
                    testXAxisCategoricalToQuantitative
                );
                it("Works properly for basic case of quantitative -> (non-boxplot) categorical", async function() {
                    await testXAxisCategoricalToQuantitative();
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
            });
            describe("Changing the color used on the sample plot", function() {
                var colorFieldEle = document.getElementById("colorField");
                async function testColorFieldChange(field) {
                    colorFieldEle.value = field;
                    await colorFieldEle.onchange();
                    chai.assert.equal(
                        field,
                        rrv.samplePlotJSON.encoding.color.field
                    );
                    chai.assert.exists(rrv.samplePlotJSON.transform[0].filter);
                    chai.assert.isTrue(
                        rrv.samplePlotJSON.transform[0].filter.includes(
                            'datum["' + field + '"] != null'
                        )
                    );
                }
                it("Works properly: changes color and updates filter accordingly", async function() {
                    await testColorFieldChange("Metadata3");
                    await testColorFieldChange("Metadata2");
                    // Check that changing the color field overwrites old
                    // changes (since now Metadata3 isn't used for the x-axis
                    // or color encodings)
                    chai.assert.isFalse(
                        rrv.samplePlotJSON.transform[0].filter.includes(
                            'datum["Metadata3"] != null'
                        )
                    );
                });
            });
            describe("Changing the color scale type used on the sample plot", function() {
                var colorScaleEle = document.getElementById("colorScale");

                // Analogous to testXAxisCategoricalToQuantitative() above for the
                // x-axis scale stuff. Possible TODO: merge this function with
                // that? (Might be more trouble than it's worth, though.)
                async function testChangeScaleType(newScaleType) {
                    colorScaleEle.value = newScaleType;
                    await colorScaleEle.onchange();
                    chai.assert.equal(
                        newScaleType,
                        rrv.samplePlotJSON.encoding.color.type
                    );
                    // Assert that both the filter-nulls and
                    // filter-invalid-numbers filters are in use
                    var datumField = 'datum["Metadata1"]';
                    chai.assert.isTrue(
                        rrv.samplePlotJSON.transform[0].filter.includes(
                            datumField + " != null"
                        )
                    );
                    var hasQuantFilter = rrv.samplePlotJSON.transform[0].filter.includes(
                        "isFinite(toNumber(" + datumField + "))"
                    );
                    if (newScaleType === "quantitative") {
                        chai.assert.isTrue(hasQuantFilter);
                    } else {
                        // NOTE: this assumes that at least either 1) the
                        // x-axis scale isn't set to quantitative or 2)
                        // the x-axis field isn't set to Metadata1.
                        // This is a safe assumption to make for these
                        // basic tests but not for normal usage of Qurro.
                        chai.assert.isFalse(hasQuantFilter);
                    }
                }
                // TODO test filters/TOOLTIPS updated properly
                it("Works properly for categorical -> quantitative", async function() {
                    await testChangeScaleType("quantitative");
                });
                it("Works properly for quantitative -> categorical", async function() {
                    await testChangeScaleType("quantitative");
                    await testChangeScaleType("nominal");
                });
            });
            describe("Changing the sample plot color schemes", function() {
                it("Changing the categorical color scheme works properly", async function() {
                    document.getElementById("catColorScheme").value = "accent";
                    await document.getElementById("catColorScheme").onchange();
                    chai.assert.equal(
                        "accent",
                        rrv.samplePlotJSON.config.range.category.scheme
                    );
                });
                it("Changing the quantitative color scheme works properly", async function() {
                    document.getElementById("quantColorScheme").value =
                        "viridis";
                    await document
                        .getElementById("quantColorScheme")
                        .onchange();
                    chai.assert.equal(
                        "viridis",
                        rrv.samplePlotJSON.config.range.ramp.scheme
                    );
                });
                it(
                    "updateSamplePlotColorScheme() throws an error for unrecognized scale range types"
                );
            });
        });
        describe("Boxplot functionality", function() {
            beforeEach(async function() {
                await resetRRVDisplay(rrv);
            });
            function testBoxplotEncodings(xField) {
                chai.assert.equal("boxplot", rrv.samplePlotJSON.mark.type);
                chai.assert.exists(rrv.samplePlotJSON.mark.median);
                chai.assert.equal(
                    "#000000",
                    rrv.samplePlotJSON.mark.median.color
                );
                // Also, the color field encoding should match the x-axis
                // field encoding and be nominal
                chai.assert.equal(xField, rrv.samplePlotJSON.encoding.x.field);
                chai.assert.equal(
                    xField,
                    rrv.samplePlotJSON.encoding.color.field
                );
                chai.assert.equal(
                    "nominal",
                    rrv.samplePlotJSON.encoding.color.type
                );
            }
            async function testSwitchToBoxplot(currXField) {
                await document.getElementById("boxplotCheckbox").click();
                var xScaleEle = document.getElementById("xAxisScale");
                xScaleEle.value = "nominal";
                await xScaleEle.onchange();
                // Now the sample plot should be a boxplot
                testBoxplotEncodings(currXField);
                // In "boxplot mode", the color controls should be disabled
                testing_utilities.assertEnabled("colorField", false);
                testing_utilities.assertEnabled("colorScale", false);
            }
            describe("Changing to a boxplot...", function() {
                it("...By checking the boxplot checkbox", async function() {
                    await testSwitchToBoxplot("Metadata1");
                });
                it("...By changing the x-axis scale type to categorical", async function() {
                    // change the x-axis scale from categorical to
                    // quantitative. Then check the boxplot checkbox (which
                    // won't change anything yet, since the x-axis scale is
                    // quantitative). Now, when we change the x-axis back to a
                    // categorical scale, we should be in boxplot mode.
                    await testXAxisCategoricalToQuantitative();
                    await testSwitchToBoxplot("Metadata1");
                    // Test that changing the x-axis field also updates the
                    // color field
                    document.getElementById("xAxisField").value = "Sample ID";
                    await document.getElementById("xAxisField").onchange();
                    testBoxplotEncodings("Sample ID");
                });
            });
            describe("Changing from a boxplot...", function() {
                async function testSamplePlotStateAfterBoxplot(
                    currXField,
                    currXScaleType,
                    newXField
                ) {
                    chai.assert.equal("circle", rrv.samplePlotJSON.mark.type);
                    chai.assert.notExists(rrv.samplePlotJSON.mark.median);
                    testing_utilities.assertEnabled("colorField", true);
                    testing_utilities.assertEnabled("colorScale", true);
                    // Fields should stay the same, and scales should stay
                    // categorical
                    chai.assert.equal(
                        currXField,
                        rrv.samplePlotJSON.encoding.x.field
                    );
                    chai.assert.equal(
                        currXField,
                        rrv.samplePlotJSON.encoding.color.field
                    );
                    chai.assert.equal(
                        currXScaleType,
                        rrv.samplePlotJSON.encoding.x.type
                    );
                    chai.assert.equal(
                        "nominal",
                        rrv.samplePlotJSON.encoding.color.type
                    );
                    // Now, changing the x-axis field shouldn't update the
                    // color field. Verify this.
                    document.getElementById("xAxisField").value = newXField;
                    await document.getElementById("xAxisField").onchange();
                    chai.assert.equal(
                        newXField,
                        rrv.samplePlotJSON.encoding.x.field
                    );
                    chai.assert.equal(
                        currXField,
                        rrv.samplePlotJSON.encoding.color.field
                    );
                    // Of course, scales should stay the same
                    chai.assert.equal(
                        currXScaleType,
                        rrv.samplePlotJSON.encoding.x.type
                    );
                    chai.assert.equal(
                        "nominal",
                        rrv.samplePlotJSON.encoding.color.type
                    );
                }
                it("...By unchecking the boxplot checkbox", async function() {
                    await testSwitchToBoxplot("Metadata1");
                    await document.getElementById("boxplotCheckbox").click();
                    await testSamplePlotStateAfterBoxplot(
                        "Metadata1",
                        "nominal",
                        "Sample ID"
                    );
                });
                it("...By changing the x-axis scale type to quantitative", async function() {
                    await testSwitchToBoxplot("Metadata1");
                    document.getElementById("xAxisScale").value =
                        "quantitative";
                    await document.getElementById("xAxisScale").onchange();
                    await testSamplePlotStateAfterBoxplot(
                        "Metadata1",
                        "quantitative",
                        "Sample ID"
                    );
                });
            });
        });
    });
});
