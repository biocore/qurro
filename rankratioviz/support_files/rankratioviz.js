'use strict';
/* This file contains some utility functions for the page, as well as
 * code that implements the "linking" functionality between the
 * rank and sample plots.
 *
 * ssmv.makeRankPlot() and ssmv.makeSamplePlot() were based on the Basic
 * Example in https://github.com/vega/vega-embed/.

/* We use the following "ssmv" namespace for everything here, to avoid
 * cluttering the global namespace (and to avoid potential collisions).
 */
var ssmv = {};
ssmv.rankPlotView = undefined;
ssmv.samplePlotView = undefined;
// NOTE that these JSONs are not changed when their respective plots are.
// However, this is ok: the main reason we keep these around is for the data
// contained within them, which shouldn't change. We only change things that
// we could recompute using the JSON anyway (i.e. the "balance" in the sample
// plot, and the "classification" in the rank plot)
ssmv.rankPlotJSON = {};
ssmv.samplePlotJSON = {};
// Used for selections of log ratios between single taxa (via the rank plot)
ssmv.onHigh = true;
ssmv.newTaxonLow = undefined;
ssmv.newTaxonHigh = undefined;
ssmv.oldTaxonLow = undefined;
ssmv.oldTaxonHigh = undefined;
ssmv.taxonLowCol = undefined;
ssmv.taxonHighCol = undefined;
// For selections of potentially many taxa (not via the rank plot)
ssmv.topTaxa = undefined;
ssmv.botTaxa = undefined;
// We set ssmv.selectMicrobes to undefined when no select microbes file has
// been provided yet.
ssmv.selectMicrobes = undefined;
// Used when looking up a feature's count.
ssmv.feature_col_ids = undefined;
ssmv.feature_cts = undefined;
// Used when searching through features. This will be created from
// ssmv.feature_col_ids.
ssmv.feature_ids = undefined;
// Set when the sample plot JSON is loaded. Used to populate possible sample
// plot x-axis/colorization options.
ssmv.metadataCols = undefined;
// Ordered list of all ranks
ssmv.rankOrdering = undefined;
// Abstracted frequently used long string(s)
ssmv.balance_col = "rankratioviz_balance";


ssmv.addSignalsToSpec = function(spec, signalArray) {
    // Add the signals in signalArray to spec["signals"] if the Vega spec
    // already has signals, or create spec["signals"] if the Vega spec doesn't
    // have any signals yet.
    // Note that this just modifies spec without returning anything.
    if (spec["signals"] === undefined) {
        spec["signals"] = signalArray;
    }
    else {
        for (var s = 0; s < signalArray.length; s++) {
            spec["signals"].push(signalArray[s]);
        }
    }
}

ssmv.addSignalsToSamplePlot = function(vegaSpec) {
    // NOTE: Based on
    // https://vega.github.io/vega/examples/scatter-plot-null-values/
    // and https://beta.observablehq.com/@domoritz/rotating-earth.
    //
    // NOTE that we use the existing x-axis (and color) fields, which are set
    // in the python script to whatever the first sample metadata column is.
    var xSignal = {
        "name": "xAxis",
        "value": vegaSpec["marks"][0]["encode"]["update"]["x"]["field"],
        "bind": {
            "input": "select",
            "options": ssmv.metadataCols
        }
    };
    var colorSignal = {
        "name": "color",
        "value": vegaSpec["marks"][0]["encode"]["update"]["fill"]["field"],
        "bind": {
            "input": "select",
            "options": ssmv.metadataCols
        }
    };
    // Update the actual encodings
    // (this assumes that there will only be one set of marks in the sample
    // plot JSON)
    ssmv.addSignalsToSpec(vegaSpec, [xSignal, colorSignal]);
    vegaSpec["marks"][0]["encode"]["update"]["x"]["field"] = {"signal": "xAxis"};
    vegaSpec["marks"][0]["encode"]["update"]["fill"]["field"] = {"signal": "color"};
    // Update the x-axis / color labels
    // Note that at least with the example Vega plot I'm working with, there
    // are two axes with an "x" scale. We change the one that already has a
    // "title" attribute.
    for (var a = 0; a < vegaSpec["axes"].length; a++) {
        if (vegaSpec["axes"][a]["scale"] === "x") {
            if (vegaSpec["axes"][a]["title"] !== undefined) {
                vegaSpec["axes"][a]["title"] = {"signal": "xAxis"};
                break;
            }
        }
    }
    // Searching in a for loop this way prevents accidentally overwriting other
    // legends for other attributes.
    for (var c = 0; c < vegaSpec["legends"].length; c++) {
        if (vegaSpec["legends"][c]["fill"] === "color")  {
            vegaSpec["legends"][c]["title"] = {"signal": "color"};
            break;
        }
    }
    // Update scales
    for (var s = 0; s < vegaSpec["scales"].length; s++) {
        if (vegaSpec["scales"][s]["name"] === "x") {
            vegaSpec["scales"][s]["domain"]["field"] = {"signal": "xAxis"};
        }
        else if (vegaSpec["scales"][s]["name"] === "color") {
            vegaSpec["scales"][s]["domain"]["field"] = {"signal": "color"};
        }
    }
    return vegaSpec;
};

ssmv.addSignalsToRankPlot = function(vegaSpec) {
    var rankSignal = {
        "name": "rank",
        "value": ssmv.rankOrdering[0],
        "bind": {
            "input": "select",
            "options": ssmv.rankOrdering
        }
    };
    ssmv.addSignalsToSpec(vegaSpec, [rankSignal]);
    vegaSpec["marks"][0]["encode"]["update"]["y"]["field"] = {"signal": "rank"};
    // Update y-axis label
    for (var a = 0; a < vegaSpec["axes"].length; a++) {
        if (vegaSpec["axes"][a]["scale"] === "y") {
            if (vegaSpec["axes"][a]["title"] !== undefined) {
                vegaSpec["axes"][a]["title"] = {"signal": "rank"};
                break;
            }
        }
    }
    // Update y-axis scale
    for (var s = 0; s < vegaSpec["scales"].length; s++) {
        if (vegaSpec["scales"][s]["name"] === "y") {
            vegaSpec["scales"][s]["domain"]["field"] = {"signal": "rank"};
            break;
        }
    }
    return vegaSpec;
};

ssmv.makeRankPlot = function(spec) {
    ssmv.rankOrdering = spec["datasets"]["rankratioviz_rank_ordering"];
    var embedParams = {"actions": false, "patch": ssmv.addSignalsToRankPlot};
    vegaEmbed("#rankPlot", spec, embedParams).then(function(result) {
        ssmv.rankPlotView = result.view;
        // Set callbacks to let users make selections in the ranks plot
        ssmv.rankPlotView.addEventListener("click", function(e, i) {
            if (i !== null && i !== undefined) {
                if (i["mark"]["marktype"] === "rect") {
                    if (ssmv.onHigh) {
                        ssmv.oldTaxonHigh = ssmv.newTaxonHigh;
                        ssmv.newTaxonHigh = i["datum"]["Feature ID"];
                        console.log("Set newTaxonHigh: " +
                            ssmv.newTaxonHigh);
                    }
                    else {
                        ssmv.oldTaxonLow = ssmv.newTaxonLow;
                        ssmv.newTaxonLow = i["datum"]["Feature ID"];
                        console.log("Set newTaxonLow: " +
                            ssmv.newTaxonLow);
                        ssmv.updateSamplePlotSingle();
                    }
                    ssmv.onHigh = !ssmv.onHigh;
                }
            }
        });
        // Change each feature's "x" value in order to resort them based on
        // their new rank value.
        // TODO: it would be simpler to just bind some sort of vega/vega-lite
        // esque sort operation to be done on the rank signal for each
        // feature's x value, rather than doing it manually.
        ssmv.rankPlotView.addSignalListener("rank", function(_, newRank) {
            // Determine active rank, then sort all features by their
            // corresponding ranking. This is done as a procedural change to
            // the "x" value of each feature, analogous to how the balance of
            // each sample is updated in ssmv.changeSamplePlot().
            var dataName = ssmv.rankPlotJSON["data"]["name"];

            // Get a copy of all the feature data in the rank plot. Sort it by
            // each feature's newRank value.
            var featureDataCopy = ssmv.rankPlotJSON["datasets"][dataName].slice();
            featureDataCopy.sort(function(f1, f2) {
                if (parseFloat(f1[newRank]) > parseFloat(f2[newRank]))
                    return 1;
                else if (parseFloat(f1[newRank]) < parseFloat(f2[newRank]))
                    return -1;
                return 0;
            });
            // Use the sorted feature data (featureDataCopy) to make a mapping
            // from feature IDs to their new "x" value -- which is just an
            // integer in the range of [0, number of ranked features) -- which
            // we'll use as the basis for setting each feature's new "x" value.
            // (We can't guarantee the order of traversal during modify()
            // below, which is why we define this as a mapping from the feature
            // ID to its new x value.)
            var featureIDToNewX = {};
            for (var x = 0; x < featureDataCopy.length; x++) {
                featureIDToNewX[featureDataCopy[x]["Feature ID"]] = x;
            }
            // Now, we can just iterate through the rank plot and change each
            // feature accordingly.
            var sortFunc = function() {
                ssmv.rankPlotView.change(dataName, vega.changeset().modify(
                    vega.truthy,
                    "x",
                    function(rankRow) {
                        return featureIDToNewX[rankRow["Feature ID"]];
                    }
                ))
            };
            // NOTE that we use runAfter() instead of run() because, since this
            // is being run from within a signal listener, we're still in the
            // middle of that "dataflow." If we use run() here as well, we get
            // an error about "Dataflow invoked recursively". The docs say to
            // use runAsync() to resolve this, but I can't get that working
            // here. So we're doing this.
            ssmv.samplePlotView.runAfter(sortFunc);
        });
    });
};

ssmv.identifyMetadataColumns = function(samplePlotSpec) {
    // Given a Vega sample plot specification, find all the metadata columns.
    // Just uses whatever the first available sample's keys are as a
    // reference. So, uh, if the input sample plot JSON has zero samples, this
    // will fail. (But that should have been caught in the python script.)
    var dataName = samplePlotSpec["data"]["name"];
    var mdCols = Object.keys(samplePlotSpec["datasets"][dataName][0]);
    if (mdCols.length > 0) {
        return mdCols;
    } else {
        throw new Error("No metadata columns identified. Something seems "
                      + "wrong with the sample plot JSON.");
    }
}

ssmv.makeSamplePlot = function(spec) {
    ssmv.metadataCols = ssmv.identifyMetadataColumns(spec);
    // NOTE: Use of "patch" based on
    // https://beta.observablehq.com/@domoritz/rotating-earth
    var embedParams = {"actions": false, "patch": ssmv.addSignalsToSamplePlot};
    vegaEmbed("#samplePlot", spec, embedParams).then(function(result) {
        ssmv.samplePlotView = result.view;
    });
    var rfci = "rankratioviz_feature_col_ids";
    var rfct = "rankratioviz_feature_counts";
    ssmv.feature_col_ids = ssmv.samplePlotJSON["datasets"][rfci];
    ssmv.feature_ids = Object.keys(ssmv.feature_col_ids);
    ssmv.feature_cts = ssmv.samplePlotJSON["datasets"][rfct];
};

/* Returns list of taxa names based on a match with the inputText.
 *
 * The way this "match" is determined depends on searchType, which can be
 * either "rank" or "text".
 *
 * If searchType is "rank" then this will filter to taxa that contain a rank
 * which exactly matches at least one of the ranks in inputText. (Multiple
 * ranks can be specified by separating them by commas, whitespace, or
 * semicolons.)
 *
 * If searchType is "text" then this will filter to taxa where the inputText is
 * contained somewhere within their name. (This search includes characters like
 * semicolons separating the ranks of a taxon, so those can be used in the
 * inputText to control exactly what is being filtered.)
 *
 * Also: if ssmv.selectMicrobes is not undefined, this will only search for
 * microbes within that list. Otherwise, it searches through all microbes
 * that the sample plot JSON -- and by extension the input BIOM table -- has
 * entries for.
 */
ssmv.filterTaxa = function(inputText, searchType) {
    if (searchType === "rank") {
        // Prepare input array of ranks to use for searching
        var initialRankArray = inputText.trim().replace(/[,;]/g, " ").split(" ");
        // Filter out ""s caused by repeated commas or whitespace in the input.
        // Why we need this: "a b   c".split(" ") produces
        // ["a", "b", "", "", "c"] and we just want ["a", "b", "c"]
        var rankArray = [];
        var r;
        for (var ri = 0; ri < initialRankArray.length; ri++) {
            r = initialRankArray[ri];
            if (r !== "") {
                rankArray.push(r);
            }
        }
    }

    // Prepare array of taxa (we'll split up each taxon's lineage during the
    // below for loop)
    var taxa;
    if (ssmv.selectMicrobes !== undefined) {
        // If a "select microbes" list is available, just search through that.
        taxa = ssmv.selectMicrobes;
    }
    else {
        // If that sort of list isn't available, then search through every
        // microbe mentioned in the BIOM table.
        taxa = ssmv.feature_ids;
    }
    var filteredTaxa = [];
    var taxonomyPart;
    var ranksOfTaxon;
    for (var ti = 0; ti < taxa.length; ti++) {
        if (searchType === "text") {
            // Just use the input text to literally search through taxa for
            // matches (including semicolons corresponding to rank
            // separators, e.g. "Bacteria;Proteobacteria;").
            // Note that this can lead to some weird results if you're not
            // careful -- e.g. just searching on "Staphylococcus" will
            // include Staph phages in the filtering (since their names
            // contain the text "Staphylococcus").
            if (taxa[ti].includes(inputText)) {
                filteredTaxa.push(taxa[ti]);
            }
        }
        else {
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
            taxonomyPart = taxa[ti].split("|")[0];
            ranksOfTaxon = taxonomyPart.split(";");
            // Loop over ranks
            for (var ri2 = 0; ri2 < rankArray.length; ri2++) {
                if (ranksOfTaxon.includes(rankArray[ri2])) {
                    filteredTaxa.push(taxa[ti]);
                }
            }
        }
    }
    return filteredTaxa;
};

/* Given a "row" of the sample plot's JSON for a sample, and given an array of
 * taxa, return the sum of the sample's abundances for those particular taxa.
 * TODO: add option to do log geometric means
 */
ssmv.sumAbundancesForSampleTaxa = function(sampleRow, taxa) {
    var sampleID = sampleRow["Sample ID"];
    var abundance = 0;
    // Figure this out now, so we don't have to do it every step of the loop
    // ALSO: for some reason, getting the value of an input explicitly marked
    // as having type="number" still gives you the number encased in a string.
    // So if you add this value to something without calling parseInt() on it
    // first... then instead of adding 0, you'll add "0", and thereby increase
    // it by an order of magnitude... which is uh yeah that's a thing that I
    // just spent an hour debugging.
    var zfi = parseFloat(document.getElementById("zeroFillInput").value);
    for (var t = 0; t < taxa.length; t++) {
        var colIndex = ssmv.feature_col_ids[taxa[t]];
        var count = ssmv.feature_cts[colIndex][sampleID];
        if (count === 0) {
            abundance += zfi;
        }
        else {
            abundance += count;
        }
    }
    return abundance;
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
ssmv.computeBalance = function(firstTop, firstBot) {
    if (firstTop <= 0 || firstBot <= 0) {
        return NaN;
    }
    return Math.log(firstTop) - Math.log(firstBot);
}

/* Use abundance data to compute the new log ratio ("balance") values of
 * log(high taxon abundance) - log(low taxon abundance) for a given sample.
 *
 * This particular function is for log ratios of two individual taxa that were
 * selected via the rank plot.
 */
ssmv.updateBalanceSingle = function(sampleRow) {
    var sampleID = sampleRow["Sample ID"];
    var topCt = ssmv.feature_cts[ssmv.taxonHighCol][sampleID];
    var botCt = ssmv.feature_cts[ssmv.taxonLowCol][sampleID];
    return ssmv.computeBalance(topCt, botCt);
};

/* Like ssmv.updateBalanceSingle, but considers potentially many taxa in the
 * numerator and denominator of the log ratio (based on ssmv.topTaxa and
 * ssmv.botTaxa). For log ratios generated by textual queries.
 */
ssmv.updateBalanceMulti = function(sampleRow) {
    // NOTE: For multiple taxa Virus/Staphylococcus:
    // test cases in comparison to first scatterplot in Jupyter
    // Notebook: 1517, 1302.
    var firstTop = ssmv.sumAbundancesForSampleTaxa(sampleRow, ssmv.topTaxa);
    var firstBot = ssmv.sumAbundancesForSampleTaxa(sampleRow, ssmv.botTaxa);
    return ssmv.computeBalance(firstTop, firstBot);
};

// Given a "row" of data about a rank, return its new classification depending
// on the new selection that just got made.
ssmv.updateRankColorSingle = function(rankRow) {
    if (rankRow["Feature ID"] === ssmv.newTaxonHigh) {
        if (rankRow["Feature ID"] === ssmv.newTaxonLow) {
            return "Both";
        }
        else {
            return "Numerator";
        }
    }
    else if (rankRow["Feature ID"] === ssmv.newTaxonLow) {
        return "Denominator";
    }
    else {
        return "None";
    }
}

ssmv.updateRankColorMulti = function(rankRow) {
    var inTop = false;
    var inBot = false;
    if (ssmv.topTaxa.indexOf(rankRow["Feature ID"]) >= 0) {
        inTop = true;
    }
    if (ssmv.botTaxa.indexOf(rankRow["Feature ID"]) >= 0) {
        inBot = true;
    }
    if (inTop) {
        if (inBot) {
            return "Both";
        }
        else {
            return "Numerator";
        }
    }
    else if (inBot) {
        return "Denominator";
    }
    else {
        return "None";
    }
}

ssmv.changeSamplePlot = function(updateBalanceFunc, updateRankColorFunc) {
    var dataName = ssmv.samplePlotJSON["data"]["name"];
    ssmv.samplePlotView.change(dataName, vega.changeset().modify(
        /* Calculate the new balance for each sample.
         *
         * For reference, the use of modify() here is based on this comment:
         * https://github.com/vega/vega/issues/1028#issuecomment-334295328
         * (This is where I learned that vega.changeset().modify() existed.)
         * Also, vega.truthy is a utility function: it just returns true.
         */
        vega.truthy,
        ssmv.balance_col,
        // function to run to determine what the new balances are
        updateBalanceFunc
    )).run();
    // Update rank plot based on the new log ratio
    // Storing this within changeSamplePlot() is a (weak) safeguard that
    // changes to the state of the sample plot (at least enacted using the UI
    // controls on the page, not the dev console) also propagate to the rank
    // plot.
    var rankDataName = ssmv.rankPlotJSON["data"]["name"];
    ssmv.rankPlotView.change(rankDataName, vega.changeset().modify(
        vega.truthy,
        "Classification",
        updateRankColorFunc
    )).run();
};

ssmv.updateSamplePlotMulti = function() {
    // Determine how we're going to use the input for searching through taxa
    var topType = document.getElementById("topSearch").value;
    var botType = document.getElementById("botSearch").value;
    var topEnteredText = document.getElementById("topText").value;
    var botEnteredText = document.getElementById("botText").value;
    // Now use these "types" to filter taxa for both parts of the log ratio
    ssmv.topTaxa = ssmv.filterTaxa(topEnteredText, topType);
    ssmv.botTaxa = ssmv.filterTaxa(botEnteredText, botType);
    ssmv.changeSamplePlot(ssmv.updateBalanceMulti, ssmv.updateRankColorMulti);
    // Update taxa text displays
    ssmv.updateTaxaTextDisplays();
};

ssmv.updateSamplePlotSingle = function() {
    if (ssmv.newTaxonLow !== undefined && ssmv.newTaxonHigh !== undefined) {
        if (ssmv.newTaxonLow !== null && ssmv.newTaxonHigh !== null) {
            var lowsDiffer = (ssmv.oldTaxonLow != ssmv.newTaxonLow);
            var highsDiffer = (ssmv.oldTaxonHigh != ssmv.newTaxonHigh);
            if (lowsDiffer || highsDiffer) {
                // Time to update the sample scatterplot regarding new
                // microbes.
                ssmv.taxonLowCol = ssmv.feature_col_ids[ssmv.newTaxonLow];
                ssmv.taxonHighCol = ssmv.feature_col_ids[ssmv.newTaxonHigh];
                ssmv.changeSamplePlot(
                    ssmv.updateBalanceSingle,
                    ssmv.updateRankColorSingle
                );
                ssmv.updateTaxaTextDisplays(true);
            }
        }
    }
};

/* Updates the textareas that list the selected taxa.
 *
 * This defaults to updating based on the "multiple" selections' values. If you
 * pass in a truthy value for the clear argument, this will instead clear these
 * text areas; if you pass in a truthy value for the single argument (and clear
 * is falsy), this will instead update based on the single selection values.
 */
ssmv.updateTaxaTextDisplays = function(single, clear) {
    if (clear) {
        document.getElementById("topTaxaDisplay").value = "";
        document.getElementById("botTaxaDisplay").value = "";
    }
    else if (single) {
        document.getElementById("topTaxaDisplay").value = ssmv.newTaxonHigh;
        document.getElementById("botTaxaDisplay").value = ssmv.newTaxonLow;
    }
    else {
        document.getElementById("topTaxaDisplay").value =
            ssmv.topTaxa.toString().replace(/,/g, "\n");
        document.getElementById("botTaxaDisplay").value =
            ssmv.botTaxa.toString().replace(/,/g, "\n");
    }
}

// Read through the text of a select microbes file (assumed to be just one line
// per microbe) and store it in ssmv.selectMicrobes.
ssmv.parseSelectMicrobesFile = function(fileText) {
    // naive solution
    //ssmv.selectMicrobes = fileText.split("\n");
    ssmv.selectMicrobes = [];
    var currMicrobe = "";
    var currMicrobeTrimmed = "";
    for (var i = 0; i < fileText.length; i++) {
        if (fileText[i] === "\n") {
            currMicrobeTrimmed = currMicrobe.trim();
            if (currMicrobeTrimmed.length > 0) {
                ssmv.selectMicrobes.push(currMicrobeTrimmed);
            }
            currMicrobe = "";
            currMicrobeTrimmed = "";
        }
        else {
            currMicrobe += fileText[i];
        }
    }
    if (ssmv.selectMicrobes.length < 2) {
        alert("Please upload a select microbes file with at least two "
            + "microbes.");
        ssmv.selectMicrobes = undefined;
    }
}

// Based on loadLocalDB() in MetagenomeScope: viewer/index.html
ssmv.uploadSelectMicrobesFile = function() {
    var fr = new FileReader();
    var smFile = document.getElementById("selectMicrobesFileSelector")
                    .files[0];
    if (smFile !== undefined) {
        fr.onload = function(e) {
            if (e.target.readyState === FileReader.DONE) {
                ssmv.parseSelectMicrobesFile(e.target.result);
            }
        }
        fr.readAsText(smFile);
    }
};

// Run on page startup: load and save JSON files, and make plots accordingly
ssmv.loadJSONFiles = function() {
    var jsonsToLoad = ["rank_plot.json", "sample_plot.json"];
    for (var ji = 0; ji < 2; ji++) {
        // Use an XMLHTTPRequest to get JSON for both plots, since we want to
        // hang on to that instead of just passing it to vegaEmbed. See
        // http://www.henryalgus.com/reading-binary-files-using-jquery-ajax/.
        var xhr = new XMLHttpRequest();
        xhr.open("GET", jsonsToLoad[ji]);
        xhr.responseType = "json";
        xhr.onload = function(e) {
            if (this.status === 200) {
                // By the time this function is called, ji is (probably)
                // already 2. So we can't rely on it to figure out the JSON
                // this XHR is for, which is why we check the response URL.
                if (this.responseURL.endsWith("rank_plot.json")) {
                    ssmv.rankPlotJSON = this.response;
                    ssmv.makeRankPlot(this.response);
                }
                else {
                    ssmv.samplePlotJSON = this.response;
                    ssmv.makeSamplePlot(this.response);
                }
            }
        };
        xhr.send();
    }
}
