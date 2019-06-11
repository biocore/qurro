define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var rankPlotJSON = {"config": {"view": {"width": 400, "height": 300}, "mark": {"tooltip": null}, "axis": {"gridColor": "#f2f2f2", "labelBound": true}}, "data": {"name": "data-7416c68b284d7fabf6066e786fa2c0aa"}, "mark": "bar", "autosize": {"resize": true}, "background": "#FFFFFF", "encoding": {"color": {"type": "nominal", "field": "Classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}}, "tooltip": [{"type": "quantitative", "field": "qurro_x", "title": "Current Ranking"}, {"type": "nominal", "field": "Classification"}, {"type": "nominal", "field": "Feature ID"}, {"type": "nominal", "field": "FeatureMetadata1"}, {"type": "nominal", "field": "FeatureMetadata2"}], "x": {"type": "ordinal", "axis": {"labelAngle": 0, "ticks": false}, "field": "qurro_x", "scale": {"paddingInner": 0, "paddingOuter": 1, "rangeStep": 1}, "title": "Sorted Features"}, "y": {"type": "quantitative", "field": "Intercept"}}, "selection": {"selector015": {"type": "interval", "bind": "scales", "encodings": ["x", "y"]}}, "title": "Feature Ranks", "transform": [{"window": [{"op": "row_number", "as": "qurro_x"}], "sort": [{"field": "Intercept", "order": "ascending"}]}], "$schema": "https://vega.github.io/schema/vega-lite/v3.2.1.json", "datasets": {"data-7416c68b284d7fabf6066e786fa2c0aa": [{"Feature ID": "Taxon1", "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0, "FeatureMetadata1": null, "FeatureMetadata2": null, "Classification": "None"}, {"Feature ID": "Taxon2", "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0, "FeatureMetadata1": null, "FeatureMetadata2": null, "Classification": "None"}, {"Feature ID": "Taxon3", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0, "FeatureMetadata1": "Yeet", "FeatureMetadata2": "100", "Classification": "None"}, {"Feature ID": "Taxon4", "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0, "FeatureMetadata1": null, "FeatureMetadata2": null, "Classification": "None"}, {"Feature ID": "Taxon5", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0, "FeatureMetadata1": "null", "FeatureMetadata2": "lol", "Classification": "None"}], "qurro_rank_ordering": ["Intercept", "Rank 1", "Rank 2"], "qurro_feature_metadata_ordering": ["FeatureMetadata1", "FeatureMetadata2"]}};
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v3.2.1.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "mark": {"tooltip": null}, "view": {"height": 300, "width": 400}}, "data": {"name": "data-17ad6d7eb8d11fdb67d65d9f4abd5654"}, "datasets": {"data-17ad6d7eb8d11fdb67d65d9f4abd5654": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"field": "Metadata1", "type": "nominal"}, "y": {"field": "qurro_balance", "title": "log(Numerator / Denominator)", "type": "quantitative"}}, "mark": {"type": "circle"}, "selection": {"selector016": {"bind": "scales", "encodings": ["x", "y"], "type": "interval"}}, "title": "Log Ratio of Abundances in Samples"};
    // prettier-ignore
    var countJSON = {"Taxon4": {"Sample7": 1.0, "Sample1": 1.0, "Sample5": 1.0, "Sample2": 1.0, "Sample3": 1.0, "Sample6": 1.0}, "Taxon2": {"Sample7": 0.0, "Sample1": 6.0, "Sample5": 2.0, "Sample2": 5.0, "Sample3": 4.0, "Sample6": 1.0}, "Taxon3": {"Sample7": 2.0, "Sample1": 2.0, "Sample5": 4.0, "Sample2": 3.0, "Sample3": 4.0, "Sample6": 3.0}, "Taxon5": {"Sample7": 0.0, "Sample1": 0.0, "Sample5": 2.0, "Sample2": 0.0, "Sample3": 1.0, "Sample6": 0.0}, "Taxon1": {"Sample7": 6.0, "Sample1": 0.0, "Sample5": 4.0, "Sample2": 1.0, "Sample3": 2.0, "Sample6": 5.0}};
    var rrv = new display.RRVDisplay(rankPlotJSON, samplePlotJSON, countJSON);
    var dataName = rrv.samplePlotJSON.data.name;
    describe("Exporting sample plot data", function() {
        it('Returns "" when no sample points are "drawn"', function() {
            // set balances to null, mimicking the state of the JSON before any
            // features have been selected
            for (
                var i = 0;
                i < rrv.samplePlotJSON.datasets[dataName].length;
                i++
            ) {
                rrv.samplePlotJSON.datasets[dataName][i].qurro_balance = null;
            }
            chai.assert.isEmpty(rrv.getSamplePlotData("Metadata1"));
            chai.assert.isEmpty(rrv.getSamplePlotData("Metadata2"));
            chai.assert.isEmpty(rrv.getSamplePlotData("Metadata3"));
            chai.assert.isEmpty(rrv.getSamplePlotData("qurro_balance"));
            chai.assert.isEmpty(rrv.getSamplePlotData("Sample ID"));
        });
        describe("Works properly when balances are directly set", function() {
            /* Update sample plot balances directly.
             * Most of the balances are set to normal numbers, but two samples'
             * balances are set to null in order to test filtering of
             * some samples without "proper" balances -- i.e. undrawn samples,
             * which should be omitted from the exported data.
             */
            before(function() {
                rrv.samplePlotJSON.datasets[dataName][0].qurro_balance = 1;
                rrv.samplePlotJSON.datasets[dataName][1].qurro_balance = null;
                rrv.samplePlotJSON.datasets[dataName][2].qurro_balance = 3;
                rrv.samplePlotJSON.datasets[dataName][3].qurro_balance = null;
                rrv.samplePlotJSON.datasets[dataName][4].qurro_balance = 6.5;
                rrv.samplePlotJSON.datasets[dataName][5].qurro_balance = 7;
            });
            it("Works properly when a normal metadata category set as x-axis", function() {
                var expectedTSV =
                    "Sample_ID\tLog_Ratio\tMetadata1\n" +
                    "Sample1\t1\t1\n" +
                    "Sample3\t3\t7\n" +
                    "Sample6\t6.5\t16\n" +
                    "Sample7\t7\t19";
                var outputTSV = rrv.getSamplePlotData("Metadata1");
                chai.assert.equal(expectedTSV, outputTSV);
            });
            it("Works properly when qurro_balance or sample ID is set as x-axis", function() {
                var expectedTSV =
                    "Sample_ID\tLog_Ratio\n" +
                    "Sample1\t1\n" +
                    "Sample3\t3\n" +
                    "Sample6\t6.5\n" +
                    "Sample7\t7";
                var outputTSV = rrv.getSamplePlotData("qurro_balance");
                chai.assert.equal(expectedTSV, outputTSV);
                var outputTSV2 = rrv.getSamplePlotData("Sample ID");
                chai.assert.equal(expectedTSV, outputTSV2);
            });
        });
        // TODO: Ideally we'd test this by selecting features, but this
        // works also as a temporary measure
        it("Works properly when balances are set from user-based selection");

        describe("Quoting TSV fields", function() {
            // Quick way to avoid writing out "display.RRVDisplay..." every
            // time we want to call that function
            qfunc = display.RRVDisplay.quoteTSVFieldIfNeeded;
            it("Doesn't modify inputs without whitespace or double-quotes", function() {
                var t1 = "abcdefg";
                chai.assert.equal(t1, qfunc(t1));
                var t2 = "ABC123xyz+-?!@#$%^&*){}|/<>.";
                chai.assert.equal(t2, qfunc(t2));
            });
            it("Quotes fields containing whitespace", function() {
                // Test types of whitespace characters
                var t1 = "abc defg";
                chai.assert.equal('"abc defg"', qfunc(t1));
                var t2 = "abc\tdefg";
                chai.assert.equal('"abc\tdefg"', qfunc(t2));
                var t3 = "abc\ndefg";
                chai.assert.equal('"abc\ndefg"', qfunc(t3));
                // Test leading / trailing whitespace
                var t4 = "   abcdefg";
                chai.assert.equal('"   abcdefg"', qfunc(t4));
                var t5 = "abcdefg   ";
                chai.assert.equal('"abcdefg   "', qfunc(t5));
                var t6 = "   abcdefg   ";
                chai.assert.equal('"   abcdefg   "', qfunc(t6));
                // Test various combinations of above
                var t7 = "  ab\ncd\tefg ";
                chai.assert.equal('"  ab\ncd\tefg "', qfunc(t7));
                var t8 = "a\tb\nc\rd\tefg\r";
                chai.assert.equal('"a\tb\nc\rd\tefg\r"', qfunc(t8));
            });
            it('Quotes fields containing " and replaces those "s', function() {
                var t1 = 'abc"defg';
                chai.assert.equal('"abc""defg"', qfunc(t1));
                var t2 = 'abcd"ef"g';
                chai.assert.equal('"abcd""ef""g"', qfunc(t2));
                var t3 = '"abcdefg"';
                chai.assert.equal('"""abcdefg"""', qfunc(t3));
            });
            it('Properly handles fields with both whitespace and "s', function() {
                var t1 = 'abc "def" g';
                chai.assert.equal('"abc ""def"" g"', qfunc(t1));
                var t2 = 'a"\t"b\nc\rd\tefg""\r';
                chai.assert.equal('"a""\t""b\nc\rd\tefg""""\r"', qfunc(t2));
                var t3 = '  ABC DEF\tG "what" ';
                chai.assert.equal('"  ABC DEF\tG ""what"" "', qfunc(t3));
            });
        });
    });
});
