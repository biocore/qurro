define(["display", "mocha", "chai"], function (display, mocha, chai) {
    // Just the sample plot from the python "matching" integration test
    // prettier-ignore
    var samplePlotJSON = {"$schema": "https://vega.github.io/schema/vega-lite/v5.20.1.json", "autosize": {"resize": true}, "background": "#FFFFFF", "config": {"axis": {"labelBound": true}, "range": {"category": {"scheme": "tableau10"}, "ramp": {"scheme": "blues"}}, "view": {"continuousHeight": 300, "continuousWidth": 300}}, "data": {"name": "data-7e86bed68a58096f8c231249526ce664"}, "datasets": {"data-7e86bed68a58096f8c231249526ce664": [{"Metadata1": "1", "Metadata2": "2", "Metadata3": "3", "Sample ID": "Sample1", "qurro_balance": null}, {"Metadata1": "4", "Metadata2": "5", "Metadata3": "6", "Sample ID": "Sample2", "qurro_balance": null}, {"Metadata1": "7", "Metadata2": "8", "Metadata3": "9", "Sample ID": "Sample3", "qurro_balance": null}, {"Metadata1": "13", "Metadata2": "14", "Metadata3": "15", "Sample ID": "Sample5", "qurro_balance": null}, {"Metadata1": "16", "Metadata2": "17", "Metadata3": "18", "Sample ID": "Sample6", "qurro_balance": null}, {"Metadata1": "19", "Metadata2": "20", "Metadata3": "21", "Sample ID": "Sample7", "qurro_balance": null}], "qurro_sample_metadata_fields": ["Metadata1", "Metadata2", "Metadata3", "Sample ID"]}, "encoding": {"color": {"field": "Metadata1", "type": "nominal"}, "tooltip": [{"field": "Sample ID", "type": "nominal"}, {"field": "qurro_balance", "type": "quantitative"}], "x": {"axis": {"labelAngle": -45}, "field": "Metadata1", "scale": {"zero": false}, "type": "nominal"}, "y": {"field": "qurro_balance", "scale": {"zero": false}, "title": "Current Natural Log-Ratio", "type": "quantitative"}}, "mark": {"type": "circle"}, "params": [{"bind": "scales", "name": "param_6", "select": {"encodings": ["x", "y"], "type": "interval"}}], "title": "Samples"};
    // badSpec is like samplePlotJSON, but none of the sample points have any
    // metadata fields defined
    var badSpec = JSON.parse(JSON.stringify(samplePlotJSON));
    badSpec.datasets[badSpec.data.name] = [{}, {}, {}, {}, {}, {}];
    describe("Identifying sample IDs in the sample plot JSON", function () {
        it("Properly identifies all sample IDs", function () {
            chai.assert.sameMembers(
                [
                    "Sample1",
                    "Sample2",
                    "Sample3",
                    "Sample5",
                    "Sample6",
                    "Sample7",
                ],
                display.RRVDisplay.identifySampleIDs(samplePlotJSON)
            );
        });
        it("Returns an empty list if no samples in dataset", function () {
            chai.assert.empty(display.RRVDisplay.identifySampleIDs(badSpec));
        });
    });
});
