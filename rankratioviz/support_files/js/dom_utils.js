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
