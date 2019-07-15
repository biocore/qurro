#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

from os.path import join
import pytest
from qurro._json_utils import (
    get_jsons,
    plot_jsons_equal,
    try_to_replace_line_json,
    replace_js_json_definitions,
    check_json_dataset_names,
)


def test_get_jsons():
    idir = join("qurro", "tests", "input", "json_tests")
    # Test various cases where not all JSONs (rank plot, sample plot, counts)
    # are available. In these cases, we'd expect a ValueError to be thrown
    # (assuming the return_nones parameter of get_jsons() remains False).
    with pytest.raises(ValueError):
        get_jsons(join(idir, "empty_file.js"))
    with pytest.raises(ValueError):
        get_jsons(join(idir, "both.js"))
    with pytest.raises(ValueError):
        get_jsons(join(idir, "only_rp.js"))
    with pytest.raises(ValueError):
        get_jsons(join(idir, "only_sp.js"))
    with pytest.raises(ValueError):
        get_jsons(join(idir, "only_c.js"))

    # Test basic case -- all JSONs are in a file
    assert ({}, {}, {}) == get_jsons(join(idir, "all.js"))
    # Test that the contents are being processed correctly
    rpj, spj, cj = get_jsons(join(idir, "all_full.js"))
    assert rpj == {
        "a": "b",
        "data": {"name": "asdf"},
        "datasets": {"asdf": {"1": 2}},
    }
    assert spj == {
        "c": "d",
        "data": {"name": "what"},
        "datasets": {"what": {"3": 4}},
    }
    assert cj == {"a": {"b": 0, "c": 2}, "d": {"b": 0, "c": 2}}

    # Test that as_dict=False returns string versions of the JSONs
    assert ("{}", "{}", "{}") == get_jsons(join(idir, "all.js"), as_dict=False)

    rpj, spj, cj = get_jsons(join(idir, "all_full.js"), as_dict=False)
    assert rpj == (
        '{"a": "b", "data": {"name": "asdf"}, '
        '"datasets": {"asdf": {"1": 2}}}'
    )
    assert spj == (
        '{"c": "d", "data": {"name": "what"}, '
        '"datasets": {"what": {"3": 4}}}'
    )
    assert cj == '{"a": {"b": 0, "c": 2}, "d": {"b": 0, "c": 2}}'

    # Test that return_nones=True prevents ValueErrors from not-present
    # JSONs, and also that it works in concert with as_dict=False
    assert (None, None, None) == get_jsons(
        join(idir, "empty_file.js"), return_nones=True
    )
    assert (None, None, None) == get_jsons(
        join(idir, "empty_file.js"), as_dict=False, return_nones=True
    )
    assert ({}, {}, None) == get_jsons(
        join(idir, "both.js"), return_nones=True
    )
    assert ("{}", "{}", None) == get_jsons(
        join(idir, "both.js"), as_dict=False, return_nones=True
    )
    assert ({}, None, None) == get_jsons(
        join(idir, "only_rp.js"), return_nones=True
    )
    assert ("{}", None, None) == get_jsons(
        join(idir, "only_rp.js"), as_dict=False, return_nones=True
    )
    assert (None, {}, None) == get_jsons(
        join(idir, "only_sp.js"), return_nones=True
    )
    assert (None, "{}", None) == get_jsons(
        join(idir, "only_sp.js"), as_dict=False, return_nones=True
    )
    assert (None, None, {}) == get_jsons(
        join(idir, "only_c.js"), return_nones=True
    )
    assert (None, None, "{}") == get_jsons(
        join(idir, "only_c.js"), as_dict=False, return_nones=True
    )

    # Test that return_nones=True doesn't do anything when all JSONs present
    assert ({}, {}, {}) == get_jsons(join(idir, "all.js"), return_nones=True)
    assert ("{}", "{}", "{}") == get_jsons(
        join(idir, "all.js"), return_nones=True, as_dict=False
    )

    # Test the json_prefix argument
    assert (None, {}, {}) == get_jsons(
        join(idir, "spcp_prefix.js"), return_nones=True, json_prefix="asdf"
    )
    assert (None, "{}", "{}") == get_jsons(
        join(idir, "spcp_prefix.js"),
        return_nones=True,
        as_dict=False,
        json_prefix="asdf",
    )
    assert ({}, None, None) == get_jsons(
        join(idir, "spcp_prefix.js"), return_nones=True
    )
    assert ("{}", None, None) == get_jsons(
        join(idir, "spcp_prefix.js"), as_dict=False, return_nones=True
    )
    with pytest.raises(ValueError):
        get_jsons(join(idir, "spcp_prefix.js"))
    with pytest.raises(ValueError):
        get_jsons(join(idir, "spcp_prefix.js"), json_prefix="asdf")


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

    # Check that ignoring the selector name works.
    a = {
        "a": "b",
        "selection": {"selector010": {2: 3}},
        "data": {"name": "asdf"},
        "datasets": {"asdf": {1: 2}},
    }
    b = {
        "a": "b",
        "selection": {"selector033": {2: 3}},
        "data": {"name": "asdf"},
        "datasets": {"asdf": {1: 2}},
    }
    assert plot_jsons_equal(a, b)

    # Check that ignoring both selector name and dataset name works, as well as
    # with a more detailed selection object.
    # The "selection" blocks here were taken straight from Altair output (from
    # a Qurro sample plot's JSON).
    a = {
        "a": "b",
        "selection": {
            "selector020": {
                "bind": "scales",
                "encodings": ["x", "y"],
                "type": "interval",
            }
        },
        "data": {"name": "asdf"},
        "datasets": {"asdf": {1: 2}},
    }
    b = {
        "a": "b",
        "selection": {
            "selector022": {
                "bind": "scales",
                "encodings": ["x", "y"],
                "type": "interval",
            }
        },
        "data": {"name": "diff"},
        "datasets": {"diff": {1: 2}},
    }
    assert plot_jsons_equal(a, b)


def test_check_json_dataset_names():
    def assert_in_e_info(e_info, *should_be_in):
        s_val = str(e_info.value)
        for thing in should_be_in:
            assert thing in s_val

    # Test weird case where no datasets are present
    with pytest.raises(ValueError) as exception_info:
        check_json_dataset_names({})
    assert_in_e_info(exception_info, "JSON doesn't have any datasets defined")

    # Should succeed if no conflict between restricted_names and the keys
    # within a["datasets"]
    a = {"a": "b", "datasets": {"asdf": {1: 2}}}
    check_json_dataset_names(a, "abc", "ASDF", "a")

    # Should fail if there is a conflict!
    with pytest.raises(ValueError) as exception_info:
        check_json_dataset_names(a, "lol", "ok", "but", "asdf")
    assert_in_e_info(
        exception_info,
        "Found the following disallowed dataset name(s)",
        "asdf",
    )

    # Also works properly if there are multiple datasets already defined
    # (shouldn't ever be the case but might as well check)
    a = {"a": "b", "datasets": {"asdf": {1: 2}, "thing2": {3: 4}}}
    # (should succeed)
    check_json_dataset_names(a, "abc", "ASDF", "a", "THING2")
    # (should fail)
    with pytest.raises(ValueError) as exception_info:
        check_json_dataset_names(a, "lol", "thing2", "asdf")
    assert_in_e_info(
        exception_info,
        "Found the following disallowed dataset name(s)",
        "asdf",
        "thing2",
    )
    # (should also fail)
    with pytest.raises(ValueError) as exception_info:
        check_json_dataset_names(a, "lol", "thing2")
    assert_in_e_info(
        exception_info,
        "Found the following disallowed dataset name(s)",
        "thing2",
    )
    # Only the intersection should be reported
    assert "asdf" not in str(exception_info.value)


def test_try_to_replace_line_json():
    # Test various cases where we expect a replacement
    good_rank_line = "  var rankPlotJSON = {};\n"
    new_line, r = try_to_replace_line_json(good_rank_line, "rank", {"a": "b"})
    assert new_line == '  var rankPlotJSON = {"a": "b"};\n'
    assert r

    good_sample_line = "  var samplePlotJSON = {};\n"
    new_line, r = try_to_replace_line_json(
        good_sample_line, "sample", {"a": "b"}
    )
    assert new_line == '  var samplePlotJSON = {"a": "b"};\n'
    assert r

    good_count_line = "  var countJSON = {};\n"
    new_line, r = try_to_replace_line_json(
        good_count_line, "count", {"a": "b"}
    )
    assert new_line == '  var countJSON = {"a": "b"};\n'
    assert r

    # Test various cases where we expect no replacement
    new_line, r = try_to_replace_line_json(good_rank_line, "count", {"a": "b"})
    assert new_line == good_rank_line
    assert not r

    new_line, r = try_to_replace_line_json(
        good_sample_line, "count", {"a": "b"}
    )
    assert new_line == good_sample_line
    assert not r

    new_line, r = try_to_replace_line_json(
        "notvalidjscode", "count", {"a": "b"}
    )
    assert new_line == "notvalidjscode"
    assert not r

    # Check that the json_prefix argument works
    prefix_sample_line = "    var asdfsamplePlotJSON = {};\n"
    new_line, r = try_to_replace_line_json(
        prefix_sample_line, "sample", {"a": "b"}
    )
    assert new_line == prefix_sample_line
    assert not r

    new_line, r = try_to_replace_line_json(
        prefix_sample_line, "sample", {"a": "b"}, json_prefix="asdf"
    )
    assert new_line == '    var asdfsamplePlotJSON = {"a": "b"};\n'
    assert r

    # Check that an invalid json type causes an error to be raised
    with pytest.raises(ValueError):
        try_to_replace_line_json(prefix_sample_line, "superinvalid", {})


def test_replace_js_json_definitions():
    idir = join("qurro", "tests", "input", "json_tests")
    oloc = join(idir, "replace_test_output.js")

    def validate_oloc(empty=False):
        with open(oloc, "r") as output_fobj:
            output_lines = output_fobj.readlines()
            if empty:
                assert output_lines[0] == "var rankPlotJSON = {};\n"
                assert output_lines[1] == "var samplePlotJSON = {};\n"
                assert output_lines[2] == "var countJSON = {};\n"
            else:
                assert (
                    output_lines[0] == 'var rankPlotJSON = {"test1": "r"};\n'
                )
                assert (
                    output_lines[1] == 'var samplePlotJSON = {"test2": "s"};\n'
                )
                assert output_lines[2] == 'var countJSON = {"test3": "c"};\n'

    test_inputs = [{"test1": "r"}, {"test2": "s"}, {"test3": "c"}]
    # Test that the basic case works (all JSONs are in the input file)
    exit_code = replace_js_json_definitions(
        join(idir, "all.js"), *test_inputs, output_file_loc=oloc
    )
    # The exit code should be 0, since changes should have been made.
    assert exit_code == 0
    validate_oloc()

    # Test that when no changes would be made, the exit code is 1.
    exit_code = replace_js_json_definitions(
        oloc, *test_inputs, output_file_loc=oloc
    )
    assert exit_code == 1
    validate_oloc()

    # Test that things work properly when no output_file_loc is provided (i.e.
    # the input file is overwritten)
    exit_code = replace_js_json_definitions(oloc, {}, {}, {})
    # We just changed things, so the exit code should be 0.
    assert exit_code == 0
    validate_oloc(empty=True)

    # Test that prefixes are handled properly.
    exit_code = replace_js_json_definitions(
        join(idir, "spcp_prefix.js"), *test_inputs, output_file_loc=oloc
    )
    # Since we didn't specify a prefix, only the JSON plot definition *without*
    # a prefix -- rankPlotJSON -- should be modified. The other definitions
    # should remain empty.
    assert exit_code == 0
    with open(oloc, "r") as output_fobj:
        output_lines = output_fobj.readlines()
        assert output_lines[0] == 'var rankPlotJSON = {"test1": "r"};\n'
        assert output_lines[1] == "var asdfsamplePlotJSON = {};\n"
        assert output_lines[2] == "var asdfcountJSON = {};\n"

    exit_code = replace_js_json_definitions(
        join(idir, "spcp_prefix.js"),
        *test_inputs,
        json_prefix="asdf",
        output_file_loc=oloc
    )
    # Now, things should be flipped -- only the definitions with a prefix
    # (sample plot and count JSON) should be modified.
    assert exit_code == 0
    with open(oloc, "r") as output_fobj:
        output_lines = output_fobj.readlines()
        assert output_lines[0] == "var rankPlotJSON = {};\n"
        assert output_lines[1] == 'var asdfsamplePlotJSON = {"test2": "s"};\n'
        assert output_lines[2] == 'var asdfcountJSON = {"test3": "c"};\n'
