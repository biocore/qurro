define(function() {
    /* Returns list of feature IDs based on a match of a given metadata field
     * with the input text.
     *
     * If inputText is empty (i.e. its length is 0), this returns an empty
     * array.
     */
    function filterFeatures(rankPlotJSON, inputText, featureMetadataField) {
        if (
            featureMetadataField !== "Feature ID" &&
            rankPlotJSON.datasets.rankratioviz_feature_metadata_ordering.indexOf(
                featureMetadataField
            ) < 0
        ) {
            throw new Error("featureMetadataField not found in data");
        } else if (inputText.trim().length === 0) {
            return [];
        }

        var filteredFeatures = [];
        var currVal;
        var potentialFeatures = rankPlotJSON.datasets[rankPlotJSON.data.name];
        for (var ti = 0; ti < potentialFeatures.length; ti++) {
            // Note that this can lead to some weird results if you're not
            // careful -- e.g. just searching on "Staphylococcus" will
            // include Staph phages in the filtering (since their names
            // contain the text "Staphylococcus").
            currVal = potentialFeatures[ti][featureMetadataField];
            if (typeof currVal === "string" && currVal.includes(inputText)) {
                filteredFeatures.push(potentialFeatures[ti]["Feature ID"]);
            }
        }
        return filteredFeatures;
    }

    /* Vega-Lite doesn't filter out infinities (caused by taking log(0)
     * or of log(0)/log(0), etc.) by default. If left unchecked, this leads to
     * weird and not-useful charts due to the presence of infinities.
     *
     * To get around this, we preemptively set the balance for samples with an
     * abundance of <= 0 in either the top or bottom of the log ratio as NaN.
     *
     * (Vega-Lite does filter out NaNs and nulls if the invalidValues config
     * property is true [which is default]).
     */
    function computeBalance(topValue, botValue) {
        if (typeof topValue !== "number" || typeof botValue !== "number") {
            throw new Error(
                "computeBalance() called with non-numerical input(s)"
            );
        }
        if (topValue <= 0 || botValue <= 0) {
            return NaN;
        }
        return Math.log(topValue) - Math.log(botValue);
    }
    return { filterFeatures: filterFeatures, computeBalance: computeBalance };
});
