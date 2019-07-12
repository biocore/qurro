define(["feature_computation", "mocha", "chai", "testing_utilities"], function(
    feature_computation,
    mocha,
    chai,
    testing_utilities
) {
    var rankPlotSkeleton = {
        data: { name: "dataName" },
        datasets: { dataName: [], qurro_feature_metadata_ordering: [] }
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
        rpJSON2.datasets.qurro_feature_metadata_ordering.push("Taxonomy");
        var bacteriaMatches = ["Feature 2", "Feature 3"];
        var caudoviralesMatches = ["Feature 4", "Feature 5"];
        var staphTextMatches = ["Feature 2", "Feature 3", "Feature 4"];

        describe('"Text"-mode searching', function() {
            it("Correctly searches through feature IDs", function() {
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
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
                    testing_utilities.getFeatureIDsFromObjectArray(
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
                    testing_utilities.getFeatureIDsFromObjectArray(
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
                    testing_utilities.getFeatureIDsFromObjectArray(
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
                    testing_utilities.getFeatureIDsFromObjectArray(
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
                    testing_utilities.getFeatureIDsFromObjectArray(
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

            it("Doesn't find anything if inputText is empty, but can do just-text-searching using whitespace", function() {
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
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            " ",
                            "Feature ID",
                            "text"
                        )
                    ),
                    inputFeatures
                );
            });
            it("Ignores actual null values", function() {
                // Feature 6's Taxonomy value is "null", while Feature 7's
                // Taxonomy value is null (literally a null value). So
                // searching methods shouldn't look at Feature 7's Taxonomy
                // value.
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
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
                    testing_utilities.getFeatureIDsFromObjectArray(
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
                    testing_utilities.getFeatureIDsFromObjectArray(
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
            // The case sensitivity, inputText-empty, and null value tests were
            // just copied from above with the searchType changed. A possible
            // TODO here is reducing the redunancy in these tests, but it's
            // not like efficiency in the JS testing process is a super huge
            // priority for us right now.
            it("Searching is (still) case sensitive", function() {
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        "staphylococcus",
                        "Taxonomy",
                        "rank"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "feature",
                        "Feature ID",
                        "rank"
                    )
                );
            });
            it("Doesn't find anything if inputText is empty or contains just whitespace/separator characers", function() {
                /* Just a helper function to alleviate redundant code here.
                 *
                 * Asserts that filterFeatures() with the given input text is
                 * empty. Tries this on both rpJSON1 and rpJSON2, with the
                 * "Feature ID" field for rpJSON1 and the "Taxonomy" field for
                 * rpJSON2.
                 */
                function assertEmpty(inputText) {
                    var jsonList = [rpJSON1, rpJSON2];
                    var fmList = ["Feature ID", "Taxonomy"];

                    for (var i = 0; i < jsonList.length; i++) {
                        chai.assert.isEmpty(
                            feature_computation.filterFeatures(
                                jsonList[i],
                                inputText,
                                fmList[i],
                                "rank"
                            )
                        );
                    }
                }
                assertEmpty("");
                assertEmpty(" \n \t ");
                assertEmpty(",,,,");
                assertEmpty(";;;;");
                assertEmpty(",; \t ;;");
                assertEmpty("  ,; \t ;;\n");
                assertEmpty("\n ,; \t ;;\n");
            });
            it("Ignores actual null values", function() {
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
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
        describe("textToRankArray()", function() {
            it("Works with basic, simple taxonomy strings", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray(
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
                    feature_computation.textToRankArray(
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
                    feature_computation.textToRankArray(
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
                    feature_computation.textToRankArray(
                        "D_0__Bacteria;; ;__;D_4__Whatever"
                    ),
                    ["D_0__Bacteria", "__", "D_4__Whatever"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray(
                        "Viruses;;Caudovirales;lol; "
                    ),
                    ["Viruses", "Caudovirales", "lol"]
                );
            });
            it("Returns [] when strings without actual text are passed in", function() {
                chai.assert.isEmpty(feature_computation.textToRankArray(""));
                chai.assert.isEmpty(
                    feature_computation.textToRankArray("  \n \t  ")
                );
                chai.assert.isEmpty(
                    feature_computation.textToRankArray("   ;   ")
                );
            });
            it("Behaves as expected when passed a comma-separated list", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray("Viruses, Bacteria"),
                    ["Viruses", "Bacteria"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray("Viruses,Bacteria"),
                    ["Viruses", "Bacteria"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray("Viruses"),
                    ["Viruses"]
                );
            });
            it("Separates on spaces, in addition to semicolons and commas", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray(
                        "Abc def ghi ;,; j[k]l m(nop) , qrs;tuv wxy|z"
                    ),
                    [
                        "Abc",
                        "def",
                        "ghi",
                        "j[k]l",
                        "m(nop)",
                        "qrs",
                        "tuv",
                        "wxy|z"
                    ]
                );
            });
            it("Works with oddly formatted input lists", function() {
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray(
                        "Viruses;Bacteria , Stuff 2; lol,5"
                    ),
                    ["Viruses", "Bacteria", "Stuff", "2", "lol", "5"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray("a b c d e f g"),
                    ["a", "b", "c", "d", "e", "f", "g"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray("a\tb\nc\rd\n\ne"),
                    ["a", "b", "c", "d", "e"]
                );
                chai.assert.sameOrderedMembers(
                    feature_computation.textToRankArray(
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
        describe("tryTextSearchable()", function() {
            it("Doesn't modify strings", function() {
                chai.assert.equal(
                    feature_computation.tryTextSearchable("abc"),
                    "abc"
                );
                chai.assert.equal(
                    feature_computation.tryTextSearchable("   Viruses   "),
                    "   Viruses   "
                );
                chai.assert.equal(
                    feature_computation.tryTextSearchable(
                        "   Viruses;Caudovirales;some third thing goes here   "
                    ),
                    "   Viruses;Caudovirales;some third thing goes here   "
                );
                chai.assert.equal(
                    feature_computation.tryTextSearchable("null"),
                    "null"
                );
            });
            it("Converts numbers to strings", function() {
                chai.assert.equal(
                    feature_computation.tryTextSearchable(3.14),
                    "3.14"
                );
                chai.assert.equal(
                    feature_computation.tryTextSearchable(5),
                    "5"
                );
            });
            it("Returns null when a non-string + non-number passed in", function() {
                chai.assert.isNull(feature_computation.tryTextSearchable([3]));
                chai.assert.isNull(
                    feature_computation.tryTextSearchable([3, 4, 5])
                );
                chai.assert.isNull(
                    feature_computation.tryTextSearchable(["a", "b", "c"])
                );
                chai.assert.isNull(
                    feature_computation.tryTextSearchable(["a"])
                );
                chai.assert.isNull(
                    feature_computation.tryTextSearchable({ abc: "def" })
                );
                chai.assert.isNull(feature_computation.tryTextSearchable(null));
                chai.assert.isNull(
                    feature_computation.tryTextSearchable(undefined)
                );
            });
        });
        describe("Various filterFeatures() logistics", function() {
            it("Throws an error when nonexistent feature metadata field passed", function() {
                chai.assert.throws(function() {
                    testing_utilities.getFeatureIDsFromObjectArray(
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
