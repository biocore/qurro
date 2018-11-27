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

ssmv.makeRankPlot = function(spec) {
    vegaEmbed("#rankPlot", spec, {"actions": false}).then(function(result) {
        ssmv.rankPlotView = result.view;
        // Set callbacks to let users make selections in the ranks plot
        ssmv.rankPlotView.addEventListener("click", function(e, i) {
            if (i !== null && i !== undefined) {
                if (i["mark"]["marktype"] === "rect") {
                    if (ssmv.onHigh) {
                        ssmv.oldTaxonHigh = ssmv.newTaxonHigh;
                        ssmv.newTaxonHigh = i["datum"]["index"];
                        console.log("Set newTaxonHigh: " +
                            ssmv.newTaxonHigh);
                    }
                    else {
                        ssmv.oldTaxonLow = ssmv.newTaxonLow;
                        ssmv.newTaxonLow = i["datum"]["index"];
                        console.log("Set newTaxonLow: " +
                            ssmv.newTaxonLow);
                        ssmv.updateSamplePlotSingle();
                    }
                    ssmv.onHigh = !ssmv.onHigh;
                }
            }
        });
    });
};

ssmv.makeSamplePlot = function(spec) {
    vegaEmbed("#samplePlot", spec, {"actions": false}).then(function(result) {
        ssmv.samplePlotView = result.view;
    });
};

// Returns list of taxa names that contain the phrase.
// Note that the phrase can occur anywhere in the taxa name (which includes
// its lineage -- so, at any level).
//
// If ssmv.selectMicrobes is not undefined, this will only search for microbes
// within that list.
//
// If startsWith is true, this will only filter to taxa names that start with
// the phrase (at the first apparent part of their lineage).
//
// endsWith works analogously. (If both startsWith and endsWith are true,
// startsWith takes priority.)
ssmv.filterTaxaByPhrase = function(phrase, startsWith, endsWith) {
    var taxa;
    if (ssmv.selectMicrobes !== undefined) {
        // If a "select microbes" list is available, just search through that.
        taxa = ssmv.selectMicrobes;
    }
    else {
        // If that sort of list isn't available, then search through every
        // microbe mentioned in the sample data.
        taxa = Object.keys(ssmv.samplePlotJSON["datasets"]["col_names"]);
    }
    var filteredTaxa = [];
    for (var ti = 0; ti < taxa.length; ti++) {
        // NOTE this check filters out sample metadata/etc. Everything after
        // position 24 in the col_names dataset (0-indexed) is a taxon.
        // TODO automate this as a data attr saved in JSON by Jupyter Notebook,
        // so that this can successfully ignore arbitrary amounts of metadata.
        if (ssmv.samplePlotJSON["datasets"]["col_names"][taxa[ti]] > 24) {
            if (startsWith) {
                if (taxa[ti].startsWith(phrase)) {
                    filteredTaxa.push(taxa[ti]);
                }
            }
            else if (endsWith) {
                if (taxa[ti].endsWith(phrase)) {
                    filteredTaxa.push(taxa[ti]);
                }
            }
            else {
                if (taxa[ti].includes(phrase)) {
                    filteredTaxa.push(taxa[ti]);
                }
            }
        }
    }
    return filteredTaxa;
};

/* Given a "row" of the sample plot's JSON for a sample, and given an array of
 * taxa, return the sum of the sample's abundances for those particular taxa.
 */
ssmv.sumAbundancesForSampleTaxa = function(sampleRow, taxa) {
    var abundance = 0;
    // Figure this out now, so we don't have to do it every step of the loop
    // ALSO: for some reason, getting the value of an input explicitly marked
    // as having type="number" still gives you the number encased in a string.
    // So if you add this value to something without calling parseInt() on it
    // first... then instead of adding 0, you'll add "0", and thereby increase
    // it by an order of magnitude... which is uh yeah that's a thing that I
    // just spent an hour debugging.
    var zfi = parseFloat($("#zeroFillInput").val());
    for (var t = 0; t < taxa.length; t++) {
        var colIndex = ssmv.samplePlotJSON["datasets"]["col_names"][taxa[t]];
        if (sampleRow[colIndex] === 0) {
            abundance += zfi;
        }
        else {
            abundance += sampleRow[colIndex];
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
    var firstTop = sampleRow[ssmv.taxonHighCol];
    var firstBot = sampleRow[ssmv.taxonLowCol];
    return ssmv.computeBalance(firstTop, firstBot);
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
    if (rankRow["index"] === ssmv.newTaxonHigh) {
        if (rankRow["index"] === ssmv.newTaxonLow) {
            return "Both";
        }
        else {
            return "Numerator";
        }
    }
    else if (rankRow["index"] === ssmv.newTaxonLow) {
        return "Denominator";
    }
    else {
        return "None";
    }
}

ssmv.updateRankColorMulti = function(rankRow) {
    var inTop = false;
    var inBot = false;
    if (ssmv.topTaxa.indexOf(rankRow["index"]) >= 0) {
        inTop = true;
    }
    if (ssmv.botTaxa.indexOf(rankRow["index"]) >= 0) {
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
        // column int for "balance" (this is the column for each
        // sample we want to change)
        ssmv.samplePlotJSON["datasets"]["col_names"]["balance"],
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
        "classification",
        updateRankColorFunc
    )).run();
};

ssmv.updateSamplePlotMulti = function() {
    // Look at search queries for #topSearch and #botSearch, then filter taxa
    // accordingly to produce lists of taxa as ssmv.topTaxa and ssmv.bottomTaxa
    // then modify plot
    var topConstraint = $("#topSearch").val();
    var botConstraint = $("#botSearch").val();
    // TODO abstract this to function that you can call twice (once with
    // topConstraint, ssmv.topTaxa, and "#topText", and next with the
    // bot-versions of that)
    if (topConstraint === "contains") {
        ssmv.topTaxa = ssmv.filterTaxaByPhrase($("#topText").val());
    }
    else if (topConstraint === "startswith") {
        ssmv.topTaxa = ssmv.filterTaxaByPhrase($("#topText").val(), true);
    }
    else if (topConstraint === "endswith") {
        ssmv.topTaxa = ssmv.filterTaxaByPhrase($("#topText").val(), false,
            true);
    }
    if (botConstraint === "contains") {
        ssmv.botTaxa = ssmv.filterTaxaByPhrase($("#botText").val());
    }
    else if (botConstraint === "startswith") {
        ssmv.botTaxa = ssmv.filterTaxaByPhrase($("#botText").val(), true);
    }
    else if (botConstraint === "endswith") {
        ssmv.botTaxa = ssmv.filterTaxaByPhrase($("#botText").val(), false,
            true);
    }
    ssmv.changeSamplePlot(ssmv.updateBalanceMulti, ssmv.updateRankColorMulti);
    // Clear the single-microbe association text to be clearer
    var logRatioDisp = MathJax.Hub.getAllJax("logRatioDisplay")[0];
    MathJax.Hub.Queue(["Text", logRatioDisp, ""]);
};

ssmv.updateSamplePlotSingle = function() {
    if (ssmv.newTaxonLow !== undefined && ssmv.newTaxonHigh !== undefined) {
        if (ssmv.newTaxonLow !== null && ssmv.newTaxonHigh !== null) {
            var lowsDiffer = (ssmv.oldTaxonLow != ssmv.newTaxonLow);
            var highsDiffer = (ssmv.oldTaxonHigh != ssmv.newTaxonHigh);
            if (lowsDiffer || highsDiffer) {
                // Time to update the sample scatterplot regarding new
                // microbes.
                var dataName = ssmv.samplePlotJSON["data"]["name"];

                ssmv.taxonLowCol = ssmv.samplePlotJSON["datasets"]["col_names"][ssmv.newTaxonLow];
                ssmv.taxonHighCol = ssmv.samplePlotJSON["datasets"]["col_names"][ssmv.newTaxonHigh];
                // Update logRatioDisplay re: new log ratio
                var logRatioDisp = MathJax.Hub.getAllJax("logRatioDisplay")[0];
                // \rightarrow can only be used in LaTeX's "math mode," hence
                // why we have to temporarily leave the \text{} environment
                // before using it
                var downLvl = "} \\rightarrow \\text{";
                // We use a regular expression as the pattern to match in
                // .replace() because JS' .replace(), if a string is specified
                // as the pattern to match, only replaces the first occurrence
                // (per the MDN)
                var newEq = "\\log\\bigg(\\frac{\\text{"
                    + ssmv.newTaxonHigh.replace(/;/g, downLvl) + "}}{\\text{"
                    + ssmv.newTaxonLow.replace(/;/g, downLvl) + "}}\\bigg)";
                MathJax.Hub.Queue(["Text", logRatioDisp, newEq]);

                ssmv.changeSamplePlot(
                    ssmv.updateBalanceSingle,
                    ssmv.updateRankColorSingle
                );
            }
        }
    }
};

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
    var smFile = $("#selectMicrobesFileSelector").prop("files")[0];
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
var jsonsToLoad = ["rank_plot.json", "sample_logratio_plot.json"];
for (var ji = 0; ji < 2; ji++) {
    // Use an XMLHTTPRequest to get JSON for both plots, since we want to hang
    // on to that instead of just passing it to vegaEmbed
    // See http://www.henryalgus.com/reading-binary-files-using-jquery-ajax/
    var xhr = new XMLHttpRequest();
    xhr.open("GET", jsonsToLoad[ji]);
    xhr.responseType = "json";
    xhr.onload = function(e) {
        if (this.status === 200) {
            // By the time this function is called, ji is (probably) already 2.
            // So we can't rely on it to figure out the JSON this XHR is for.
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
