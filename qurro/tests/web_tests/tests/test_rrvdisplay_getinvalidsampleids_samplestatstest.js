define(["display", "mocha", "chai"], function(display, mocha, chai) {
    // Just the output from the python "matching" integration test
    // prettier-ignore
    var SSTrankPlotJSON = {};
    // prettier-ignore
    var SSTsamplePlotJSON = {};
    // prettier-ignore
    var SSTcountJSON = {};

    describe("Sample dropping stats integration test", function() {
        var rrv, dataName;
        before(async function() {
            rrv = new display.RRVDisplay(
                SSTrankPlotJSON,
                SSTsamplePlotJSON,
                SSTcountJSON
            );
            dataName = rrv.samplePlotJSON.data.name;
            await rrv.makePlots();
        });
        after(async function() {
            await rrv.destroy(true, true, true);
        });
        it("Works properly");
    });
});
