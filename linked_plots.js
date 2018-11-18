// Some utility functions for the page, as well as
// code that implements the "linking" functionality between the
// rank and sample plots.

// We use the following "ssmv" namespace for everything here, to avoid
// cluttering the global namespace (and to avoid potential collisions).
// I'll be honest: I named this "ssmv" on Wednesday and I kinda already forgot
// what that stands for. I *think* it could be Songbird Skin Metagenome
// Visualization, but it could also be Sample Scatterplot Microbe Visualization
// or whatever. Uh I'm gonna just ignore this for now.

var ssmv = {};
ssmv.newTaxonLow = undefined;
ssmv.newTaxonHigh = undefined;
ssmv.oldTaxonLow = undefined;
ssmv.oldTaxonHigh = undefined;
// For selections of potentially many taxa (not via the rank plot)
ssmv.topTaxa = undefined;
ssmv.botTaxa = undefined;
ssmv.samplePlotJSON = {};
// We set ssmv.selectMicrobes to undefined when no select microbes file has
// been provided yet.
ssmv.selectMicrobes = undefined;

ssmv.makeRankPlot = function(spec) {
    vegaEmbed("#rankPlot", spec, {"actions": false}).then(function(result) {
        // NOTE ideally we'd update this on dragover (since that'd
        // let us continuously update the scatterplot as we brush
        // the rank plot), but for some reason I can't get that to
        // work. So I'm just using mousedown/mouseup, which works
        // for now (with the stipulation that you need to have
        // mousedown/mouseup be on top of the bar chart).
        //
        // The paradigm of this temporary mechanism is: click down to
        // set the low taxon, release to set high taxon
        result.view.addEventListener("mousedown", function(e, i) {
            if (i !== null && i !== undefined) {
                if (i["mark"]["marktype"] === "rect") {
                    ssmv.oldTaxonLow = ssmv.newTaxonLow;
                    ssmv.newTaxonLow = i["datum"]["index"];
                    console.log("Set newTaxonLow: " +
                        ssmv.newTaxonLow);
                    //ssmv.updateSamplePlotSingle();
                }
            }
        });
        result.view.addEventListener("mouseup", function(e, i) {
            if (i !== null && i !== undefined) {
                if (i["mark"]["marktype"] === "rect") {
                    ssmv.oldTaxonHigh = ssmv.newTaxonHigh;
                    ssmv.newTaxonHigh = i["datum"]["index"];
                    console.log("Set newTaxonHigh: " +
                        ssmv.newTaxonHigh);
                    ssmv.updateSamplePlotSingle();
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

/* Given a "row" of the sample plot's JSON for a sample, and given an array
 * of taxa, return the log of the sum of the sample's abundances for those
 * particular taxa.
 */
ssmv.logSumAbundancesForSampleTaxa = function(sampleRow, taxa) {
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
    return Math.log(abundance);
}

/* Use abundance data to compute the new log ratio ("balance") values of
 * log(high taxon abundance) - log(low taxon abundance) for a given sample.
 */
ssmv.updateBalanceSingle = function(sampleRow) {
    // For single taxa (based on selection that was just made)
    var newTop = Math.log(sampleRow[ssmv.taxonHighCol]);
    var newBot = Math.log(sampleRow[ssmv.taxonLowCol]);

    var newBalance = newTop - newBot;

    //console.log(sampleRow[0] + ", " + newTop + ", " + newBot + ", " + newBalance);
    if (newBalance === Infinity || newBalance === -Infinity || isNaN(newBalance)) {
        // TODO SUPER BAD DON'T KEEP THIS IN INSTEAD FILTER OUT THE
        // POINTS FOR THIS PLOT BY REMOVING AND THEN INSERTING
        // EVERYTHING EVERY TIME YOU RECALCULATE THE
        // SCATTERPLOT
        newBalance = 10;
    }
    return newBalance;
};

ssmv.updateBalanceMulti = function(sampleRow) {

    // NOTE: For multiple taxa (based on the stuff we hardcoded in
    // as virusTaxa and staphTaxa -- should be made automated soon)
    // test cases in comparison to first scatterplot in Jupyter
    // Notebook: 1517, 1302.
    newTop = ssmv.logSumAbundancesForSampleTaxa(sampleRow,
        ssmv.topTaxa);
    newBot = ssmv.logSumAbundancesForSampleTaxa(sampleRow,
        ssmv.botTaxa);
    var newBalance = newTop - newBot;
    if (newBalance === Infinity || newBalance === -Infinity || isNaN(newBalance)) {
        // TODO SUPER BAD DON'T KEEP THIS IN INSTEAD FILTER OUT THE
        // POINTS FOR THIS PLOT BY REMOVING AND THEN INSERTING
        // EVERYTHING EVERY TIME YOU RECALCULATE THE
        // SCATTERPLOT
        newBalance = 10;
    }
    return newBalance;
};

ssmv.changeSamplePlot = function(updateBalanceFunction) {
    // Either modify the scatterplot with the new
    // balances, or make a new JSON data object for the
    // scatterplot with the new balances and just make the
    // scatterplot point to that.
    //
    // Right now we're doing this in-place using modify(), but if needed
    // (due to issues with filtering infinities and NaNs)
    // there shouldn't be a reason we can't just scrap the chart
    // every time it changes. It doesn't take *that* long to draw
    // it. (Alternately, remove every point, update every point,
    // and then insert every point, although that might be a pain
    // slash require calling run() twice. Look into it.)
    //
    // Based on Jeffrey Heer's comment here:
    // https://github.com/vega/vega/issues/1028#issuecomment-334295328
    // (This is where I learned that vega.changeset().modify() existed.)
    var dataName = ssmv.samplePlotJSON["data"]["name"];
    ssmv.samplePlotView.change(dataName, vega.changeset().modify(
        // Vega utility function: just returns true
        vega.truthy,
        // column int for "balance" (this is the column for each
        // sample we want to change)
        ssmv.samplePlotJSON["datasets"]["col_names"]["balance"],
        // function to run to determine what the new balances are
        updateBalanceFunction
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
    ssmv.changeSamplePlot(ssmv.updateBalanceMulti);
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

                ssmv.changeSamplePlot(ssmv.updateBalanceSingle);
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

ssmv.makeRankPlot("rank_plot.json");
// Use an XMLHTTPRequest to get JSON for the sample plot, since we want to hang
// on to the JSON for this file
// Reference: http://www.henryalgus.com/reading-binary-files-using-jquery-ajax/
var xhr = new XMLHttpRequest();
xhr.open("GET", "sample_logratio_plot.json");
xhr.responseType = "json";
xhr.onload = function(e) {
    if (this.status === 200) {
        ssmv.samplePlotJSON = this.response;
        ssmv.makeSamplePlot(ssmv.samplePlotJSON);
    }
};
xhr.send();

// (We can't search the select microbes just quite yet bc
// uploading/saving that hasn't been implemented yet, but we
// copy the lists generated from the jupyter notebook to mimic it here.)
ssmv.virusTaxa = ['Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_G1', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_GH15', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_JD007', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_K', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_MCE_2014', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_P108', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_phiSA012', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_S25_3', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_S25_4', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_Twort', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_vB_SauM_Remus', 'Viruses;Caudovirales;Myoviridae;Twortlikevirus;Staphylococcus_phage_vB_SauM_Romulus', 'Viruses;Caudovirales;Podoviridae;Ahjdlikevirus;Staphylococcus_phage_66', 'Viruses;Caudovirales;Podoviridae;Ahjdlikevirus;Staphylococcus_phage_GRCS', 'Viruses;Caudovirales;Podoviridae;Ahjdlikevirus;Staphylococcus_phage_P68', 'Viruses;Caudovirales;Podoviridae;Ahjdlikevirus;Staphylococcus_phage_SAP_2', 'Viruses;Caudovirales;Podoviridae;Staphylococcus_phage_S24_1', 'Viruses;Caudovirales;Siphoviridae;3alikevirus;Staphylococcus_phage_3A', 'Viruses;Caudovirales;Siphoviridae;3alikevirus;Staphylococcus_phage_42E', 'Viruses;Caudovirales;Siphoviridae;3alikevirus;Staphylococcus_phage_47', 'Viruses;Caudovirales;Siphoviridae;3alikevirus;Staphylococcus_phage_Ipla35', 'Viruses;Caudovirales;Siphoviridae;3alikevirus;Staphylococcus_phage_Slt', 'Viruses;Caudovirales;Siphoviridae;77likevirus;Staphylococcus_phage_13', 'Viruses;Caudovirales;Siphoviridae;77likevirus;Staphylococcus_phage_77', 'Viruses;Caudovirales;Siphoviridae;77likevirus;Staphylococcus_phage_Pvl108', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_187', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_29', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_37', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_52A', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_53', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_55', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_69', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_71', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_85', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_88', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_92', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_96', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_CNPH82', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_EW', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_Ipla5', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_Ipla7', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_Ipla88', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_PH15', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_phiETA', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_phiETA2', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_phiETA3', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_phiMR11', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_phiMR25', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_Sap26', 'Viruses;Caudovirales;Siphoviridae;Phietalikevirus;Staphylococcus_phage_X2', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_2638A', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_6ec', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_DW2', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_JS01', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_P954', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_phi5967PVL', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_phi7401PVL', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_phiN315', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_phiNM', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_phiNM3', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_phiRS7', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_phiSa119', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_SA12', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_SA13', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_SMSAP5', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_SpaA1', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_StauST398_1', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_StauST398_2', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_StauST398_3', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_StauST398_4', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_StauST398_5', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_StB12', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_StB20', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_StB27', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_TEM123', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_vB_SepS_SEP9', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_phage_YMC_09_04_R1988', 'Viruses;Caudovirales;Siphoviridae;Staphylococcus_prophage_phiPV83', 'Viruses;Caudovirales;Staphylococcus_phage_SA11', 'Viruses;Staphylococcus_phage_phi2958PVL', 'Viruses;Staphylococcus_phage_phiPVL_CN125', 'Viruses;Staphylococcus_phage_PT1028', 'Viruses;Staphylococcus_phage_ROSA', 'Viruses;Staphylococcus_phage_tp310_3'];
ssmv.staphTaxa = ["Bacteria;Firmicutes;Bacilli;Bacillales;Staphylococcaceae;Staphylococcus;Staphylococcus_aureus", "Bacteria;Firmicutes;Bacilli;Bacillales;Staphylococcaceae;Staphylococcus;Staphylococcus_epidermidis", "Bacteria;Firmicutes;Bacilli;Bacillales;Staphylococcaceae;Staphylococcus;Staphylococcus_hominis", "Bacteria;Firmicutes;Bacilli;Bacillales;Staphylococcaceae;Staphylococcus;Staphylococcus_capitis"];
