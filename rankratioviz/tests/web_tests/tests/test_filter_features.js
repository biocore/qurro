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

        it("Finds matching features by searching through feature IDs", function() {
            chai.assert.sameMembers(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "lol",
                        "Feature ID"
                    )
                ),
                lolMatches
            );
            chai.assert.sameMembers(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "Feature",
                        "Feature ID"
                    )
                ),
                inputFeatures
            );
        });

        it("Finds matching features by searching feature metadata", function() {
            // Default text search ignores taxonomic ranks (i.e. semicolons)
            chai.assert.sameMembers(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        "Staphylococcus",
                        "Taxonomy"
                    )
                ),
                staphTextMatches
            );
            chai.assert.sameMembers(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        "Bacteria",
                        "Taxonomy"
                    )
                ),
                bacteriaMatches
            );
            chai.assert.sameMembers(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        "Caudovirales",
                        "Taxonomy"
                    )
                ),
                caudoviralesMatches
            );
            // Rank search should respect taxonomic ranks
            chai.assert.sameMembers(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        ";Staphylococcus;",
                        "Taxonomy"
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
                        "Taxonomy"
                    )
                );
            });
            // test that feature metadata field names are case-sensitive
            chai.assert.throws(function() {
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "I'm the input text!",
                        "feature id"
                    )
                );
            });
            // test that feature metadata field names "preserve" whitespace
            chai.assert.throws(function() {
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "I'm the input text!",
                        "FeatureID"
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
                        "Taxonomy"
                    )
                )
            );
            chai.assert.isEmpty(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        "feature",
                        "Feature ID"
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
                        "Feature ID"
                    )
                )
            );
            chai.assert.isEmpty(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(rpJSON2, "", "Taxonomy")
                )
            );
            chai.assert.isEmpty(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON1,
                        " \n \t ",
                        "Feature ID"
                    )
                )
            );
            chai.assert.isEmpty(
                getFeatureIDsFromObjectArray(
                    feature_computation.filterFeatures(
                        rpJSON2,
                        " \n \t ",
                        "Taxonomy"
                    )
                )
            );
        });
    });
});
