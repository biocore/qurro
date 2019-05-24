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
});
