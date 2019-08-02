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
     *
     * Solution for converting percentages to locale strings with exactly 2
     * fractional digits, as with dom_utils.formatPercentage(), based on
     * https://stackoverflow.com/a/31581206/10730311.
     */
    function checkHeaders(expTopCt, expBotCt, numFeatures) {
        var topP = 100 * (expTopCt / numFeatures);
        var botP = 100 * (expBotCt / numFeatures);
        chai.assert.equal(
            document.getElementById("numHeader").textContent,
            "Numerator Features: " +
                expTopCt.toLocaleString() +
                " / " +
                numFeatures.toLocaleString() +
                " (" +
                topP.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) +
                "%) selected"
        );
        chai.assert.equal(
            document.getElementById("denHeader").textContent,
            "Denominator Features: " +
                expBotCt.toLocaleString() +
                " / " +
                numFeatures.toLocaleString() +
                " (" +
                botP.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) +
                "%) selected"
        );
    }

    /* Asserts that a given DOM element (by ID) is enabled or is disabled. */
    function assertEnabled(selectID, isEnabled) {
        var ele = document.getElementById(selectID);
        if (!isEnabled) {
            chai.assert.isTrue(ele.disabled);
        } else {
            chai.assert.isFalse(ele.disabled);
        }
    }

    return {
        getFeatureIDsFromObjectArray: getFeatureIDsFromObjectArray,
        checkHeaders: checkHeaders,
        assertEnabled: assertEnabled
    };
});
