/* This file contains some methods for manipulating DOM elements in a
 * client-side web interface.
 */
define(["vega"], function(vega) {
    /* Assigns DOM bindings to elements.
     *
     * If eventHandler is set to "onchange", this will update the onchange
     * event handler for these elements. Otherwise, this will update the
     * onclick event handler.
     */
    function setUpDOMBindings(elementID2function, eventHandler) {
        var elementIDs = Object.keys(elementID2function);
        var currID;
        for (var i = 0; i < elementIDs.length; i++) {
            currID = elementIDs[i];
            if (eventHandler === "onchange") {
                document.getElementById(currID).onchange =
                    elementID2function[currID];
            } else {
                document.getElementById(currID).onclick =
                    elementID2function[currID];
            }
        }
        return elementIDs;
    }

    /* Populates a <select> DOM element with a list of options.
     *
     * This will remove any options already present in the <select> first.
     */
    function populateSelect(selectID, optionList, defaultVal) {
        if (optionList.length <= 0) {
            throw new Error("optionList must have at least one value");
        }
        var optionEle;
        var selectEle = document.getElementById(selectID);
        // Remove any options already present in the <select>
        clearDiv(selectID);
        for (var m = 0; m < optionList.length; m++) {
            optionEle = document.createElement("option");
            optionEle.value = optionEle.text = optionList[m];
            selectEle.appendChild(optionEle);
        }
        // Set the default value of the <select>. Note that we escape this
        // value in quotes, just in case it contains a period or some other
        // character(s) that would mess up the querySelector.
        selectEle.querySelector(
            'option[value = "' + defaultVal + '"]'
        ).selected = true;
    }

    /* Given a list of element IDs and a boolean, changes the elements'
     * "disabled" attribute to false (if enable is true) and changes the
     * attribute to true if enable is false.
     *
     * ...So this just sets the disabled attribute to !enable.
     */
    function changeElementsEnabled(elements, enable) {
        for (var e = 0; e < elements.length; e++) {
            document.getElementById(elements[e]).disabled = !enable;
        }
    }

    /* Removes all of the child elements of an element.
     *
     * This function is based on
     * https://stackoverflow.com/a/3450726/10730311.
     * This way is apparently faster than just using
     * document.getElementById(divID).innerHTML = "".
     */
    function clearDiv(divID) {
        var element = document.getElementById(divID);
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /* Updates a <div> regarding how many samples have been dropped for a given
     * reason.
     *
     * numDroppedSamples: a list of sample IDs that have been dropped for
     * some reason.
     *  If the length of this is 0, then the <div> will be hidden.
     *  If the length of this is > 0, then the <div> will be un-hidden if
     *  it's currently hidden. (We define a "hidden" element as one that has
     *  the "invisible" CSS class.)
     *
     * totalSampleCount: an integer corresponding to the total number of
     * samples in this Qurro visualization.
     *  This will throw an error if totalSampleCount is 0, or if the number
     *  of dropped samples is greater than totalSampleCount.
     *
     * divID: the ID of the <div> we're updating
     *
     * dropType: This defines the reason we'll include in the <div> indicating
     * why samples have been dropped.
     *  If this is "balance", the reason will be "an undefined log ratio."
     *  If this is "xAxis" or "color", the reason will be
     *  "a non-quantitative {f} field."
     *      ({f} will be replaced with whatever the optional field argument
     *      is.)
     */
    function updateSampleDroppedDiv(
        droppedSampleIDList,
        totalSampleCount,
        divID,
        dropType,
        field
    ) {
        var numDroppedSamples = droppedSampleIDList.length;
        validateSampleCounts(numDroppedSamples, totalSampleCount);

        // Only bother updating the <div>'s text if we're actually going to be
        // dropping samples for this "reason" -- i.e. numDroppedSamples > 0.
        if (numDroppedSamples > 0) {
            var prefix = "";
            if (dropType === "xAxis") {
                prefix = "x-axis: ";
            } else if (dropType === "color") {
                prefix = "Color: ";
            }
            // Show the percentage of samples that have to be dropped due to
            // this reason.
            var percentage = 100 * (numDroppedSamples / totalSampleCount);

            // Figure out the reason we'll be displaying as a justification for
            // why at least this many samples have to be dropped.
            var reason = "(invalid reason given)";
            if (dropType === "balance") {
                reason = "an invalid (i.e. containing zero) log ratio.";
            } else if (dropType === "xAxis" || dropType === "color") {
                reason = "an invalid " + field + " field.";
            }

            // We use textContent instead of innerHTML here because of the
            // reason variable, which includes field, which in turn could
            // conceivably include things like "</div>" that would mess up the
            // formatting.
            document.getElementById(divID).textContent =
                prefix +
                String(numDroppedSamples) +
                " / " +
                String(totalSampleCount) +
                " samples (" +
                String(percentage.toFixed(2)) +
                "%)" +
                " can't be shown due to having " +
                reason;
            document.getElementById(divID).classList.remove("invisible");
        } else {
            document.getElementById(divID).classList.add("invisible");
        }
    }

    /* Given an object where each of the values is an array, computes the
     * union of all of these arrays and returns the length of the
     * union.
     *
     * Example usages:
     * unionSize({"a": [1,2,3], "b": [2,3,4,5]}) === 5
     * unionSize({"a": [1,2,3], "b": [4,5]}) === 5
     * unionSize({"a": [1,2], "b": [2,3,4,5], "c": [6]}) === 6
     * unionSize({"a": [], "b": [], "c": [6]}) === 1
     */
    function unionSize(mappingToArrays) {
        var keys = Object.keys(mappingToArrays);
        // Construct totalArray, which is just every array in mappingToArrays
        // concatenated. For the first example usage above, this would just be
        // something like [1,2,3,2,3,4,5].
        var totalArray = [];
        for (var k = 0; k < keys.length; k++) {
            totalArray = totalArray.concat(mappingToArrays[keys[k]]);
        }
        // Now that we have totalArray, we use vega.toSet() to convert it to a
        // mapping where each unique value in totalArray is a key. (See
        // https://vega.github.io/vega/docs/api/util/#toSet.) Taking the length
        // of the keys of this mapping gives us the "union size" we need.
        return Object.keys(vega.toSet(totalArray)).length;
    }

    function validateSampleCounts(droppedSampleCount, totalSampleCount) {
        if (totalSampleCount === 0) {
            throw new Error("# total samples cannot be 0");
        } else if (droppedSampleCount > totalSampleCount) {
            throw new Error("# dropped samples must be <= # total samples");
        }
    }

    /* Updates a given <div> re: total # of samples shown.
     *
     * Sort of like the opposite of updateSampleDroppedDiv().
     *
     * Note that this will throw an error if totalSampleCount is 0 and/or if
     * the total number of dropped samples is greater than totalSampleCount.
     *
     * divID is an optional argument -- if not provided, it'll default to
     * "mainSamplesDroppedDiv".
     */
    function updateMainSampleShownDiv(droppedSamples, totalSampleCount, divID) {
        // compute union of all lists in droppedSamples. the length of
        // that is numSamplesShown.
        var droppedSampleCount = unionSize(droppedSamples);
        validateSampleCounts(droppedSampleCount, totalSampleCount);

        var numSamplesShown = totalSampleCount - unionSize(droppedSamples);
        var divIDInUse = divID === undefined ? "mainSamplesDroppedDiv" : divID;

        var percentage = 100 * (numSamplesShown / totalSampleCount);
        document.getElementById(divIDInUse).textContent =
            String(numSamplesShown) +
            " / " +
            String(totalSampleCount) +
            " samples (" +
            String(percentage.toFixed(2)) +
            "%) currently shown.";
        // Just in case this div was set to invisible (i.e. this is the first
        // time it's been updated).
        document.getElementById(divIDInUse).classList.remove("invisible");
    }

    /* Downloads a string (either plain text or already a data URI) defining
     * the contents of a file.
     *
     * This is done by using a "downloadHelper" <a> tag.
     *
     * This function was based on downloadDataURI() in the MetagenomeScope
     * viewer interface source code.
     */
    function downloadDataURI(filename, contentToDownload, isPlainText) {
        document.getElementById("downloadHelper").download = filename;
        if (isPlainText) {
            var data =
                "data:text/plain;charset=utf-8;base64," +
                window.btoa(contentToDownload);
            document.getElementById("downloadHelper").href = data;
        } else {
            document.getElementById("downloadHelper").href = contentToDownload;
        }
        document.getElementById("downloadHelper").click();
    }

    // Array of all dropped-sample-statistics <div> IDs.
    // Used in a few places in the codebase, so I'm storing it here.
    var statDivs = [
        "mainSamplesDroppedDiv",
        "balanceSamplesDroppedDiv",
        "xAxisSamplesDroppedDiv",
        "colorSamplesDroppedDiv"
    ];

    return {
        setUpDOMBindings: setUpDOMBindings,
        populateSelect: populateSelect,
        changeElementsEnabled: changeElementsEnabled,
        clearDiv: clearDiv,
        updateSampleDroppedDiv: updateSampleDroppedDiv,
        unionSize: unionSize,
        updateMainSampleShownDiv: updateMainSampleShownDiv,
        downloadDataURI: downloadDataURI,
        statDivs: statDivs
    };
});
