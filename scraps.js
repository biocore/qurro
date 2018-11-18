// Based on loadLocalDB() in MetagenomeScope: viewer/index.html
// Used for reading JSON files that the user has uploaded via a file input.
// Now that we're hosting this on a server, we don't need to do this.
ssmv.readJSONFile = function(plotType) {
    var fr = new FileReader();
    var fsID = "rankPlotJSONFileSelector";
    if (plotType === 's') {
        fsID = "samplePlotJSONFileSelector";
    }
    var inFile = document.getElementById(fsID).files[0];
    if (inFile !== undefined) {
        if (inFile.name.toLowerCase().endsWith("json")) {
            fr.onload = function(e) {
                if (e.target.readyState === FileReader.DONE) {
                    var parsedJSON = JSON.parse(e.target.result);
                    var makePlotFunc = ssmv.makeRankPlot;
                    if (plotType === 's') {
                        makePlotFunc = ssmv.makeSamplePlot;
                        // Save this for later, so we can recreate
                        // this plot but with different values
                        ssmv.samplePlotJSON = parsedJSON;
                    }
                    makePlotFunc(parsedJSON);
                }
            }
            fr.readAsText(inFile);
        }
    }
};
