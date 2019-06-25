import pytest
import biom
from pandas import DataFrame
from pandas.testing import assert_frame_equal
from qurro.generate import process_input
from qurro.tests.testing_utilities import (
    run_integration_test,
    get_data_from_plot_json,
)
from qurro.tests.test_df_utils import get_test_data


params = [
    "matching_test",
    "empty_samples_no_efc",
    "differentials.tsv",
    "empty_samples.biom",
    "sample_metadata.txt",
]


def test_empty_sample_integration_basic():
    rpj, spj, cj = run_integration_test(
        *params, feature_metadata_name="feature_metadata.txt"
    )
    # look at sample plot json -- verify that just Sample2 dropped (due to
    # being empty: having a count of 0 for every feature)
    sample_data = get_data_from_plot_json(spj)
    for s in ("Sample1", "Sample3", "Sample5", "Sample6", "Sample7"):
        assert s in sample_data
    assert "Sample4" not in sample_data
    assert "Sample2" not in sample_data


def test_empty_sample_integration_extreme_feature_count():
    params_copy = params[:]
    params_copy[1] = "empty_samples_yes_efc"
    rpj2, spj2, cj2 = run_integration_test(
        *params_copy,
        feature_metadata_name="feature_metadata.txt",
        extreme_feature_count=1,
    )
    # look at sample plot json -- verify that Sample2 + 3 dropped
    # (Sample2 due to being empty, and Sample3 due to being empty after the one
    # feature it had a count for, Taxon3, was removed due to -x.)
    # (Also, verify that most of the features were dropped due to -x.)
    sample_data_2 = get_data_from_plot_json(spj2)
    for s2 in ("Sample1", "Sample5", "Sample6", "Sample7"):
        assert s2 in sample_data_2
    assert "Sample4" not in sample_data_2
    assert "Sample2" not in sample_data_2
    assert "Sample3" not in sample_data_2


def test_all_empty_samples_post_filtering():
    table, metadata = get_test_data()
    # Based on the version of get_test_data() in test_filter_unextreme_features
    # (TODO: unify all of these into a single method that returns a table,
    # metadata, and feature ranks)
    ranks = DataFrame(
        {
            "Rank 0": [1, 2, 3, 4, 5, 6, 7, 8],
            "Rank 1": [8, 7, 6, 5, 4, 3, 2, 1],
        },
        index=list(table.index)[:],
    )
    # Modify the table so that each sample isn't empty, but *is* empty if you
    # filter the table to extreme features (which will be F1, F2, F7, and F8).
    table["Sample1"] = [0, 0, 1, 1, 1, 1, 0, 0]
    table["Sample2"] = [0, 0, 2, 2, 2, 2, 0, 0]
    table["Sample3"] = [0, 0, 3, 3, 3, 3, 0, 0]
    table["Sample4"] = [0, 0, 4, 4, 4, 4, 0, 0]

    # HACK: since process_input() expects a BIOM table, we need to convert the
    # table DF into a numpy array in order to create a BIOM table from it.
    # ...Of course, process_input() will almost immediately convert this back
    # to a DataFrame, but you know what this works so I'm not going to question
    # it too much.
    # Idea of using .values to get the numpy array from a DataFrame c/o
    # https://stackoverflow.com/a/37043071/10730311.
    btable = biom.Table(table.values, table.index, table.columns)

    # Things should be fine if you don't specify a -x argument.
    # (Check that things are processed properly -- nothing should really change
    # here, because all of the features and samples should match to the table)
    o_metadata, o_ranks, ranking_ids, fm_cols, o_table = process_input(
        ranks, metadata, btable
    )
    assert_frame_equal(o_metadata, metadata, check_like=True)
    assert_frame_equal(o_ranks, ranks)
    assert_frame_equal(o_table, table, check_like=True, check_dtype=False)
    assert (ranking_ids == ["Rank 0", "Rank 1"]).all()
    assert len(fm_cols) == 0

    # However, if you do specify a -x argument, you should get an error when
    # empty samples are removed.
    with pytest.raises(ValueError) as efc_exception_info:
        process_input(ranks, metadata, btable, extreme_feature_count=2)
    assert "Found all empty samples" in str(efc_exception_info.value)
