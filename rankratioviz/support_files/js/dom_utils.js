/* This file contains some methods for manipulating DOM elements in a
 * client-side web interface.
 */
define(function() {
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
        selectEle.innerHTML = "";
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

    function changeElementsEnabled(elements, enable) {
        // List of DOM elements that have to do with the color controls. We
        // disable these when in "boxplot mode" because Vega-Lite gets
        // grumpy when you try to apply colors to a boxplot that have
        // different granularity than the boxplot's current x-axis.
        // (It does the same thing with tooltips.)
        var e;
        if (enable) {
            for (e = 0; e < elements.length; e++) {
                document.getElementById(elements[e]).disabled = false;
            }
        } else {
            for (e = 0; e < elements.length; e++) {
                document.getElementById(elements[e]).disabled = true;
            }
        }
    }

    function clearDiv(divID) {
        // From https://stackoverflow.com/a/3450726/10730311.
        // This way is apparently faster than just using
        // document.getElementById(divID).innerHTML = '' -- not that
        // performance really matters a ton here, but whatever.
        var element = document.getElementById(divID);
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /* From downloadDataURI() in the MetagenomeScope viewer interface
     * source code.
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

    return {
        setUpDOMBindings: setUpDOMBindings,
        populateSelect: populateSelect,
        changeElementsEnabled: changeElementsEnabled,
        clearDiv: clearDiv,
        downloadDataURI: downloadDataURI
    };
});
