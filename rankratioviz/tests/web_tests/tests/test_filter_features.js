define(["feature_computation", "mocha", "chai"], function(
    feature_computation,
    mocha,
    chai
) {
    describe("Filtering lists of features based on text searching", function() {
        var inputFeatures = [
            "Feature 1",
            "Featurelol 2",
            "Feature 3",
            "Feature 4|lol"
        ];
        var lolMatches = ["Featurelol 2", "Feature 4|lol"];

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
