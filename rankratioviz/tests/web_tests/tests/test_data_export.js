define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // prettier-ignore
    var rankPlotJSON = {"config": {"view": {"width": 400, "height": 300}, "axis": {"gridColor": "#f2f2f2"}}, "data": {"name": "data-9a1dd79e18e69cf28db67fccfed0f389"}, "mark": "bar", "encoding": {"color": {"type": "nominal", "field": "Classification", "scale": {"domain": ["None", "Numerator", "Denominator", "Both"], "range": ["#e0e0e0", "#f00", "#00f", "#949"]}}, "size": {"value": 1.0}, "tooltip": [{"type": "quantitative", "field": "x"}, {"type": "nominal", "field": "Classification"}, {"type": "nominal", "field": "Feature ID"}], "x": {"type": "quantitative", "field": "x", "title": "Features"}, "y": {"type": "quantitative", "field": "Intercept"}}, "selection": {"selector007": {"type": "interval", "bind": "scales", "encodings": ["x", "y"]}}, "title": "Feature Ranks", "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json", "datasets": {"data-9a1dd79e18e69cf28db67fccfed0f389": [{"Feature ID": "Taxon2", "x": 0, "Classification": "None", "Intercept": 1.0, "Rank 1": 2.0, "Rank 2": 3.0}, {"Feature ID": "Taxon3|Yeet|100", "x": 1, "Classification": "None", "Intercept": 4.0, "Rank 1": 5.0, "Rank 2": 6.0}, {"Feature ID": "Taxon1", "x": 2, "Classification": "None", "Intercept": 5.0, "Rank 1": 6.0, "Rank 2": 7.0}, {"Feature ID": "Taxon5", "x": 3, "Classification": "None", "Intercept": 6.0, "Rank 1": 5.0, "Rank 2": 4.0}, {"Feature ID": "Taxon4", "x": 4, "Classification": "None", "Intercept": 9.0, "Rank 1": 8.0, "Rank 2": 7.0}], "rankratioviz_rank_ordering": ["Intercept", "Rank 1", "Rank 2"]}};
    // prettier-ignore
    var samplePlotJSON = {"config": {"view": {"width": 400, "height": 300}}, "data": {"name": "data-20592a268a0aeac806b0cd7f1eb32da9"}, "mark": "circle", "encoding": {"color": {"type": "nominal", "field": "Metadata1"}, "tooltip": [{"type": "nominal", "field": "Sample ID"}], "x": {"type": "quantitative", "field": "Metadata1"}, "y": {"type": "quantitative", "field": "rankratioviz_balance", "title": "log(Numerator / Denominator)"}}, "title": "Log Ratio of Abundances in Samples", "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json", "datasets": {"data-20592a268a0aeac806b0cd7f1eb32da9": [{"Sample ID": "Sample2", "rankratioviz_balance": null, "Metadata1": 4, "Metadata2": 5, "Metadata3": 6}, {"Sample ID": "Sample6", "rankratioviz_balance": null, "Metadata1": 16, "Metadata2": 17, "Metadata3": 18}, {"Sample ID": "Sample5", "rankratioviz_balance": null, "Metadata1": 13, "Metadata2": 14, "Metadata3": 15}, {"Sample ID": "Sample7", "rankratioviz_balance": null, "Metadata1": 19, "Metadata2": 20, "Metadata3": 21}, {"Sample ID": "Sample3", "rankratioviz_balance": null, "Metadata1": 7, "Metadata2": 8, "Metadata3": 9}, {"Sample ID": "Sample1", "rankratioviz_balance": null, "Metadata1": 1, "Metadata2": 2, "Metadata3": 3}], "rankratioviz_feature_col_ids": {"Taxon3|Yeet|100": "0", "Taxon4": "1", "Taxon5": "2", "Taxon1": "3", "Taxon2": "4"}, "rankratioviz_feature_counts": {"0": {"Sample2": 3.0, "Sample6": 3.0, "Sample5": 4.0, "Sample7": 2.0, "Sample3": 4.0, "Sample1": 2.0}, "1": {"Sample2": 1.0, "Sample6": 1.0, "Sample5": 1.0, "Sample7": 1.0, "Sample3": 1.0, "Sample1": 1.0}, "2": {"Sample2": 0.0, "Sample6": 0.0, "Sample5": 2.0, "Sample7": 0.0, "Sample3": 1.0, "Sample1": 0.0}, "3": {"Sample2": 1.0, "Sample6": 5.0, "Sample5": 4.0, "Sample7": 6.0, "Sample3": 2.0, "Sample1": 0.0}, "4": {"Sample2": 5.0, "Sample6": 1.0, "Sample5": 2.0, "Sample7": 0.0, "Sample3": 4.0, "Sample1": 6.0}}}};
    var rrv = new display.RRVDisplay(rankPlotJSON, samplePlotJSON);
    describe("Exporting sample plot data", function() {
        it('Returns "" when no sample points are "drawn"');
        //chai.assert.isEmpty(rrv.getSamplePlotData("Metadata1"));
        // TODO: Try with NaNs instead of nulls? Would necessitate calling
        // change() on rrv.samplePlotView, which is currently a no-go due
        // to issue #85.
        it("Works properly");
        // TODO need to update sample plot somehow, either by calling rrv
        // functions (preferable) or manually altering balances (not even
        // sure that would work for this).
        // Again, we're blocked here by #85.
        //var outputTSV = rrv.getSamplePlotData("Metadata1");
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
