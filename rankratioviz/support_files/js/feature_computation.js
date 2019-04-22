define(function() {
    /* Returns list of feature IDs based on a match with the inputText.
     *
     * The way this "match" is determined depends on searchType, which can be
     * either "rank" or "text".
     *
     * If searchType is "rank" then this will filter to features that contain a
     * rank which exactly matches at least one of the ranks in inputText. (Multiple
     * ranks can be specified by separating them by commas, whitespace, or
     * semicolons.)
     *
     * If searchType is "text" then this will filter to features where the
     * inputText is contained somewhere within their name. (This search includes
     * characters like semicolons separating the ranks of a taxon, so those can be
     * used in the inputText to control exactly what is being filtered.)
     */
    function filterFeatures(potentialFeatures, inputText, searchType) {
        if (searchType !== "rank" && searchType !== "text") {
            throw new Error('searchType must be either "rank" or "text"');
        }
        // Only used if searchType === "rank"
        var rankArray = [];
        if (searchType === "rank") {
            // Prepare input array of ranks to use for searching
            var initialRankArray = inputText
                .trim()
                .replace(/[,;]/g, " ")
                .split(" ");
            // Filter out ""s caused by repeated commas or whitespace in the input.
            // Why we need this: "a b   c".split(" ") produces
            // ["a", "b", "", "", "c"] and we just want ["a", "b", "c"]
            var r;
            for (var ri = 0; ri < initialRankArray.length; ri++) {
                r = initialRankArray[ri];
                if (r !== "") {
                    rankArray.push(r);
                }
            }
        }

        var filteredFeatures = [];
        var taxonomyPart;
        var ranksOfTaxon;
        for (var ti = 0; ti < potentialFeatures.length; ti++) {
            if (searchType === "text") {
                // Just use the input text to literally search through potentialFeatures for
                // matches (including semicolons corresponding to rank
                // separators, e.g. "Bacteria;Proteobacteria;").
                // Note that this can lead to some weird results if you're not
                // careful -- e.g. just searching on "Staphylococcus" will
                // include Staph phages in the filtering (since their names
                // contain the text "Staphylococcus").
                if (potentialFeatures[ti].includes(inputText)) {
                    filteredFeatures.push(potentialFeatures[ti]);
                }
            } else {
                // Search against individual ranks (separated by semicolons).
                // This only searches against ranks that are indicated in the
                // file, so if there are missing steps (e.g. no genus given)
                // then this can't rectify that.
                //
                // This prevents some of the problems with searching by text --
                // entering "Staphyloccoccus" here will have the intended
                // result. However, the ability to search by text can be
                // powerful, so these functionalities are both provided here
                // for convenience.
                //
                // We make the assumption that each rank for the taxon is
                // separated by a single semicolon, with no trailing or leading
                // whitespace or semicolons. Since as far as I'm aware these
                // files are usually automatically generated, this should be ok
                //
                // If this taxon name includes a | character (used to separate
                // its taxonomy information from things like confidence value
                // or sequence), just get the part before the | and search
                // that. (If there is no | in the taxon name, then this will
                // just search the entire string:
                // "abcdefg".split("|")[0] === "abcdefg")
                taxonomyPart = potentialFeatures[ti].split("|")[0];
                ranksOfTaxon = taxonomyPart.split(";");
                // Loop over ranks
                for (var ri2 = 0; ri2 < rankArray.length; ri2++) {
                    if (ranksOfTaxon.includes(rankArray[ri2])) {
                        filteredFeatures.push(potentialFeatures[ti]);
                    }
                }
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
