#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

from rankratioviz._plot_utils import plot_jsons_equal


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
    assert plot_jsons_equal(
        {"a": "b", "data": {"name": "asdf"}, "datasets": {"asdf": {1: 2}}},
        {"a": "b", "data": {"name": "asdf"}, "datasets": {"asdf": {1: 2}}},
    )
    assert plot_jsons_equal(
        {"a": "b", "data": {"name": "asdf"}, "datasets": {"asdf": {1: 2}}},
        {"a": "b", "data": {"name": "diff"}, "datasets": {"diff": {1: 2}}},
    )
    assert not plot_jsons_equal(
        {"a": "b", "data": {"name": "asdf"}, "datasets": {"asdf": {1: 2}}},
        {"a": "b", "data": {"name": "diff"}, "datasets": {"diff": {2: 1}}},
    )
