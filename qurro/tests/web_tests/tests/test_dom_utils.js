define(["dom_utils", "mocha", "chai", "testing_utilities"], function(
    dom_utils,
    mocha,
    chai,
    testing_utilities
) {
    describe("Various general DOM utilities", function() {
        /* Returns a list of child values, with optgroups represented in the
         * list as objects mapping the optgroup label to a list of child option
         * values.
         *
         * Sorry this function is kind of gross; adding support for optgroups
         * necessarily made these utility functions a lot less compact than
         * they used to be.
         */
        var getChildValuesFromSelect = function(selectID) {
            var ele = document.getElementById(selectID);
            var outputValues = [];
            var currOptgroupValues, currOptgroupObject;
            var j;
            for (var i = 0; i < ele.children.length; i++) {
                // If this child element is an <optgroup>, we'll need to
                // iterate over *its* children (which should be <option>s) in
                // order to extract their values.
                if (ele.children[i].tagName === "OPTGROUP") {
                    currOptgroupValues = [];
                    for (j = 0; j < ele.children[i].children.length; j++) {
                        currOptgroupValues.push(
                            ele.children[i].children[j].value
                        );
                    }
                    // We have to create currOptgroupObject before adding it to
                    // outputValues. For context, see:
                    // https://stackoverflow.com/a/11508490/10730311
                    currOptgroupObject = {};
                    currOptgroupObject[
                        ele.children[i].label
                    ] = currOptgroupValues;
                    outputValues.push(currOptgroupObject);
                } else {
                    outputValues.push(ele.children[i].value);
                }
            }
            return outputValues;
        };
        var checkIfOptionShouldBeSelected = function(
            optionEle,
            expectedSelectedValue
        ) {
            if (optionEle.value === expectedSelectedValue) {
                chai.assert.isTrue(optionEle.selected);
            } else {
                chai.assert.isFalse(optionEle.selected);
            }
        };
        var assertSelected = function(selectID, expectedSelectedValue) {
            var ele = document.getElementById(selectID);
            var j;
            for (var i = 0; i < ele.children.length; i++) {
                if (ele.children[i].tagName === "OPTGROUP") {
                    for (j = 0; j < ele.children[i].children.length; j++) {
                        checkIfOptionShouldBeSelected(
                            ele.children[i].children[j],
                            expectedSelectedValue
                        );
                    }
                } else {
                    checkIfOptionShouldBeSelected(
                        ele.children[i],
                        expectedSelectedValue
                    );
                }
            }
        };
        describe("Populating a <select> element with options", function() {
            var selectID = "qurro_select_test";
            it("Works properly in the basic case", function() {
                var vals = ["Thing 1", "Thing 2", "asdf"];
                dom_utils.populateSelect(selectID, vals, "asdf");
                chai.assert.sameMembers(
                    getChildValuesFromSelect(selectID),
                    vals
                );
                assertSelected(selectID, "asdf");
            });
            it("Clears the option list when called on an already-populated <select>", function() {
                // We shouldn't see stuff from the previous test (e.g. "Thing 1",
                // "asdf") in the select's options
                var vals = ["Thing 3", "Thing 2"];
                dom_utils.populateSelect(selectID, vals, "Thing 2");
                chai.assert.sameMembers(
                    getChildValuesFromSelect(selectID),
                    vals
                );
                assertSelected(selectID, "Thing 2");
            });
            it("Works properly with only one option", function() {
                var vals = ["lonely string"];
                dom_utils.populateSelect(selectID, vals, "lonely string");
                chai.assert.sameMembers(
                    getChildValuesFromSelect(selectID),
                    vals
                );
                assertSelected(selectID, "lonely string");
            });
            it("Works properly even with weird HTML characters in values", function() {
                var vals = [
                    "value<strong>1</strong>",
                    "value</option></select>",
                    "value &2;",
                    "value<3.>{!$@"
                ];
                dom_utils.populateSelect(selectID, vals, "value &2;");
                chai.assert.sameMembers(
                    getChildValuesFromSelect(selectID),
                    vals
                );
                assertSelected(selectID, "value &2;");
            });
            it("Throws an error when passed an empty list", function() {
                chai.assert.throws(function() {
                    dom_utils.populateSelect(selectID, [], "I'm irrelevant!");
                });
            });
            it("Creates <optgroup>s when optgroupMap is truthy", function() {
                var vals = { g1: ["o1", "o2"], g2: ["o3"] };
                dom_utils.populateSelect(selectID, vals, "o2", true);
                // Check that the select has two optgroups with the correct
                // options
                chai.assert.sameDeepMembers(
                    getChildValuesFromSelect(selectID),
                    [{ g1: ["o1", "o2"] }, { g2: ["o3"] }]
                );
                assertSelected(selectID, "o2");
            });
            it('Creates global options for optgroups labelled "standalone"', function() {
                var vals = {
                    g1: ["o1", "o2"],
                    g2: ["o3"],
                    standalone: ["o4", "o5"]
                };
                dom_utils.populateSelect(selectID, vals, "o3", true);
                chai.assert.sameDeepMembers(
                    getChildValuesFromSelect(selectID),
                    [{ g1: ["o1", "o2"] }, { g2: ["o3"] }, "o4", "o5"]
                );
                assertSelected(selectID, "o3");
            });
        });

        describe("Changing the enabled status of an element", function() {
            it("Properly disables elements", function() {
                dom_utils.changeElementsEnabled(
                    ["qurro_enabled_test", "qurro_enabled_test2"],
                    false
                );
                testing_utilities.assertEnabled("qurro_enabled_test", false);
                testing_utilities.assertEnabled("qurro_enabled_test2", false);
            });
            it("Properly enables elements", function() {
                dom_utils.changeElementsEnabled(
                    ["qurro_enabled_test", "qurro_enabled_test2"],
                    true
                );
                testing_utilities.assertEnabled("qurro_enabled_test", true);
                testing_utilities.assertEnabled("qurro_enabled_test2", true);
            });
        });

        describe("Clearing children of an element", function() {
            it("Works properly on nested elements", function() {
                var currID = "qurro_cleardiv_test";
                dom_utils.clearDiv(currID);
                chai.assert.isEmpty(document.getElementById(currID).children);
                var descendantIDs = [
                    "child",
                    "grandchild",
                    "child2",
                    "grandchild2",
                    "greatgrandchild"
                ];
                for (var c = 0; c < descendantIDs.length; c++) {
                    chai.assert.notExists(
                        document.getElementById(descendantIDs[c])
                    );
                }
            });
            it("Doesn't do anything on empty elements", function() {
                var currID = "qurro_cleardiv_emptyelement";
                dom_utils.clearDiv(currID);
                var ele = document.getElementById(currID);
                chai.assert.exists(ele);
                // Check that it didn't delete the top-level attributes of the
                // element
                chai.assert.equal(ele.getAttribute("sillyparam"), "hi!");
                // And it shouldn't *add* stuff to the div...
                chai.assert.isEmpty(ele.children);
            });
        });

        describe("Setting onchange and onclick element bindings", function() {
            // Silly little test functions
            function give4() {
                return 4;
            }
            function give8() {
                return 8;
            }
            it("Properly sets the onchange attribute", function() {
                var eleList = dom_utils.setUpDOMBindings(
                    { qurro_bindingtest1: give4 },
                    "onchange"
                );
                // Apparently you can just sorta call onchange() directly. See
                // https://stackoverflow.com/a/2856602/10730311.
                chai.assert.equal(
                    document.getElementById(eleList[0]).onchange(),
                    4
                );
            });
            it("Properly sets the onclick attribute", function() {
                var eleList = dom_utils.setUpDOMBindings(
                    { qurro_bindingtest2: give4 },
                    "onclick"
                );
                chai.assert.equal(
                    document.getElementById(eleList[0]).onclick(),
                    4
                );
            });
            it("Works with multiple elements at once", function() {
                var eleList = dom_utils.setUpDOMBindings(
                    { qurro_bindingtest1: give8, qurro_bindingtest3: give4 },
                    "onchange"
                );
                for (var i = 0; i < eleList.length; i++) {
                    if (eleList[i] === "qurro_bindingtest1") {
                        chai.assert.equal(
                            document.getElementById(eleList[i]).onchange(),
                            8
                        );
                    } else {
                        chai.assert.equal(
                            document.getElementById(eleList[i]).onchange(),
                            4
                        );
                    }
                }
            });
        });
        describe("Informing the user re: sample dropping statistics", function() {
            describe('Updating the "main" samples-shown div', function() {
                var htmlSuffix = " currently shown.";
                it("Works properly with normal inputs", function() {
                    dom_utils.updateMainSampleShownDiv(
                        { a: [1, 2, 3], b: [2, 3, 4, 5] },
                        15
                    );
                    chai.assert.equal(
                        document.getElementById("mainSamplesDroppedDiv")
                            .innerHTML,
                        "10 / 15 samples (66.67%)" + htmlSuffix
                    );
                    dom_utils.updateMainSampleShownDiv(
                        { a: [1, 2, 3], b: [4, 5] },
                        5
                    );
                    chai.assert.equal(
                        document.getElementById("mainSamplesDroppedDiv")
                            .innerHTML,
                        "0 / 5 samples (0.00%)" + htmlSuffix
                    );
                    dom_utils.updateMainSampleShownDiv({}, 13);
                    chai.assert.equal(
                        document.getElementById("mainSamplesDroppedDiv")
                            .innerHTML,
                        "13 / 13 samples (100.00%)" + htmlSuffix
                    );
                });

                it("Throws an error if totalSampleCount is 0", function() {
                    chai.assert.throws(function() {
                        dom_utils.updateMainSampleShownDiv({ a: [1, 2, 3] }, 0);
                    });
                    chai.assert.throws(function() {
                        dom_utils.updateMainSampleShownDiv({ a: [] }, 0);
                    });
                    chai.assert.throws(function() {
                        dom_utils.updateMainSampleShownDiv({}, 0);
                    });
                });

                it("Throws an error if droppedSampleCount > totalSampleCount", function() {
                    chai.assert.throws(function() {
                        dom_utils.updateMainSampleShownDiv({ a: [1, 2, 3] }, 2);
                    });
                });

                describe("Computing the size of a union of arrays", function() {
                    it("Works properly with normal inputs", function() {
                        chai.assert.equal(
                            dom_utils.unionSize({
                                a: [1, 2, 3],
                                b: [2, 3, 4, 5]
                            }),
                            5
                        );
                        chai.assert.equal(
                            dom_utils.unionSize({ a: [1, 2, 3], b: [4, 5] }),
                            5
                        );
                        chai.assert.equal(
                            dom_utils.unionSize({
                                a: [1, 2],
                                b: [2, 3, 4, 5],
                                c: [6]
                            }),
                            6
                        );
                        chai.assert.equal(
                            dom_utils.unionSize({
                                a: ["Sample 1", "Sample 2"],
                                b: ["Sample 2", "Sample 3"],
                                c: ["Sample 1"]
                            }),
                            3
                        );
                    });
                    it("Works properly with empty list(s)", function() {
                        chai.assert.equal(
                            dom_utils.unionSize({ a: [], b: [], c: [6] }),
                            1
                        );
                        chai.assert.equal(
                            dom_utils.unionSize({
                                a: ["Sample 1"],
                                b: [],
                                c: ["Sample 2"]
                            }),
                            2
                        );
                        chai.assert.equal(
                            dom_utils.unionSize({ a: [], b: [], c: [] }),
                            0
                        );
                    });
                    it("Works properly with an empty input mapping", function() {
                        chai.assert.equal(dom_utils.unionSize({}), 0);
                    });
                });
            });
            describe("Updating the other sample-dropped divs", function() {
                it('Works properly for the x-axis "reason"', function() {
                    var divID = "xAxisSamplesDroppedDiv";
                    dom_utils.updateSampleDroppedDiv(
                        [1, 2, 3, 4, 5],
                        15,
                        divID,
                        "xAxis",
                        "fieldName"
                    );
                    chai.assert.equal(
                        document.getElementById(divID).innerHTML,
                        "x-axis: 5 / 15 samples (33.33%) " +
                            "can't be shown due to having an invalid " +
                            "fieldName field."
                    );
                    chai.assert.isFalse(
                        document
                            .getElementById(divID)
                            .classList.contains("invisible")
                    );
                });
                it('Works properly for the color "reason"', function() {
                    var divID = "colorSamplesDroppedDiv";
                    dom_utils.updateSampleDroppedDiv(
                        [1, 2],
                        7,
                        divID,
                        "color",
                        "fieldNameC"
                    );
                    chai.assert.equal(
                        document.getElementById(divID).innerHTML,
                        "Color: 2 / 7 samples (28.57%) " +
                            "can't be shown due to having an invalid " +
                            "fieldNameC field."
                    );
                    chai.assert.isFalse(
                        document
                            .getElementById(divID)
                            .classList.contains("invisible")
                    );
                });
                it("Properly escapes weird characters in field names due to use of .textContent instead of .innerHTML", function() {
                    var divID = "colorSamplesDroppedDiv";
                    dom_utils.updateSampleDroppedDiv(
                        [1, 2],
                        7,
                        divID,
                        "color",
                        "weird <p>field!&name;"
                    );
                    chai.assert.equal(
                        document.getElementById(divID).innerHTML,
                        "Color: 2 / 7 samples (28.57%) " +
                            "can't be shown due to having an invalid weird " +
                            "&lt;p&gt;field!&amp;name; field."
                    );
                });
                it('Works properly for the balance "reason"', function() {
                    var divID = "balanceSamplesDroppedDiv";
                    dom_utils.updateSampleDroppedDiv(
                        [1, 2, 3, 4],
                        8,
                        divID,
                        "balance"
                    );
                    chai.assert.equal(
                        document.getElementById(divID).innerHTML,
                        "4 / 8 samples (50.00%) " +
                            "can't be shown due to having an invalid " +
                            "(i.e. containing zero) log ratio."
                    );
                    chai.assert.isFalse(
                        document
                            .getElementById(divID)
                            .classList.contains("invisible")
                    );
                });
                it("Makes the div invisible if the number of dropped samples is 0", function() {
                    var divID = "balanceSamplesDroppedDiv";
                    dom_utils.updateSampleDroppedDiv([], 8, divID, "balance");
                    chai.assert.isTrue(
                        document
                            .getElementById(divID)
                            .classList.contains("invisible")
                    );
                });
                it("Throws an error if totalSampleCount is 0", function() {
                    chai.assert.throws(function() {
                        dom_utils.updateSampleDroppedDiv(
                            [1, 2, 3],
                            0,
                            "xAxisSamplesDroppedDiv",
                            "xAxis",
                            "fieldName"
                        );
                    });
                    chai.assert.throws(function() {
                        dom_utils.updateSampleDroppedDiv(
                            [],
                            0,
                            "xAxisSamplesDroppedDiv",
                            "xAxis",
                            "fieldName"
                        );
                    });
                });

                it("Throws an error if droppedSampleCount > totalSampleCount", function() {
                    chai.assert.throws(function() {
                        dom_utils.updateSampleDroppedDiv(
                            [1, 2, 3],
                            2,
                            "xAxisSamplesDroppedDiv",
                            "xAxis",
                            "fieldName"
                        );
                    });
                });
            });
        });
    });
});
