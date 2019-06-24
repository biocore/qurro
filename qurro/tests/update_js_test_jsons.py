#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
# This script updates JSON definitions for the Qurro web (JS) tests, which lets
# us ensure that the Vega-Lite specifications / count JSONs we're using in our
# JS tests match up with the outputs generated from the latest version of
# Qurro's python script.
#
# Most of the JSON definitions in the web tests are taken from the python
# "matching test" output. This is just because this is a small, simple dataset
# that's easy to work with.
#
# However, we also use the json_prefix argument of
# _json_utils.replace_js_json_definitions() to send some other python tests'
# output to tests that specifically refer to those JSONs via a special prefix.
# ----------------------------------------------------------------------------

import os
from qurro._json_utils import get_jsons, replace_js_json_definitions


if __name__ == "__main__":
    test_dir = os.path.join("qurro", "tests", "web_tests", "tests")
    rrv_js_tests = filter(lambda f: f.endswith(".js"), os.listdir(test_dir))

    mt_rpj, mt_spj, mt_cj = get_jsons(
        os.path.join("docs", "demos", "matching_test", "main.js")
    )
    sst_rpj, sst_spj, sst_cj = get_jsons(
        os.path.join("docs", "demos", "sample_stats_test", "main.js")
    )
    for js_test_file in rrv_js_tests:
        js_test_file_path = os.path.join(test_dir, js_test_file)
        # Replace JSONs without special prefixes with the matching test JSONs.
        replace_js_json_definitions(
            js_test_file_path, mt_rpj, mt_spj, mt_cj, verbose=True
        )
        # Replace JSONs with the "SST" prefix with the sample stats test JSONs.
        # This is done in order to create an "integration" test for #92, where
        # the output from python is tested both in python and in JavaScript.
        replace_js_json_definitions(
            js_test_file_path,
            sst_rpj,
            sst_spj,
            sst_cj,
            json_prefix="SST",
            verbose=True,
        )
