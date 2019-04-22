define(["feature_computation", "mocha", "chai"], function(
    feature_computation,
    mocha,
    chai
) {
    describe("Filtering lists of features based on text searching", function() {
        // TODO add a test that uses the | as a rank delimiter?
        var inputFeatures = [
            "Feature 1",
            "Featurelol 2",
            "Feature 3",
            "Feature 4|lol"
        ];
        var lolMatches = ["Featurelol 2", "Feature 4|lol"];

        var inputTaxa = [
            "Archaea;Crenarchaeota;Thermoprotei;Desulfurococcales;Desulfurococcaceae;Desulfurococcus;Desulfurococcus_kamchatkensis",
            "Bacteria;Firmicutes;Bacilli;Bacillales;Staphylococcaceae;Staphylococcus;Staphylococcus_aureus",
            "Bacteria;Firmicutes;Bacilli;Bacillales;Staphylococcaceae;Staphylococcus;Staphylococcus_epidermidis",
            "Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_Twort",
            "Viruses;Caudovirales;Xanthomonas_phage_Xp15"
        ];
        var bacteriaMatches = [inputTaxa[1], inputTaxa[2]];
        var caudoviralesMatches = [inputTaxa[3], inputTaxa[4]];
        var staphTextMatches = [inputTaxa[1], inputTaxa[2], inputTaxa[3]];

        it("Finds matching features in text searching", function() {
            chai.assert.sameMembers(
                feature_computation.filterFeatures(
                    inputFeatures,
                    "lol",
                    "text"
                ),
                lolMatches
            );
            chai.assert.sameMembers(
                feature_computation.filterFeatures(
                    inputFeatures,
                    "Feature",
                    "text"
                ),
                inputFeatures
            );
            // Text search should ignore taxonomic ranks (i.e. semicolons)
            chai.assert.sameMembers(
                feature_computation.filterFeatures(
                    inputTaxa,
                    "Staphylococcus",
                    "text"
                ),
                staphTextMatches
            );
        });

        it("Finds matching features in rank searching", function() {
            chai.assert.sameMembers(
                feature_computation.filterFeatures(
                    inputTaxa,
                    "Bacteria",
                    "rank"
                ),
                bacteriaMatches
            );
            chai.assert.sameMembers(
                feature_computation.filterFeatures(
                    inputTaxa,
                    "Caudovirales",
                    "rank"
                ),
                caudoviralesMatches
            );
            // If all features don't have any taxonomic ranks, nothing should
            // be found
            chai.assert.isEmpty(
                feature_computation.filterFeatures(
                    inputFeatures,
                    "Feature",
                    "rank"
                )
            );
            // Rank search should respect taxonomic ranks
            chai.assert.sameMembers(
                feature_computation.filterFeatures(
                    inputTaxa,
                    "Staphylococcus",
                    "rank"
                ),
                bacteriaMatches
            );
        });

        it("Searching is case sensitive", function() {
            chai.assert.isEmpty(
                feature_computation.filterFeatures(
                    inputTaxa,
                    "staphylococcus",
                    "rank"
                )
            );
            chai.assert.isEmpty(
                feature_computation.filterFeatures(
                    inputTaxa,
                    "staphylococcus",
                    "text"
                )
            );
            chai.assert.isEmpty(
                feature_computation.filterFeatures(
                    inputFeatures,
                    "feature",
                    "text"
                )
            );
        });

        it("Doesn't find anything in either search mode if inputText is empty or contains only whitespace", function() {
            chai.assert.isEmpty(
                feature_computation.filterFeatures(inputFeatures, "", "text")
            );
            chai.assert.isEmpty(
                feature_computation.filterFeatures(inputFeatures, "", "rank")
            );
            chai.assert.isEmpty(
                feature_computation.filterFeatures(
                    inputFeatures,
                    " \n \t ",
                    "text"
                )
            );
            chai.assert.isEmpty(
                feature_computation.filterFeatures(
                    inputFeatures,
                    " \n \t ",
                    "rank"
                )
            );
        });

        it('Throws an error if searchType isn\'t "rank" or "text"', function() {
            chai.assert.throws(function() {
                feature_computation.filterFeatures(
                    [],
                    "",
                    "invalid searchtype!!!"
                );
            });
        });
    });
});
