import biom
import numpy as np
from numpy.testing import assert_array_equal
from pandas import DataFrame
from pandas.testing import assert_frame_equal
import pytest
from qurro._rank_utils import filter_unextreme_features
from qurro.tests.testing_utilities import run_integration_test


def get_test_data():
    """Returns a ranks DataFrame and a BIOM table for use in testing."""

    feature_ids = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"]
    sample_ids = ["S1", "S2", "S3", "S4", "S5"]
    ranks = DataFrame(
        {
            "Rank 0": [1, 2, 3, 4, 5, 6, 7, 8],
            "Rank 1": [8, 7, 6, 5, 4, 3, 2, 1],
        },
        index=feature_ids,
    )
    # Based on the BIOM docs' example of initialization using a np ndarray --
    # http://biom-format.org/documentation/table_objects.html#examples
    #
    # np.arange(40) generates a numpy ndarray that just goes from 0 to 39 (i.e.
    # contains 40 numbers). We reshape this ndarray to give it a sort of
    # "tabular" structure (a 2-D array containing 8 arrays, each with 5
    # numbers).
    underlying_table_data = np.arange(40).reshape(8, 5)
    # Set the third sample in the data to contain all zeros, except for a
    # count for F4 (so we can test what this function does with so-called
    # "empty" samples after filtering out F4).
    underlying_table_data[:, 2] = 0.0
    underlying_table_data[3, 2] = 1.0
    # Finally, use the data to create a BIOM table object.
    biom_table = biom.Table(underlying_table_data, feature_ids, sample_ids)

    return biom_table, ranks


def test_filtering_basic():
    """Tests the standard behavior of filter_unextreme_features()."""

    biom_table, ranks = get_test_data()
    filtered_table, filtered_ranks = filter_unextreme_features(
        biom_table, ranks, 2, print_warning=False
    )
    # Check that the appropriate features/samples were filtered out of the
    # table. NOTE -- I know this is sloppy code. Would like to fix it in the
    # future.
    for fid in ["F1", "F2", "F7", "F8"]:
        assert filtered_table.exists(fid, axis="observation")
    for fid in ["F3", "F4", "F5", "F6"]:
        assert not filtered_table.exists(fid, axis="observation")
    # Check that all samples were preserved.
    # (The removal of empty features is done *after*
    # filter_unextreme_features() is called in normal Qurro execution, so we
    # should expect all samples -- even empty ones -- to remain here.
    for sid in ["S1", "S2", "S3", "S4", "S5"]:
        assert filtered_table.exists(sid, axis="sample")
    # Check that the appropriate data is left in the table.
    assert_array_equal(
        filtered_table.data("F1", axis="observation"), [0, 1, 0, 3, 4]
    )
    assert_array_equal(
        filtered_table.data("F2", axis="observation"), [5, 6, 0, 8, 9]
    )
    assert_array_equal(
        filtered_table.data("F7", axis="observation"), [30, 31, 0, 33, 34]
    )
    assert_array_equal(
        filtered_table.data("F8", axis="observation"), [35, 36, 0, 38, 39]
    )

    expected_filtered_ranks = DataFrame(
        {"Rank 0": [1, 2, 7, 8], "Rank 1": [8, 7, 2, 1]},
        index=["F1", "F2", "F7", "F8"],
    )
    # Check that the rank filtering worked as expected.
    assert_frame_equal(
        filtered_ranks, expected_filtered_ranks, check_like=True
    )


def test_filtering_large_efc():
    """Tests filter_unextreme_features() when (the extreme feature count * 2)
       is greater than or equal to the number of ranked features.
    """

    biom_table, ranks = get_test_data()

    # The number of ranked features is 8.
    filtered_table, filtered_ranks = filter_unextreme_features(
        biom_table, ranks, 4, print_warning=False
    )
    assert biom_table == filtered_table
    assert_frame_equal(ranks, filtered_ranks)

    filtered_table, filtered_ranks = filter_unextreme_features(
        biom_table, ranks, 8, print_warning=False
    )
    assert biom_table == filtered_table
    assert_frame_equal(ranks, filtered_ranks)


def test_filtering_no_efc():
    """Tests filter_unextreme_features() when the extreme feature count is None
       (i.e. the user didn't use the -x option, and no filtering should be
       done).
    """

    biom_table, ranks = get_test_data()

    filtered_table, filtered_ranks = filter_unextreme_features(
        biom_table, ranks, None, print_warning=False
    )
    assert biom_table == filtered_table
    assert_frame_equal(ranks, filtered_ranks)


def test_filtering_invalid_efc():
    """Tests that filter_unextreme_features() throws an error when the
       extreme feature count is less than 1 and/or not an integer.
    """

    biom_table, ranks = get_test_data()

    with pytest.raises(ValueError):
        filter_unextreme_features(biom_table, ranks, 0)

    with pytest.raises(ValueError):
        filter_unextreme_features(biom_table, ranks, -1)

    with pytest.raises(ValueError):
        filter_unextreme_features(biom_table, ranks, -2)

    with pytest.raises(ValueError):
        filter_unextreme_features(biom_table, ranks, 1.5)

    with pytest.raises(ValueError):
        filter_unextreme_features(biom_table, ranks, 5.5)


def test_empty_samples_integration():
    params = [
        "matching_test",
        "empty_samples_no_efc",
        "differentials.tsv",
        "empty_samples.biom",
        "sample_metadata.txt",
    ]
    rpj, spj, cj = run_integration_test(
        *params, feature_metadata_name="feature_metadata.txt"
    )
    params[1] = "empty_samples_yes_efc"
    # TODO -- look at sample plot json -- verify that just Sample2 dropped
    rpj, spj, cj = run_integration_test(
        *params,
        feature_metadata_name="feature_metadata.txt",
        extreme_feature_count=1,
    )
    # TODO -- look at sample plot json -- verify that Sample2 + 3 dropped
    # (and verify that most of the features were dropped)
