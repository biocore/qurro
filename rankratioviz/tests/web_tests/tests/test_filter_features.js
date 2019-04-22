define(["feature_computation", "mocha", "chai"], function(
    feature_computation,
    mocha,
    chai
) {
    describe("Filtering lists of features based on text searching", function() {
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
