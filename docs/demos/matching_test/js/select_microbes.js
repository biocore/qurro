// NOTE: This is old code for an old, currently unsupported feature.
// Eventually I'll probably take the time to get it working with the refactored
// code, but no guarantees.
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
        } else {
            currMicrobe += fileText[i];
        }
    }
    if (ssmv.selectMicrobes.length < 2) {
        alert(
            "Please upload a select microbes file with at least two " +
                "microbes."
        );
        ssmv.selectMicrobes = undefined;
    }
};

// Based on loadLocalDB() in MetagenomeScope: viewer/index.html
ssmv.uploadSelectMicrobesFile = function() {
    var fr = new FileReader();
    var smFile = document.getElementById("selectMicrobesFileSelector").files[0];
    if (smFile !== undefined) {
        fr.onload = function(e) {
            if (e.target.readyState === FileReader.DONE) {
                ssmv.parseSelectMicrobesFile(e.target.result);
            }
        };
        fr.readAsText(smFile);
    }
};
