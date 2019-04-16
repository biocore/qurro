/* This file contains most of the code that manages the details of a
 * rankratioviz visualization.
 *
 * RRVDisplay.makeRankPlot() and RRVDisplay.makeSamplePlot() were based on the
 * Basic Example in https://github.com/vega/vega-embed/.
 */
define(["./feature_computation"], function(feature_computation) {
    class RRVDisplay {
        constructor(rankPlotJSON, samplePlotJSON) {
            // Used for selections of log ratios between single taxa (via the rank plot)
            this.onHigh = true;
            this.newTaxonLow = undefined;
            this.newTaxonHigh = undefined;
            this.oldTaxonLow = undefined;
            this.oldTaxonHigh = undefined;
            this.taxonLowCol = undefined;
            this.taxonHighCol = undefined;
    
            // For selections of potentially many taxa (not via the rank plot)
            this.topTaxa = undefined;
            this.botTaxa = undefined;
    
            // Used when looking up a feature's count.
            this.feature_col_ids = undefined;
            this.feature_cts = undefined;
    
            // Used when searching through features. This will be created from
            // this.feature_col_ids.
            this.feature_ids = undefined;
    
            // Set when the sample plot JSON is loaded. Used to populate possible sample
            // plot x-axis/colorization options.
            this.metadataCols = undefined;
    
            // Ordered list of all ranks
            this.rankOrdering = undefined;
    
            this.rankPlotView = undefined;
            this.samplePlotView = undefined;
    
            // Actually create the visualization
            this.rankPlotJSON = rankPlotJSON;
            this.samplePlotJSON = samplePlotJSON;
            this.makePlots();

            // Set up relevant DOM bindings
            var display = this;
            document.getElementById("multiFeatureButton").onclick = function() {
                display.updateSamplePlotMulti();
            }
        }
    
        makePlots() {
            this.makeRankPlot();
            this.makeSamplePlot();
        }
    
        makeRankPlot() {
            this.rankOrdering =
                this.rankPlotJSON.datasets.rankratioviz_rank_ordering;
            var parentDisplay = this;
            var embedParams = {"actions": false,
                               "patch": function(vegaSpec) {
                                    return RRVDisplay.addSignalsToRankPlot(parentDisplay, vegaSpec);
                               }};
            // We can use a closure to allow callback functions to access "this"
            // (and thereby change the properties of instances of the RRVDisplay
            // class). See https://stackoverflow.com/a/5106369/10730311.
            vegaEmbed("#rankPlot", this.rankPlotJSON, embedParams).then(function(result) {
                parentDisplay.rankPlotView = result.view;
                parentDisplay.addClickEventToRankPlotView(parentDisplay);
                parentDisplay.addRankSortingToRankPlotView(parentDisplay);
            });
        }
    
        addClickEventToRankPlotView(display) {
            // Set callbacks to let users make selections in the ranks plot
            display.rankPlotView.addEventListener("click", function(e, i) {
                if (i !== null && i !== undefined) {
                    if (i["mark"]["marktype"] === "rect") {
                        if (display.onHigh) {
                            display.oldTaxonHigh = display.newTaxonHigh;
                            display.newTaxonHigh = i["datum"]["Feature ID"];
                            console.log("Set newTaxonHigh: " +
                                display.newTaxonHigh);
                        }
                        else {
                            display.oldTaxonLow = display.newTaxonLow;
                            display.newTaxonLow = i["datum"]["Feature ID"];
                            console.log("Set newTaxonLow: " +
                                display.newTaxonLow);
                            display.updateSamplePlotSingle();
                        }
                        display.onHigh = !display.onHigh;
                    }
                }
            });
        }
    
        // Change each feature's "x" value in order to resort them based on
        // their new rank value.
        addRankSortingToRankPlotView(display) {
            // TODO: it would be simpler to just bind some sort of vega/vega-lite
            // esque sort operation to be done on the rank signal for each
            // feature's x value, rather than doing it manually.
            display.rankPlotView.addSignalListener("rank", function(_, newRank) {
                // Determine active rank, then sort all features by their
                // corresponding ranking. This is done as a procedural change to
                // the "x" value of each feature, analogous to how the balance of
                // each sample is updated in display.changeSamplePlot().
                var dataName = display.rankPlotJSON["data"]["name"];
    
                // Get a copy of all the feature data in the rank plot. Sort it by
                // each feature's newRank value.
                var featureDataCopy = display.rankPlotJSON["datasets"][dataName].slice();
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
                    display.rankPlotView.change(dataName, vega.changeset().modify(
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
                // here. So we're doing display.
                display.samplePlotView.runAfter(sortFunc);
            });
        }
    
        makeSamplePlot() {
            this.metadataCols = RRVDisplay.identifyMetadataColumns(this.samplePlotJSON);
            // NOTE: Use of "patch" based on
            // https://beta.observablehq.com/@domoritz/rotating-earth
            var parentDisplay = this;
            var embedParams = {"actions": false, "patch": function(vegaSpec) {
                                return RRVDisplay.addSignalsToSamplePlot(parentDisplay, vegaSpec);
                                }};
            vegaEmbed("#samplePlot", this.samplePlotJSON, embedParams).then(function(result) {
                parentDisplay.samplePlotView = result.view;
            });
            var rfci = "rankratioviz_feature_col_ids";
            var rfct = "rankratioviz_feature_counts";
            this.feature_col_ids = this.samplePlotJSON["datasets"][rfci];
            this.feature_ids = Object.keys(this.feature_col_ids);
            this.feature_cts = this.samplePlotJSON["datasets"][rfct];
        };
    
        // Given a "row" of data about a rank, return its new classification depending
        // on the new selection that just got made.
        updateRankColorSingle(rankRow) {
            if (rankRow["Feature ID"] === this.newTaxonHigh) {
                if (rankRow["Feature ID"] === this.newTaxonLow) {
                    return "Both";
                }
                else {
                    return "Numerator";
                }
            }
            else if (rankRow["Feature ID"] === this.newTaxonLow) {
                return "Denominator";
            }
            else {
                return "None";
            }
        }
        
        updateRankColorMulti(rankRow) {
            var inTop = false;
            var inBot = false;
            if (this.topTaxa.indexOf(rankRow["Feature ID"]) >= 0) {
                inTop = true;
            }
            if (this.botTaxa.indexOf(rankRow["Feature ID"]) >= 0) {
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
        
        changeSamplePlot(updateBalanceFunc, updateRankColorFunc) {
            var dataName = this.samplePlotJSON["data"]["name"];
            var parentDisplay = this;
            this.samplePlotView.change(dataName, vega.changeset().modify(
                /* Calculate the new balance for each sample.
                 *
                 * For reference, the use of modify() here is based on this comment:
                 * https://github.com/vega/vega/issues/1028#issuecomment-334295328
                 * (This is where I learned that vega.changeset().modify() existed.)
                 * Also, vega.truthy is a utility function: it just returns true.
                 */
                vega.truthy,
                "rankratioviz_balance",
                // function to run to determine what the new balances are
                function(sampleRow) {
                    updateBalanceFunc.call(parentDisplay, sampleRow);
                }
            )).run();
            // Update rank plot based on the new log ratio
            // Storing this within changeSamplePlot() is a (weak) safeguard that
            // changes to the state of the sample plot (at least enacted using the UI
            // controls on the page, not the dev console) also propagate to the rank
            // plot.
            var rankDataName = this.rankPlotJSON["data"]["name"];
            this.rankPlotView.change(rankDataName, vega.changeset().modify(
                vega.truthy,
                "Classification",
                function(rankRow) {
                    updateRankColorFunc.call(parentDisplay, rankRow);
                }
            )).run();
        };
        
        updateSamplePlotMulti() {
            // Determine how we're going to use the input for searching through
            // features
            var topType = document.getElementById("topSearch").value;
            var botType = document.getElementById("botSearch").value;
            var topEnteredText = document.getElementById("topText").value;
            var botEnteredText = document.getElementById("botText").value;
            // Now use these "types" to filter features for both parts of the log ratio
            this.topTaxa = feature_computation.filterFeatures(
                this.feature_ids, topEnteredText, topType
            );
            this.botTaxa = feature_computation.filterFeatures(
                this.feature_ids, botEnteredText, botType
            );
            this.changeSamplePlot(this.updateBalanceMulti, this.updateRankColorMulti);
            // Update taxa text displays
            this.updateTaxaTextDisplays();
        };
        
        updateSamplePlotSingle() {
            if (this.newTaxonLow !== undefined && this.newTaxonHigh !== undefined) {
                if (this.newTaxonLow !== null && this.newTaxonHigh !== null) {
                    var lowsDiffer = (this.oldTaxonLow != this.newTaxonLow);
                    var highsDiffer = (this.oldTaxonHigh != this.newTaxonHigh);
                    if (lowsDiffer || highsDiffer) {
                        // Time to update the sample scatterplot regarding new
                        // microbes.
                        this.taxonLowCol = this.feature_col_ids[this.newTaxonLow];
                        this.taxonHighCol = this.feature_col_ids[this.newTaxonHigh];
                        this.changeSamplePlot(
                            this.updateBalanceSingle,
                            this.updateRankColorSingle
                        );
                        this.updateTaxaTextDisplays(true);
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
        updateTaxaTextDisplays(single, clear) {
            if (clear) {
                document.getElementById("topTaxaDisplay").value = "";
                document.getElementById("botTaxaDisplay").value = "";
            }
            else if (single) {
                document.getElementById("topTaxaDisplay").value = this.newTaxonHigh;
                document.getElementById("botTaxaDisplay").value = this.newTaxonLow;
            }
            else {
                document.getElementById("topTaxaDisplay").value =
                    this.topTaxa.toString().replace(/,/g, "\n");
                document.getElementById("botTaxaDisplay").value =
                    this.botTaxa.toString().replace(/,/g, "\n");
            }
        }
    
        static addSignalsToSpec(spec, signalArray) {
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
        
        static addSignalsToSamplePlot(display, vegaSpec) {
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
                    "options": display.metadataCols
                }
            };
            var colorSignal = {
                "name": "color",
                "value": vegaSpec["marks"][0]["encode"]["update"]["fill"]["field"],
                "bind": {
                    "input": "select",
                    "options": display.metadataCols
                }
            };
            // Update the actual encodings
            // (this assumes that there will only be one set of marks in the sample
            // plot JSON)
            RRVDisplay.addSignalsToSpec(vegaSpec, [xSignal, colorSignal]);
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
        
        static addSignalsToRankPlot(display, vegaSpec) {
            var rankSignal = {
                "name": "rank",
                "value": display.rankOrdering[0],
                "bind": {
                    "input": "select",
                    "options": display.rankOrdering
                }
            };
            RRVDisplay.addSignalsToSpec(vegaSpec, [rankSignal]);
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
    
        static identifyMetadataColumns(samplePlotSpec) {
            // Given a Vega-Lite sample plot specification, find all the metadata cols.
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
    
        /* Given a "row" of the sample plot's JSON for a sample, and given an array of
         * features, return the sum of the sample's abundances for those particular features.
         * TODO: add option to do log geometric means
         */
        sumAbundancesForSampleFeatures(sampleRow, features) {
            var sampleID = sampleRow["Sample ID"];
            var abundance = 0;
            for (var t = 0; t < features.length; t++) {
                var colIndex = this.feature_col_ids[features[t]];
                abundance += this.feature_cts[colIndex][sampleID];
            }
            return abundance;
        }
    
        /* Use abundance data to compute the new log ratio ("balance") values of
         * log(high taxon abundance) - log(low taxon abundance) for a given sample.
         *
         * This particular function is for log ratios of two individual taxa that were
         * selected via the rank plot.
         */
        updateBalanceSingle(sampleRow) {
            var sampleID = sampleRow["Sample ID"];
            var topCt = this.feature_cts[this.taxonHighCol][sampleID];
            var botCt = this.feature_cts[this.taxonLowCol][sampleID];
            return feature_computation.computeBalance(topCt, botCt);
        };
        
        /* Like updateBalanceSingle, but considers potentially many taxa in the
         * numerator and denominator of the log ratio. For log ratios generated
         * by textual queries.
         */
        updateBalanceMulti(sampleRow) {
            // NOTE: For multiple taxa Virus/Staphylococcus:
            // test cases in comparison to first scatterplot in Jupyter
            // Notebook: 1517, 1302.
            var topCt = this.sumAbundancesForSampleFeatures(sampleRow, this.topTaxa);
            var botCt = this.sumAbundancesForSampleFeatures(sampleRow, this.botTaxa);
            return feature_computation.computeBalance(topCt, botCt);
        };
    }

    return {"RRVDisplay": RRVDisplay};
});
