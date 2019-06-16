define(["chai"], function(chai) {

    /* Return a list of the feature IDs present in an array of feature data
     * "objects" (rows in the data in the rank plot JSON).
     */
    function getFeatureIDsFromObjectArray(objArray) {
        var outputFeatureIDs = [];
        for (var i = 0; i < objArray.length; i++) {
            outputFeatureIDs.push(objArray[i]["Feature ID"]);
        }
        return outputFeatureIDs;
    }

    /* Asserts that the #numHeader and #denHeader elements are set to the
     * correct counts.
     */
    function checkHeaders(expTopCt, expBotCt) {
        chai.assert.equal(
            document.getElementById("numHeader").innerHTML,
            "Numerator Features (" +
                expTopCt.toLocaleString() +
                " selected)"
        );
        chai.assert.equal(
            document.getElementById("denHeader").innerHTML,
            "Denominator Features (" +
                expBotCt.toLocaleString() +
                " selected)"
        );
    }

    return {getFeatureIDsFromObjectArray: getFeatureIDsFromObjectArray, checkHeaders: checkHeaders};
});
