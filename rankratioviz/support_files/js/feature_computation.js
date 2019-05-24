define(function() {
    /* Given a list of feature "rows", a string of input text, and a feature
     * metadata field, returns a list of all features that contain that text in
     * the specified feature metadata field.
     *
     * Note that this can lead to some weird results if you're not careful --
     * e.g. just searching on "Staphylococcus" will include Staph phages in the
     * filtering (since their names contain the text "Staphylococcus").
     */
    function textFilterFeatures(
        featureRowList,
        inputText,
        featureMetadataField
    ) {
        var filteredFeatures = [];
        var currVal;
        for (var ti = 0; ti < featureRowList.length; ti++) {
            currVal = featureRowList[ti][featureMetadataField];
            if (typeof currVal === "string" && currVal.includes(inputText)) {
                filteredFeatures.push(featureRowList[ti]);
            }
        }
        return filteredFeatures;
    }

    /* Prepares an input array of ranks to use for searching. This is because,
     * in rank searching, users can search for multiple ranks at once if they
     * separate them with a comma, a semicolon, or a space.
     * If a given feature contains any of these ranks, we'll include it in the
     * output of rankFilterFeatures().
     */
    function inputTextToRankArray(inputText) {
        var initialRankArray = inputText
            .trim()
            .replace(/[,;\s]/g, " ")
            .split(" ");
        // Filter out ""s caused by repeated commas or whitespace in the input.
        // Why we need this: "a b   c".split(" ") produces
        // ["a", "b", "", "", "c"] and we just want ["a", "b", "c"]
        return initialRankArray.filter(function(r) {
            return r !== "";
        });
    }

    /* Converts a feature's taxonomy to an array of ranks.
     * Differs from inputTextToRankArray() in that this doesn't split on commas
     * or spaces -- it just splits on semicolons and trims every element in the
     * resulting list, and filters out empty strings.
     *
     * This is obviously a pretty minimal function. If the feature has a
     * taxonomy string that doesn't use semicolons as delimiters, this will
     * fail. (That'll be time for us to update this function, then.)
     *
     * If the input taxonomy isn't a string (i.e. null, undefined, a number,
     * ...), we don't bother trying to find taxonomic ranks in it and just
     * return an empty array.
     */
    function taxonomyToRankArray(taxonomy) {
        if (typeof taxonomy !== "string") {
            return [];
        }
        return taxonomy
            .split(";")
            .map(function(rank) {
                return rank.trim();
            })
            .filter(function(rank) {
                return rank.length > 0;
            });
    }

    /* Returns true if arrayA and arrayB share at least one element.
     *
     * The check is done via === ("strict equality" in JS).
     *
     * Since this returns as soon as a match is found, this should be pretty
     * efficient.
     */
    function existsIntersection(arrayA, arrayB) {
        for (var a = 0; a < arrayA.length; a++) {
            for (var b = 0; b < arrayB.length; b++) {
                if (arrayA[a] === arrayB[b]) {
                    // If we found a match, no need to keep checking.
                    return true;
                }
            }
        }
        return false;
    }

    /* Given a list of feature "rows", a string of input "ranks," and a feature
     * metadata field, returns a list of all features that contain a taxonomic
     * rank that matches a rank in the input.
     *
     * First, we throw the input text through inputTextToRankArray() above to
     * get a list of taxonomic ranks in the input.
     *
     * Next, we go through the features one-by-one. Each feature's value for
     * the specified feature metadata field will be split up by semicolons
     * into an array. We then search for exact matches (not just
     * "does this contain the input text," like in textFilterFeatures(), but
     * "is this exactly equal to the input text?"), and return a list of
     * all features where at least one taxonomic rank matched the input
     * rank(s).
     */
    function rankFilterFeatures(
        featureRowList,
        inputText,
        featureMetadataField
    ) {
        var inputRankArray = inputTextToRankArray(inputText);
        if (inputRankArray.length <= 0) {
            return [];
        }
        var ranksOfFeatureMetadata;
        var filteredFeatures = [];
        for (var ti = 0; ti < featureRowList.length; ti++) {
            ranksOfFeatureMetadata = taxonomyToRankArray(
                featureRowList[ti][featureMetadataField]
            );
            if (existsIntersection(ranksOfFeatureMetadata, inputRankArray)) {
                filteredFeatures.push(featureRowList[ti]);
            }
        }
        return filteredFeatures;
    }

    /* Returns list of feature data objects (in the rank plot JSON) based
     * on a match of a given feature metadata field (including Feature ID)
     * with the input text.
     *
     * If inputText is empty (i.e. its length is 0), this returns an empty
     * array.
     */
    function filterFeatures(
        rankPlotJSON,
        inputText,
        featureMetadataField,
        searchType
    ) {
        if (
            featureMetadataField !== "Feature ID" &&
            rankPlotJSON.datasets.rankratioviz_feature_metadata_ordering.indexOf(
                featureMetadataField
            ) < 0
        ) {
            throw new Error("featureMetadataField not found in data");
        } else if (searchType !== "text" && searchType !== "rank") {
            throw new Error('searchType must be either "text" or "rank"');
        } else if (inputText.trim().length === 0) {
            return [];
        }

        var potentialFeatures = rankPlotJSON.datasets[rankPlotJSON.data.name];
        // We know search type has to be either "rank" or "text" since we
        // checked above
        if (searchType === "rank") {
            return rankFilterFeatures(
                potentialFeatures,
                inputText,
                featureMetadataField
            );
        } else {
            return textFilterFeatures(
                potentialFeatures,
                inputText,
                featureMetadataField
            );
        }
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
    return {
        filterFeatures: filterFeatures,
        computeBalance: computeBalance,
        inputTextToRankArray: inputTextToRankArray,
        taxonomyToRankArray: taxonomyToRankArray,
        existsIntersection: existsIntersection
    };
});
