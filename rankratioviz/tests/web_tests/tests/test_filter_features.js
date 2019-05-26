define(["feature_computation", "mocha", "chai"], function(
    feature_computation,
    mocha,
    chai
) {
    function getFeatureIDsFromObjectArray(objArray) {
        var outputFeatureIDs = [];
        for (var i = 0; i < objArray.length; i++) {
            outputFeatureIDs.push(objArray[i]["Feature ID"]);
        }
        return outputFeatureIDs;
    }
    var rankPlotSkeleton = {
        data: { name: "dataName" },
        datasets: { dataName: [], rankratioviz_feature_metadata_ordering: [] }
    };
    describe("Filtering lists of features based on text searching", function() {
        var rpJSON1 = JSON.parse(JSON.stringify(rankPlotSkeleton));
        rpJSON1.datasets.dataName.push({ "Feature ID": "Feature 1" });
        rpJSON1.datasets.dataName.push({ "Feature ID": "Featurelol 2" });
        rpJSON1.datasets.dataName.push({ "Feature ID": "Feature 3" });
        rpJSON1.datasets.dataName.push({ "Feature ID": "Feature 4|lol" });
        var inputFeatures = [
            "Feature 1",
            "Featurelol 2",
            "Feature 3",
            "Feature 4|lol"
        ];
        var lolMatches = ["Featurelol 2", "Feature 4|lol"];

        var rpJSON2 = JSON.parse(JSON.stringify(rankPlotSkeleton));
        rpJSON2.datasets.dataName.push({
            "Feature ID": "Feature 1",
            Taxonomy:
                "Archaea;Crenarchaeota;Thermoprotei;Desulfurococcales;Desulfurococcaceae;Desulfurococcus;Desulfurococcus_kamchatkensis"
        });
        rpJSON2.datasets.dataName.push({
            "Feature ID": "Feature 2",
            Taxonomy:
                "Bacteria;Firmicutes;Bacilli;Bacillales;Staphylococcaceae;Staphylococcus;Staphylococcus_aureus"
        });
        rpJSON2.datasets.dataName.push({
            "Feature ID": "Feature 3",
            Taxonomy:
                "Bacteria;Firmicutes;Bacilli;Bacillales;Staphylococcaceae;Staphylococcus;Staphylococcus_epidermidis"
        });
        rpJSON2.datasets.dataName.push({
            "Feature ID": "Feature 4",
            Taxonomy:
                "Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_Twort"
        });
        rpJSON2.datasets.dataName.push({
            "Feature ID": "Feature 5",
            Taxonomy: "Viruses;Caudovirales;Xanthomonas_phage_Xp15"
        });
        rpJSON2.datasets.dataName.push({
            "Feature ID": "Feature 6",
            Taxonomy: "null"
        });
        rpJSON2.datasets.dataName.push({
            "Feature ID": "Feature 7",
            Taxonomy: null
        });
        rpJSON2.datasets.rankratioviz_feature_metadata_ordering.push(
            "Taxonomy"
        );
        var bacteriaMatches = ["Feature 2", "Feature 3"];
        var caudoviralesMatches = ["Feature 4", "Feature 5"];
        var staphTextMatches = ["Feature 2", "Feature 3", "Feature 4"];

        describe('"Text"-mode searching', function() {
            it("Correctly searches through feature IDs", function() {
                chai.assert.sameOrderedMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "lol",
                            "Feature ID",
                            "text"
                        )
                    ),
                    lolMatches
                );
                chai.assert.sameOrderedMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "Feature",
                            "Feature ID",
                            "text"
                        )
                    ),
                    inputFeatures
                );
            });

            it("Correctly searches through feature metadata fields", function() {
                // Default text search ignores taxonomic ranks (i.e. semicolons)
                chai.assert.sameOrderedMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "Staphylococcus",
                            "Taxonomy",
                            "text"
                        )
                    ),
                    staphTextMatches
                );
                chai.assert.sameOrderedMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "Bacteria",
                            "Taxonomy",
                            "text"
                        )
                    ),
                    bacteriaMatches
                );
                chai.assert.sameOrderedMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "Caudovirales",
                            "Taxonomy",
                            "text"
                        )
                    ),
                    caudoviralesMatches
                );
                // Only respects taxonomic ranks if the user forces it
                chai.assert.sameOrderedMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            ";Staphylococcus;",
                            "Taxonomy",
                            "text"
                        )
                    ),
                    bacteriaMatches
                );
            });

            it("Searching is case sensitive", function() {
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        "staphylococcus",
                        "Taxonomy",
                        "text"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "feature",
                        "Feature ID",
                        "text"
                    )
                );
            });

            it("Doesn't find anything if inputText is empty or contains only whitespace", function() {
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "",
                        "Feature ID",
                        "text"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        "",
                        "Taxonomy",
                        "text"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        " \n \t ",
                        "Feature ID",
                        "text"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        " \n \t ",
                        "Taxonomy",
                        "text"
                    )
                );
            });
            it("Ignores actual null values", function() {
                // Feature 6's Taxonomy value is "null", while Feature 7's
                // Taxonomy value is null (literally a null value). So
                // searching methods shouldn't look at Feature 7's Taxonomy
                // value.
                chai.assert.sameMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "null",
                            "Taxonomy",
                            "text"
                        )
                    ),
                    ["Feature 6"]
                );
            });
        });
        describe('"Rank"-mode searching', function() {
            it("Finds matching features based on full, exact taxonomic rank", function() {
                chai.assert.sameOrderedMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "Staphylococcus",
                            "Taxonomy",
                            "rank"
                        )
                    ),
                    // output shouldn't include the Staphylococcus_phage, since
                    // rank searching is exact
                    ["Feature 2", "Feature 3"]
                );
                chai.assert.sameOrderedMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "Bacilli",
                            "Taxonomy",
                            "rank"
                        )
                    ),
                    ["Feature 2", "Feature 3"]
                );
            });
            it("Ignores actual null values", function() {
                // same as the identically-named test in the text-mode
                // searching block, but this uses rank searching
                chai.assert.sameMembers(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "null",
                            "Taxonomy",
                            "rank"
                        )
                    ),
                    ["Feature 6"]
                );
            });
        });
        describe("existsIntersection()", function() {
            it("Returns true if an intersection exists", function() {
                chai.assert.isTrue(
                    feature_computation.existsIntersection(
                        ["a", "b", "c"],
                        ["d", "e", "b"]
                    )
                );
                chai.assert.isTrue(
                    feature_computation.existsIntersection(["a"], ["a"])
                );
            });
            it("Returns false if no intersection exists", function() {
                chai.assert.isFalse(
                    feature_computation.existsIntersection(
                        ["a", "b", "c"],
                        ["d", "e", "f"]
                    )
                );
                chai.assert.isFalse(
                    feature_computation.existsIntersection(["a"], ["b"])
                );
            });
            it("Returns false when >= 1 input array is empty", function() {
                chai.assert.isFalse(
                    feature_computation.existsIntersection([], [])
                );
                chai.assert.isFalse(
                    feature_computation.existsIntersection([1], [])
                );
                chai.assert.isFalse(
                    feature_computation.existsIntersection([], [2])
                );
            });
        });
        describe("taxonomyToRankArray()", function() {
            it("Works with basic, simple taxonomy strings", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.taxonomyToRankArray(
                        "Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_Twort"
                    ),
                    [
                        "Viruses",
                        "Caudovirales",
                        "Myoviridae",
                        "Twortlikevirus",
                        "Staphylococcus_phage_Twort"
                    ]
                );
            });
            it("Works with Greengenes-style taxonomy strings", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.taxonomyToRankArray(
                        "k__Bacteria; p__Bacteroidetes; c__Bacteroidia; o__Bacteroidales; f__Bacteroidaceae; g__Bacteroides; s__"
                    ),
                    [
                        "k__Bacteria",
                        "p__Bacteroidetes",
                        "c__Bacteroidia",
                        "o__Bacteroidales",
                        "f__Bacteroidaceae",
                        "g__Bacteroides",
                        "s__"
                    ]
                );
            });
            it("Works with SILVA-style taxonomy strings", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.taxonomyToRankArray(
                        // Thanks to Justin for the example data
                        "D_0__Bacteria;D_1__Bacteroidetes;D_2__Bacteroidia;D_3__Bacteroidales;D_4__Bacteroidaceae;D_5__Bacteroides"
                    ),
                    [
                        "D_0__Bacteria",
                        "D_1__Bacteroidetes",
                        "D_2__Bacteroidia",
                        "D_3__Bacteroidales",
                        "D_4__Bacteroidaceae",
                        "D_5__Bacteroides"
                    ]
                );
            });
            it('Ignores "empty" taxonomic ranks', function() {
                chai.assert.sameOrderedMembers(
                    // Currently, we don't treat __ specially, so it'll get
                    // treated as a taxonomic rank. (See
                    // https://forum.qiime2.org/t/unassigned-reads-k-bacteria-only-in-one-sample-type-murine-samples/4536
                    // for an example of where this has apparently come up in
                    // practice.) If it'd be desirable to specifically exclude
                    // ranks that consist only of underscores, we can add that
                    // functionality to taxonomyToRankArray() later on.
                    feature_computation.taxonomyToRankArray(
                        "D_0__Bacteria;; ;__;D_4__Whatever"
                    ),
                    ["D_0__Bacteria", "__", "D_4__Whatever"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.taxonomyToRankArray(
                        "Viruses;;Caudovirales;lol; "
                    ),
                    ["Viruses", "Caudovirales", "lol"]
                );
            });
            it("Returns [] when strings without actual text are passed in", function() {
                chai.assert.isEmpty(
                    feature_computation.taxonomyToRankArray("")
                );
                chai.assert.isEmpty(
                    feature_computation.taxonomyToRankArray("  \n \t  ")
                );
                chai.assert.isEmpty(
                    feature_computation.taxonomyToRankArray("   ;   ")
                );
            });
        });
        describe("inputTextToRankArray()", function() {
            it("Behaves as expected when passed a comma-separated list", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray(
                        "Viruses, Bacteria"
                    ),
                    ["Viruses", "Bacteria"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray(
                        "Viruses,Bacteria"
                    ),
                    ["Viruses", "Bacteria"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray("Viruses"),
                    ["Viruses"]
                );
            });
            it("Behaves as expected when passed a semicolon-separated list", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray(
                        "Viruses; Bacteria"
                    ),
                    ["Viruses", "Bacteria"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray(
                        "Viruses;Bacteria"
                    ),
                    ["Viruses", "Bacteria"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray(
                        "Viruses;Bacteria;Caudovirales;asdf"
                    ),
                    ["Viruses", "Bacteria", "Caudovirales", "asdf"]
                );
            });
            it("Works with oddly formatted input lists", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray(
                        "Viruses;Bacteria , Stuff ; lol,5"
                    ),
                    ["Viruses", "Bacteria", "Stuff", "lol", "5"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray("a b c d e f g"),
                    ["a", "b", "c", "d", "e", "f", "g"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray("a\tb\nc\rd\n\ne"),
                    ["a", "b", "c", "d", "e"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.inputTextToRankArray(
                        "\n c__Bacilli,o__Bacillales  \t  f__Staphylococcaceae \n lol"
                    ),
                    [
                        "c__Bacilli",
                        "o__Bacillales",
                        "f__Staphylococcaceae",
                        "lol"
                    ]
                );
            });
        });
        describe("Various filterFeatures() logistics", function() {
            it("Throws an error when nonexistent feature metadata field passed", function() {
                chai.assert.throws(function() {
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "I'm the input text!",
                            "Taxonomy",
                            "text"
                        )
                    );
                });
                // test that feature metadata field names are case-sensitive
                chai.assert.throws(function() {
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "I'm the input text!",
                        "feature id",
                        "text"
                    );
                });
                // test that feature metadata field names "preserve" whitespace
                chai.assert.throws(function() {
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "I'm the input text!",
                        "FeatureID",
                        "text"
                    );
                });
            });
            it("Throws an error when nonexistent search type passed", function() {
                chai.assert.throws(function() {
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "I'm irrelevant!",
                        "Feature ID",
                        "asdfasdfasdf"
                    );
                });
                // test that search type names are case-sensitive
                chai.assert.throws(function() {
                    feature_computation.filterFeatures(
                        rpJSON2,
                        "I'm the input text!",
                        "Taxonomy",
                        "Rank"
                    );
                });
            });
            it("Returns [] when inputText.trim().length is 0", function() {
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "",
                        "Feature ID",
                        "text"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        "  \r            \t \n     ",
                        "Taxonomy",
                        "rank"
                    )
                );
            });
        });
    });
});
