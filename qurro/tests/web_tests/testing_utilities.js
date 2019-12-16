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

    /* For a given DataTable's ID, return an Object describing its data.
     *
     * ... in particular, the returned Object is a mapping of each row's
     * feature ID (column 0) to an array of the remaining column values for
     * that row.
     *
     * This function makes the implicit assumption that the columns in the
     * DataTable are in a certain order. This is because accessing column
     * names in DataTables versions pre-2 isn't easily doable without
     * circumventing the public API somehow (see
     * https://datatables.net/forums/discussion/46445).
     *
     * If this assumption is broken (i.e. due to updating the DataTables
     * version used by Qurro), these tests will need to be updated -- but I
     * expect that updating to a later version will also make it easier to
     * access column names in the first place.
     */
    function extractDataFromDataTable(tableID) {
        var d = $("#" + tableID)
            .DataTable()
            .data();
        var featureID2OtherCols = {};
        for (var r = 0; r < d.length; r++) {
            featureID2OtherCols[d[r][0]] = d[r].slice(1);
        }
        return featureID2OtherCols;
    }

    /* Given a DataTable ID and a mapping of the "expected data" in the table,
     * checks that all of the data is the same.
     *
     * The mapping argument ("expectedData") should be structured analogously
     * to how the output from extractDataFromDataTable() is given -- that is,
     * an Object where each key is a feature ID and each value is an array of
     * the column values for that row.
     */
    function checkDataTable(tableID, expectedData) {
        var dataInTable = extractDataFromDataTable(tableID);
        var featureIDsInTable = Object.keys(dataInTable);

        // Check that the feature IDs are exactly the same (ignoring order,
        // though)
        chai.assert.sameMembers(featureIDsInTable, Object.keys(expectedData));

        // Check that column data for each feature ID is in the same order
        $.each(expectedData, function(featureID, expectedRowContents) {
            for (var i = 0; i < expectedRowContents.length; i++) {
                chai.assert.equal(
                    dataInTable[featureID][i],
                    expectedRowContents[i]
                );
            }
        });
    }

    /* Retrieves a "feature row" from an RRVDisplay object's rank plot
     * JSON.
     *
     * This mimics what we'd get in, e.g.,
     * RRVDisplay.addClickEventToRankPlotView()'s callback function or
     * in one of the feature filtering methods.
     *
     * The reason we need to get an actual feature row -- not just a
     * JSON object with just the feature ID, e.g.
     *
     *    rrv.newFeatureLow = { "Feature ID": "Taxon4" };
     *
     * ...is that our use of DataTables means that when we test
     * assigning new features, those features need to include all the
     * columns we expect. This was causing some really funky errors
     * with PR #235.
     */
    function getFeatureRow(rrv, featureID) {
        $.each(rrv.rankPlotJSON.datasets[rrv.rankPlotJSON.data.name], function(row) {
            if (row["Feature ID"] === featureID) {
                return row;
            }
        });
        // If we've made it here, the ID passed in wasn't valid
        throw new Error("Feature ID not in rank plot JSON: " + featureID);
    }


    return {
        getFeatureIDsFromObjectArray: getFeatureIDsFromObjectArray,
        checkHeaders: checkHeaders,
        assertEnabled: assertEnabled,
        extractDataFromDataTable: extractDataFromDataTable,
        checkDataTable: checkDataTable,
        getFeatureRow: getFeatureRow
    };
});
