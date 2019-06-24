define(["display", "dom_utils", "mocha", "chai"], function(
    display,
    dom_utils,
    mocha,
    chai
) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"gridColor": "#f2f2f2", "labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-7416c68b284d7fabf6066e786fa2c0aa"}, "datasets": {"data-7416c68b284d7fabf6066e786fa2c0aa": [{"Classification": "None", "Feature ID": "Taxon1", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0}, {"Classification": "None", "Feature ID": "Taxon2", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0}, {"Classification": "None", "Feature ID": "Taxon3", "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0}, {"Classification": "None", "Feature ID": "Taxon4", "FeatureMetadata1": null, "FeatureMetadata2": null, "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0}, {"Classification": "None", "Feature ID": "Taxon5", "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0}], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2"]}, "encoding": {"color": {"field": "Classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}, "type": "nominal"}, "tooltip": [{"field": "qurro_x", "title": "Current Ranking", "type": "quantitative"}, {"field": "Classification", "type": "nominal"}, {"field": "Feature ID", "type": "nominal"}, {"field": "FeatureMetadata1", "type": "nominal"}, {"field": "FeatureMetadata2", "type": "nominal"}], "x": {"axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Sorted Features", "type": "ordinal"}, "y": {"field": "Intercept", "type": "quantitative"}}, "mark": "bar", "selection": {"selector019": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Feature Ranks", "transform": [{"sort": [{"field": "Intercept", "order": "ascending"}], "window": [{"as": "qurro_x", "op": "row_number"}]}]};
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-17ad6d7eb8d11fdb67d65d9f4abd5654"}, "datasets": {"data-17ad6d7eb8d11fdb67d65d9f4abd5654": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "type": "nominal"}, "y": {"field": "qurro_balance", "title": "log(Numerator / Denominator)", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector020": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Log Ratio of Abundances in Samples"};
    // prettier-ignore
    var countJSON = {"Taxon4": {"Sample7": 1.0, "Sample1": 1.0, "Sample5": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample6": 1.0}, "Taxon2": {"Sample7": 0.0, "Sample1": 6.0, "Sample5": 2.0, "Sample2": 5.0, "Sample3": 4.0, "Sample6": 1.0}, "Taxon3": {"Sample7": 2.0, "Sample1": 2.0, "Sample5": 4.0, "Sample2": 3.0, "Sample3": 4.0, "Sample6": 3.0}, "Taxon5": {"Sample7": 0.0, "Sample1": 0.0, "Sample5": 2.0, "Sample2": 0.0, "Sample3": 1.0, "Sample6": 0.0}, "Taxon1": {"Sample7": 6.0, "Sample1": 0.0, "Sample5": 4.0, "Sample2": 1.0, "Sample3": 2.0, "Sample6": 5.0}};

    describe("The RRVDisplay destructor (destroy())", function() {
        var rrv;
        before(async function() {
            rrv = new display.RRVDisplay(
                rankPlotJSON,
                samplePlotJSON,
                countJSON
            );
            await rrv.makePlots();
            rrv.destroy(true, true, true);
        });

        // TODO: add tests that leaving certain args as false still lets
        // destroy() work partially?
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
            for (var i = 0; i < dom_utils.statDivs.length; i++) {
                document.getElementById(dom_utils.statDivs[i]).textContent =
                    "test lol";
                document
                    .getElementById(dom_utils.statDivs[i])
                    .classList.add("invisible");
            }
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

            for (var s = 0; s < dom_utils.statDivs.length; s++) {
                chai.assert.isEmpty(
                    document.getElementById(dom_utils.statDivs[s]).textContent
                );
                chai.assert.isTrue(
                    document
                        .getElementById(dom_utils.statDivs[s])
                        .classList.contains("invisible")
                );
            }
        });
    });
});
