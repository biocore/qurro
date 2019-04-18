define(['display',
        'mocha',
        'chai'],
    function(display, mocha, chai) {
        // Just the output from the python "matching" integration test
        // (formatted to be more easily human-readable, and with some
        // unrelated stuff (e.g. feature_col_ids and feature_counts) removed)
        var testSpec = {
            "config": {
                "view": {
                    "width": 400,
                    "height": 300
                }
            },
            "data": {
                "name": "data-de4c87e231d746545e8c9b66113b0ae7"
            },
            "mark": "circle",
            "encoding": {
                "color": {
                    "type": "nominal",
                    "field": "Metadata1"
                },
                "tooltip": [
                    {
                        "type": "nominal",
                        "field": "Sample ID"
                    }
                ],
                "x": {
                    "type": "quantitative",
                    "field": "Metadata1"
                },
                "y": {
                    "type": "quantitative",
                    "field": "rankratioviz_balance",
                    "title": "log(Numerator / Denominator)"
                }
            },
            "title": "Log Ratio of Abundances in Samples",
            "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json",
            "datasets": {
                "data-de4c87e231d746545e8c9b66113b0ae7": [
                    {
                        "Sample ID": "Sample7",
                        "rankratioviz_balance": null,
                        "Metadata1": 19,
                        "Metadata2": 20,
                        "Metadata3": 21
                    },
                    {
                        "Sample ID": "Sample2",
                        "rankratioviz_balance": null,
                        "Metadata1": 4,
                        "Metadata2": 5,
                        "Metadata3": 6
                    },
                    {
                        "Sample ID": "Sample1",
                        "rankratioviz_balance": null,
                        "Metadata1": 1,
                        "Metadata2": 2,
                        "Metadata3": 3
                    },
                    {
                        "Sample ID": "Sample5",
                        "rankratioviz_balance": null,
                        "Metadata1": 13,
                        "Metadata2": 14,
                        "Metadata3": 15
                    },
                    {
                        "Sample ID": "Sample6",
                        "rankratioviz_balance": null,
                        "Metadata1": 16,
                        "Metadata2": 17,
                        "Metadata3": 18
                    },
                    {
                        "Sample ID": "Sample3",
                        "rankratioviz_balance": null,
                        "Metadata1": 7,
                        "Metadata2": 8,
                        "Metadata3": 9
                    }
                ],
                "rankratioviz_feature_col_ids": {},
                "rankratioviz_feature_counts": {}
            }
        };
        // Like testSpec, but none of the sample points have any metadata
        // fields defined
        var badSpec = {
            "config": {
                "view": {
                    "width": 400,
                    "height": 300
                }
            },
            "data": {
                "name": "data-de4c87e231d746545e8c9b66113b0ae7"
            },
            "mark": "circle",
            "encoding": {
                "color": {
                    "type": "nominal",
                },
                "tooltip": [
                    {
                        "type": "nominal",
                        "field": "Sample ID"
                    }
                ],
                "x": {
                    "type": "quantitative",
                    "field": "Metadata1"
                },
                "y": {
                    "type": "quantitative",
                    "field": "rankratioviz_balance",
                    "title": "log(Numerator / Denominator)"
                }
            },
            "title": "Log Ratio of Abundances in Samples",
            "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json",
            "datasets": {
                "data-de4c87e231d746545e8c9b66113b0ae7": [
                    {}, {}, {}, {}, {}, {}
                ],
                "rankratioviz_feature_col_ids": {},
                "rankratioviz_feature_counts": {}
            }
        };
        describe("Identifying sample plot metadata columns",
                 function() {
            it("Properly identifies all metadata columns", function() {
                chai.assert.sameMembers(
                    ["Sample ID", "rankratioviz_balance", "Metadata1",
                     "Metadata2", "Metadata3"],
                    display.RRVDisplay.identifyMetadataColumns(testSpec)
                );
            });
            it("Throws an error when no metadata columns present", function() {
                chai.assert.throws(
                    function() {
                        display.RRVDisplay.identifyMetadataColumns(badSpec);
                    }
                );
            });
        });
    }
);
