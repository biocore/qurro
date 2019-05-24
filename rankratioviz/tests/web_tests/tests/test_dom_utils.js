define(["dom_utils", "mocha", "chai"], function(dom_utils, mocha, chai) {
    var getChildValuesFromSelect = function(selectID) {
        var ele = document.getElementById(selectID);
        var outputValues = [];
        for (var i = 0; i < ele.children.length; i++) {
            outputValues.push(ele.children[i].value);
        }
        return outputValues;
    };
    var assertSelected = function(selectID, expectedSelectedValue) {
        var ele = document.getElementById(selectID);
        for (var i = 0; i < ele.children.length; i++) {
            if (ele.children[i].value === expectedSelectedValue) {
                chai.assert.isTrue(ele.children[i].selected);
            } else {
                chai.assert.isFalse(ele.children[i].selected);
            }
        }
    };
    describe("Populating a <select> element with options", function() {
        var selectID = "qurro_select_test";
        it("Works properly in the basic case", function() {
            var vals = ["Thing 1", "Thing 2", "asdf"];
            dom_utils.populateSelect(selectID, vals, "asdf");
            chai.assert.sameMembers(getChildValuesFromSelect(selectID), vals);
            assertSelected(selectID, "asdf");
        });
        it("Clears the option list when called on an already-populated <select>", function() {
            // We shouldn't see stuff from the previous test (e.g. "Thing 1",
            // "asdf") in the select's options
            var vals = ["Thing 3", "Thing 2"];
            dom_utils.populateSelect(selectID, vals, "Thing 2");
            chai.assert.sameMembers(getChildValuesFromSelect(selectID), vals);
            assertSelected(selectID, "Thing 2");
        });
        it("Works properly with only one option", function() {
            var vals = ["lonely string"];
            dom_utils.populateSelect(selectID, vals, "lonely string");
            chai.assert.sameMembers(getChildValuesFromSelect(selectID), vals);
            assertSelected(selectID, "lonely string");
        });
        it("Throws an error when passed an empty list", function() {
            chai.assert.throws(function() {
                dom_utils.populateSelect(selectID, [], "I'm irrelevant!");
            });
        });
    });

    var assertEnabled = function(selectID, isEnabled) {
        var ele = document.getElementById(selectID);
        if (!isEnabled) {
            chai.assert.isTrue(ele.disabled);
        } else {
            chai.assert.isFalse(ele.disabled);
        }
    };

    describe("Changing the enabled status of an element", function() {
        it("Properly disables elements", function() {
            dom_utils.changeElementsEnabled(
                ["qurro_enabled_test", "qurro_enabled_test2"],
                false
            );
            assertEnabled("qurro_enabled_test", false);
            assertEnabled("qurro_enabled_test2", false);
        });
        it("Properly enables elements", function() {
            dom_utils.changeElementsEnabled(
                ["qurro_enabled_test", "qurro_enabled_test2"],
                true
            );
            assertEnabled("qurro_enabled_test", true);
            assertEnabled("qurro_enabled_test2", true);
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
});
