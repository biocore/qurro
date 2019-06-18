#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

import pytest
from qurro._plot_utils import plot_jsons_equal, try_to_replace_line_json


def test_plot_jsons_equal():

    assert plot_jsons_equal(None, None)
    assert plot_jsons_equal({}, {})
    assert not plot_jsons_equal({"a": "b"}, {"a": "c"})
    assert not plot_jsons_equal(None, {})
    assert not plot_jsons_equal({}, None)
    assert not plot_jsons_equal({"a": "b"}, {})
    assert not plot_jsons_equal(
        {"a": "b", "data": {"name": "asdf"}}, {"a": "b"}
    )
    # The dataset name should be explicitly ignored by plot_jsons_equal().
    # Of course, if the actual data is different, the specs aren't equal.
    assert not plot_jsons_equal(
        {"a": "b", "data": {"name": "asdf"}, "datasets": {"asdf": {1: 2}}},
        {"a": "b", "data": {"name": "diff"}, "datasets": {"diff": {2: 1}}},
    )
    # Sanity test -- check that a spec is equal to itself
    assert plot_jsons_equal(
        {"a": "b", "data": {"name": "asdf"}, "datasets": {"asdf": {1: 2}}},
        {"a": "b", "data": {"name": "asdf"}, "datasets": {"asdf": {1: 2}}},
    )
    # Check that ignoring the dataset name works. These two specs are
    # identical, except for how they have different dataset names ("asdf" and
    # "diff", respectively).
    a = {"a": "b", "data": {"name": "asdf"}, "datasets": {"asdf": {1: 2}}}
    b = {"a": "b", "data": {"name": "diff"}, "datasets": {"diff": {1: 2}}}
    assert plot_jsons_equal(a, b)
    # And, while we're at it, check that this function doesn't overwrite its
    # inputs when standardizing data names. The distinct data names should be
    # preserved.
    assert a["data"]["name"] == "asdf"
    assert "asdf" in a["datasets"]
    assert b["data"]["name"] == "diff"
    assert "diff" in b["datasets"]


def test_try_to_replace_line_json():
    # Test various cases where we expect a replacement
    good_rank_line = "  var rankPlotJSON = {};\n"
    new_line, r = try_to_replace_line_json(
        good_rank_line, "rank", {}, {"a": "b"}
    )
    assert new_line == '  var rankPlotJSON = {"a": "b"};\n'
    assert r

    good_sample_line = "  var samplePlotJSON = {};\n"
    new_line, r = try_to_replace_line_json(
        good_sample_line, "sample", {}, {"a": "b"}
    )
    assert new_line == '  var samplePlotJSON = {"a": "b"};\n'
    assert r

    good_count_line = "  var countJSON = {};\n"
    new_line, r = try_to_replace_line_json(
        good_count_line, "count", {}, {"a": "b"}
    )
    assert new_line == '  var countJSON = {"a": "b"};\n'
    assert r

    # Test various cases where we expect no replacement
    new_line, r = try_to_replace_line_json(
        good_rank_line, "count", {}, {"a": "b"}
    )
    assert new_line == good_rank_line
    assert not r

    new_line, r = try_to_replace_line_json(
        good_sample_line, "count", {}, {"a": "b"}
    )
    assert new_line == good_sample_line
    assert not r

    new_line, r = try_to_replace_line_json(
        "notvalidjscode", "count", {}, {"a": "b"}
    )
    assert new_line == "notvalidjscode"
    assert not r

    # Check that the json_prefix argument works
    prefix_sample_line = "    var asdfsamplePlotJSON = {};\n"
    new_line, r = try_to_replace_line_json(
        prefix_sample_line, "sample", {}, {"a": "b"}
    )
    assert new_line == prefix_sample_line
    assert not r

    new_line, r = try_to_replace_line_json(
        prefix_sample_line, "sample", {}, {"a": "b"}, json_prefix="asdf"
    )
    assert new_line == '    var asdfsamplePlotJSON = {"a": "b"};\n'
    assert r

    # Check that an invalid json type causes an error to be raised
    with pytest.raises(ValueError):
        try_to_replace_line_json(prefix_sample_line, "superinvalid", {}, {})
