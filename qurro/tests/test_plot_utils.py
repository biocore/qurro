#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

from qurro._plot_utils import plot_jsons_equal


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
