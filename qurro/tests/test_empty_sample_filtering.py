from numpy import zeros
from pandas import DataFrame
from pandas.testing import assert_series_equal, assert_frame_equal
import pytest
from qurro.generate import remove_empty_samples
from qurro.tests.testing_utilities import (
    run_integration_test,
    get_data_from_sample_plot_json,
)


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
    sample_data = get_data_from_sample_plot_json(spj)
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
    sample_data_2 = get_data_from_sample_plot_json(spj2)
    for s2 in ("Sample1", "Sample5", "Sample6", "Sample7"):
        assert s2 in sample_data_2
    assert "Sample4" not in sample_data_2
    assert "Sample2" not in sample_data_2
    assert "Sample3" not in sample_data_2


def get_test_data():

    # Mostly copied from get_test_data() in test_filter_unextreme_features.
    feature_ids = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"]
    table = DataFrame(
        {
            "Sample1": [1, 2, 3, 4, 5, 6, 7, 8],
            "Sample2": [8, 7, 6, 5, 4, 3, 2, 1],
            "Sample3": [1, 0, 0, 0, 0, 0, 0, 0],
            "Sample4": [0, 0, 0, 1, 0, 0, 0, 0],
        },
        index=feature_ids,
    )
    metadata = DataFrame(
        {
            "Metadata1": [0, 0, 0, 1],
            "Metadata2": [0, 0, 0, 0],
            "Metadata3": [1, 2, 3, 4],
            "Metadata4": [8, 7, 6, 5],
        },
        index=list(table.columns)[:],
    )
    return table, metadata


def test_remove_empty_samples_basic():
    """Tests remove_empty_samples() in the simple cases of removing 0, 1, and 2
       empty sample(s).
    """

    # TRY REMOVING 0 SAMPLES
    table, metadata = get_test_data()
    # Check that, when none of the samples are empty, nothing is changed.
    ftable, fmetadata = remove_empty_samples(table, metadata)
    assert_frame_equal(ftable, table)
    assert_frame_equal(fmetadata, metadata)

    # TRY REMOVING 1 SAMPLE
    # Zero out Sample3 (it only has one count, for F1)
    table["Sample3"]["F1"] = 0
    # Check that just the one empty sample (Sample3) was removed, from both the
    # table and the sample metadata.
    ftable, fmetadata = remove_empty_samples(table, metadata)
    assert_series_equal(ftable["Sample1"], table["Sample1"])
    assert_series_equal(ftable["Sample2"], table["Sample2"])
    assert_series_equal(ftable["Sample4"], table["Sample4"])
    assert "Sample3" not in ftable.columns
    assert len(ftable.columns) == 3
    assert len(ftable.index) == len(table.index) == 8

    assert_series_equal(fmetadata.loc["Sample1"], metadata.loc["Sample1"])
    assert_series_equal(fmetadata.loc["Sample2"], metadata.loc["Sample2"])
    assert_series_equal(fmetadata.loc["Sample4"], metadata.loc["Sample4"])
    assert "Sample3" not in fmetadata.index
    assert len(fmetadata.index) == 3
    assert len(fmetadata.columns) == len(metadata.columns) == 4

    # TRY REMOVING 2 SAMPLES
    # Now, zero out Sample4 (it only has one count in F4)
    table["Sample4"]["F4"] = 0
    ftable, fmetadata = remove_empty_samples(table, metadata)
    assert_series_equal(ftable["Sample1"], table["Sample1"])
    assert_series_equal(ftable["Sample2"], table["Sample2"])
    assert "Sample3" not in ftable.columns
    assert "Sample4" not in ftable.columns
    assert len(ftable.columns) == 2
    assert len(ftable.index) == len(table.index) == 8

    assert_series_equal(fmetadata.loc["Sample1"], metadata.loc["Sample1"])
    assert_series_equal(fmetadata.loc["Sample2"], metadata.loc["Sample2"])
    assert "Sample3" not in fmetadata.index
    assert "Sample4" not in fmetadata.index
    assert len(fmetadata.index) == 2


def test_remove_empty_samples_allempty():
    """Tests remove_empty_samples() when all samples in the table are empty."""

    table, metadata = get_test_data()
    table["Sample1"] = zeros(len(table.index))
    table["Sample2"] = zeros(len(table.index))
    table["Sample3"] = zeros(len(table.index))
    table["Sample4"] = zeros(len(table.index))
    with pytest.raises(ValueError):
        ftable, fmetadata = remove_empty_samples(table, metadata)
