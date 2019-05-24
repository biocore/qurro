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

            it("Correctly searches through feature metadta fields", function() {
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
                // Rank search should respect taxonomic ranks
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
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "I'm the input text!",
                            "feature id",
                            "text"
                        )
                    );
                });
                // test that feature metadata field names "preserve" whitespace
                chai.assert.throws(function() {
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "I'm the input text!",
                            "FeatureID",
                            "text"
                        )
                    );
                });
            });

            it("Searching is case sensitive", function() {
                chai.assert.isEmpty(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "staphylococcus",
                            "Taxonomy",
                            "text"
                        )
                    )
                );
                chai.assert.isEmpty(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "feature",
                            "Feature ID",
                            "text"
                        )
                    )
                );
            });

            it("Doesn't find anything if inputText is empty or contains only whitespace", function() {
                chai.assert.isEmpty(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            "",
                            "Feature ID",
                            "text"
                        )
                    )
                );
                chai.assert.isEmpty(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            "",
                            "Taxonomy",
                            "text"
                        )
                    )
                );
                chai.assert.isEmpty(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON1,
                            " \n \t ",
                            "Feature ID",
                            "text"
                        )
                    )
                );
                chai.assert.isEmpty(
                    getFeatureIDsFromObjectArray(
                        feature_computation.filterFeatures(
                            rpJSON2,
                            " \n \t ",
                            "Taxonomy",
                            "text"
                        )
                    )
                );
            });
        });
        describe('"Rank"-mode searching', function() {
            it("Finds matching features based on taxonomic rank");
            it("Only filters based on full, exact (i.e. not partial) matches");
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
                    feature_computation.inputTextToRankArray(
                        "c__Bacilli,o__Bacillales  \t  f__Staphylococcaceae"
                    ),
                    ["c__Bacilli", "o__Bacillales", "f__Staphylococcaceae"]
                );
            });
        });
    });
});
