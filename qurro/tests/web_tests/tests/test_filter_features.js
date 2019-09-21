define(["feature_computation", "mocha", "chai", "testing_utilities"], function(
    feature_computation,
    mocha,
    chai,
    testing_utilities
) {
    var rankPlotSkeleton = {
        data: { name: "dataName" },
        datasets: {
            dataName: [],
            qurro_feature_metadata_ordering: [],
            qurro_rank_ordering: []
        }
    };
    describe("Filtering lists of features based on text/number searching", function() {
        var rpJSON1 = JSON.parse(JSON.stringify(rankPlotSkeleton));
        rpJSON1.datasets.dataName.push({
            "Feature ID": "Feature 1",
            n: 1.2,
            x: null
        });
        rpJSON1.datasets.dataName.push({
            "Feature ID": "Featurelol 2",
            n: 2,
            x: "asdf"
        });
        rpJSON1.datasets.dataName.push({
            "Feature ID": "Feature 3",
            n: 3.0,
            x: "0"
        });
        rpJSON1.datasets.dataName.push({
            "Feature ID": "Feature 4|lol",
            n: 4.5,
            x: "Infinity"
        });
        rpJSON1.datasets.qurro_rank_ordering.push("n");
        rpJSON1.datasets.qurro_rank_ordering.push("x");
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

            it("Searching is case *insensitive*", function() {
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "staphylococcus",
                            "Taxonomy",
                            "text"
                        )
                    ),
                    staphTextMatches
                );
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "feature",
                            "Feature ID",
                            "text"
                        )
                    ),
                    inputFeatures
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
        describe('"Does not contain the text" searching', function() {
            it("Correctly searches through feature IDs", function() {
                // Unlike the normal "text" searching version of this
                // particular test, we want to make sure that the features
                // returned *do not* contain the given text. So, in this case,
                // we want all of the features in rpJSON1 that don't have the
                // text "lol" in their Feature ID.
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "lol",
                            "Feature ID",
                            "nottext"
                        )
                    ),
                    ["Feature 1", "Feature 3"]
                );
                // Similarly, since all of rpJSON1's features' Feature IDs
                // contain the text "Feature", we'd expect nottext searching to
                // give us an empty list of features.
                chai.assert.isEmpty(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "Feature",
                            "Feature ID",
                            "nottext"
                        )
                    )
                );
            });

            it("Correctly searches through feature metadata fields", function() {
                // Default text search ignores taxonomic ranks (i.e. semicolons)
                // In this case, get all features with taxonomies that do not
                // contain the text "Staphylococcus".
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "Staphylococcus",
                            "Taxonomy",
                            "nottext"
                        )
                    ),
                    ["Feature 1", "Feature 5", "Feature 6"]
                );
                // In this case, get all features with taxonomies that don't
                // contain the text "Bacteria".
                // This includes Feature 1 (Archaea), Features 4 and 5
                // (Viruses), and Feature 6 ("null" -- yes, this is an invalid
                // taxonomy string, but this isn't checking for validity)
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "Bacteria",
                            "Taxonomy",
                            "nottext"
                        )
                    ),
                    ["Feature 1", "Feature 4", "Feature 5", "Feature 6"]
                );
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "Caudovirales",
                            "Taxonomy",
                            "nottext"
                        )
                    ),
                    ["Feature 1", "Feature 2", "Feature 3", "Feature 6"]
                );
                // Only respects taxonomic ranks if the user forces it
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            ";Staphylococcus;",
                            "Taxonomy",
                            "nottext"
                        )
                    ),
                    ["Feature 1", "Feature 4", "Feature 5", "Feature 6"]
                );
            });

            it("Searching is case *insensitive*", function() {
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "staphylococcus",
                            "Taxonomy",
                            "nottext"
                        )
                    ),
                    ["Feature 1", "Feature 5", "Feature 6"]
                );
                chai.assert.isEmpty(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "feature",
                            "Feature ID",
                            "nottext"
                        )
                    )
                );
            });

            it("Doesn't find anything if inputText is empty, but can do just-text-searching using whitespace", function() {
                // If inputText is empty, the searching will automatically end.
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "",
                        "Feature ID",
                        "nottext"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        "",
                        "Taxonomy",
                        "nottext"
                    )
                );
                // "Filter to features where Feature ID does not contain the
                // text ' \n \t '." Since none of the feature IDs for this
                // dataset contain that weird combo of whitespace, all of the
                // features should be contained in the results.
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            " \n \t ",
                            "Feature ID",
                            "nottext"
                        )
                    ),
                    inputFeatures
                );
                // Same thing as above case, but for another dataset and for
                // taxonomy. (Note that Feature 7 isn't included because its
                // taxonomy is null.)
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            " \n \t ",
                            "Taxonomy",
                            "nottext"
                        )
                    ),
                    [
                        "Feature 1",
                        "Feature 2",
                        "Feature 3",
                        "Feature 4",
                        "Feature 5",
                        "Feature 6"
                    ]
                );
                // All feature IDs in rpJSON1 contain a space. Since we're
                // filtering to features with IDs that *do not* contain a
                // space, the results here should be empty.
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        " ",
                        "Feature ID",
                        "nottext"
                    )
                );
            });
            it("Ignores actual null values", function() {
                // Feature 6's Taxonomy value is "null", while Feature 7's
                // Taxonomy value is null (literally a null value). So
                // searching methods shouldn't look at Feature 7's Taxonomy
                // value.
                // ...Since we're using "nottext", this should give us all
                // features where taxonomy is provided *and* taxonomy does not
                // contain the text "null" -- in this case, this is all
                // features aside from 6 and 7.
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "null",
                            "Taxonomy",
                            "nottext"
                        )
                    ),
                    [
                        "Feature 1",
                        "Feature 2",
                        "Feature 3",
                        "Feature 4",
                        "Feature 5"
                    ]
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
            // The case insensitivity, inputText-empty, and null value tests
            // were just copied from above with the searchType changed.
            // A TODO here is reducing the redunancy in these tests, but it's
            // not like efficiency in the JS testing process is a super huge
            // priority for us right now.
            it("Searching is (still) case insensitive", function() {
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "staphylococcus",
                            "Taxonomy",
                            "rank"
                        )
                    ),
                    bacteriaMatches
                );
                chai.assert.sameOrderedMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "feature",
                            "Feature ID",
                            "rank"
                        )
                    ),
                    ["Feature 1", "Feature 3", "Feature 4|lol"]
                );
            });
            it("Doesn't find anything if inputText is empty or contains just whitespace/separator characters", function() {
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
        describe("Basic number-based searching", function() {
            it('Less than (< or "lt") finds features < a given value', function() {
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "3.2",
                            "n",
                            "lt"
                        )
                    ),
                    ["Feature 1", "Featurelol 2", "Feature 3"]
                );
                // Test that even equal values are excluded
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "3",
                            "n",
                            "lt"
                        )
                    ),
                    ["Feature 1", "Featurelol 2"]
                );
                // Test case where everything empty
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "1.0",
                        "n",
                        "lt"
                    )
                );
                // Test case where everything included
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "5",
                            "n",
                            "lt"
                        )
                    ),
                    inputFeatures
                );
            });
            it('Greater than (> or "gt") finds features > a given value', function() {
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "3.2",
                            "n",
                            "gt"
                        )
                    ),
                    ["Feature 4|lol"]
                );
                // Test that even equal values are excluded
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "3",
                            "n",
                            "gt"
                        )
                    ),
                    ["Feature 4|lol"]
                );
                // Test case where everything empty
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "4.5",
                        "n",
                        "gt"
                    )
                );
                // Test case where everything included
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "0",
                            "n",
                            "gt"
                        )
                    ),
                    inputFeatures
                );
            });
            it('Less than or equal (<= or "lte") finds features <= a given value', function() {
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "3",
                            "n",
                            "lte"
                        )
                    ),
                    ["Feature 1", "Featurelol 2", "Feature 3"]
                );
                // Test case where everything empty
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "1.17",
                        "n",
                        "lte"
                    )
                );
                // Test case where everything included
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "4.5",
                            "n",
                            "lte"
                        )
                    ),
                    inputFeatures
                );
            });
            it('Greater than or equal (>= or "gte") finds features >= a given value', function() {
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "2",
                            "n",
                            "gte"
                        )
                    ),
                    ["Featurelol 2", "Feature 3", "Feature 4|lol"]
                );
                // Test case where everything empty
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "5.0",
                        "n",
                        "gte"
                    )
                );
                // Test case where everything included
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "1.20000",
                            "n",
                            "gte"
                        )
                    ),
                    inputFeatures
                );
            });
            it("Non-finite / non-numeric feature field values are ignored", function() {
                chai.assert.sameMembers(
                    testing_utilities.getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "0",
                            "x",
                            "gte"
                        )
                    ),
                    ["Feature 3"]
                );
            });
            it("Non-finite / non-numeric input field values are ignored", function() {
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "null",
                        "x",
                        "gte"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "NaN",
                        "x",
                        "gte"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "Infinity",
                        "x",
                        "lte"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "-Infinity",
                        "x",
                        "gte"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(rpJSON1, "", "x", "gte")
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "  ",
                        "x",
                        "gte"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        " asdf ",
                        "x",
                        "gte"
                    )
                );
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "asdf",
                        "x",
                        "gte"
                    )
                );
            });
            describe("operatorToCompareFunc()", function() {
                it("Passing in an invalid operator results in an error", function() {
                    // This should never happen since we screen for invalid
                    // operators in filterFeatures(), but still good to check for
                    chai.assert.throws(function() {
                        feature_computation.operatorToCompareFunc("asdf", 3);
                    }, /unrecognized operator passed/);
                });
                it("Passing in a valid operator results in a valid comparison function", function() {
                    // The other basic numerical comparison operators (lte, gt,
                    // gte) have already been unit-tested above. This just
                    // double-checks that operatorToCompareFunc() itself works
                    // when called manually.
                    var lt3 = feature_computation.operatorToCompareFunc(
                        "lt",
                        3
                    );
                    chai.assert.isTrue(lt3(0));
                    chai.assert.isTrue(lt3(2));
                    chai.assert.isFalse(lt3(3));
                    chai.assert.isFalse(lt3(4));
                });
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
            it("Lowercases (but otherwise doesn't modify) strings", function() {
                chai.assert.equal(
                    feature_computation.tryTextSearchable("abc"),
                    "abc"
                );
                chai.assert.equal(
                    feature_computation.tryTextSearchable("AbC"),
                    "abc"
                );
                chai.assert.equal(
                    feature_computation.tryTextSearchable("   Viruses   "),
                    "   viruses   "
                );
                chai.assert.equal(
                    feature_computation.tryTextSearchable(
                        "   Viruses;Caudovirales;some third thing goes here   "
                    ),
                    "   viruses;caudovirales;some third thing goes here   "
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
            it("Returns [] when inputText.length is 0", function() {
                chai.assert.isEmpty(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "",
                        "Feature ID",
                        "text"
                    )
                );
            });
        });
    });
});
