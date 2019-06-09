from pandas import DataFrame
from pandas.testing import assert_frame_equal
from qurro.generate import matchdf
from qurro.tests.testing_utilities import run_integration_test


def test_matchdf():
    """Tests the matchdf() function in generate.py."""

    df1 = DataFrame(
        {
            "col1": [1, 2, 3, 4, 5],
            "col2": [6, 7, 8, 9, 10],
            "col3": [11, 12, 13, 14, 15],
        },
        index=["a", "b", "c", "d", "e"],
    )
    df2 = DataFrame(
        {
            "colA": [5, 4, 3, 2, 1],
            "colB": [10, 9, 8, 7, 6],
            "colC": [15, 14, 13, 12, 11],
            "colD": ["q", "w", "e", "r", "t"],
        },
        index=["a", "c", "d", "x", "y"],
    )
    df3 = DataFrame(index=["a", "x"])
    df4 = DataFrame(index=["x"])

    # The ground truth DF from matching dfX with dfY is named dfXY
    df12 = DataFrame(
        {"col1": [1, 3, 4], "col2": [6, 8, 9], "col3": [11, 13, 14]},
        index=["a", "c", "d"],
    )
    df21 = DataFrame(
        {
            "colA": [5, 4, 3],
            "colB": [10, 9, 8],
            "colC": [15, 14, 13],
            "colD": ["q", "w", "e"],
        },
        index=["a", "c", "d"],
    )
    df13 = DataFrame({"col1": [1], "col2": [6], "col3": [11]}, index=["a"])
    df31 = DataFrame(index=["a"])
    # we need to specify a dtype of "int64" here because pandas, by default,
    # infers that df14's dtype is just "object"; however, the result of
    # matching df1 and df4 will have an "int64" dtype (since df1 already has
    # an inferred "int64" dtype).
    df14 = DataFrame(columns=["col1", "col2", "col3"]).astype("int64")
    df41 = DataFrame()

    # Basic testing: ensure that matching results match up with the ground
    # truths
    A, B = matchdf(df1, df2)
    assert_frame_equal(A, df12, check_like=True)
    assert_frame_equal(B, df21, check_like=True)

    # Test "commutativity" of matchdf() -- reversing the DFs' orders shouldn't
    # change the matching results (aside from the output order, of course)
    A, B = matchdf(df2, df1)
    assert_frame_equal(A, df21, check_like=True)
    assert_frame_equal(B, df12, check_like=True)

    # Test that matching with empty DFs works as expected
    # First, try matching in the case where at least one index name matches
    A, B = matchdf(df1, df3)
    assert_frame_equal(A, df13, check_like=True)
    assert_frame_equal(B, df31, check_like=True)
    # Next, try matching in the case where there's no overlap in index names
    A, B = matchdf(df1, df4)
    assert_frame_equal(A, df14, check_like=True)
    assert_frame_equal(B, df41, check_like=True)


def test_dropping_features():
    """Tests that Qurro raises an error when > 0 feature(s) are unsupported."""

    # Test that dropping 1 feature produces an error
    run_integration_test(
        "matching_test",
        "matching_test/dropped_feature",
        "differentials.tsv",
        "dropped_feature.biom",
        "sample_metadata.txt",
        feature_metadata_name="feature_metadata.txt",
        expected_unsupported_features=1,
    )
    # Test that dropping 2 features produces an error
    run_integration_test(
        "matching_test",
        "matching_test/dropped_features",
        "differentials.tsv",
        "dropped_features.biom",
        "sample_metadata.txt",
        feature_metadata_name="feature_metadata.txt",
        expected_unsupported_features=2,
    )


def test_dropping_all_samples():
    """Tests that Qurro raises an error when all samples are unsupported."""
    run_integration_test(
        "matching_test",
        "matching_test/all_samples_dropped",
        "differentials.tsv",
        "all_samples_dropped.biom",
        "sample_metadata.txt",
        feature_metadata_name="feature_metadata.txt",
        expect_all_unsupported_samples=True,
    )


def test_dropping_all_samples_and_features():
    """Tests Qurro's behavior when > 0 feature(s) and all samples are unsupported.

       In particular, qurro should just throw an error about the
       feature(s) being unsupported -- the feature check should come before the
       sample check (not for any particular reason, that's just how I wrote the
       code).
    """
    run_integration_test(
        "matching_test",
        "matching_test/all_samples_and_one_feature_dropped",
        "differentials.tsv",
        "all_samples_and_one_feature_dropped.biom",
        "sample_metadata.txt",
        feature_metadata_name="feature_metadata.txt",
        expect_all_unsupported_samples=True,
        expected_unsupported_features=1,
    )
    run_integration_test(
        "matching_test",
        "matching_test/all_samples_and_two_features_dropped",
        "differentials.tsv",
        "all_samples_and_two_features_dropped.biom",
        "sample_metadata.txt",
        feature_metadata_name="feature_metadata.txt",
        expect_all_unsupported_samples=True,
        expected_unsupported_features=2,
    )


def test_feature_metadata_and_dropped_sample():
    """Tests the behavior of Qurro in matching sample metadata, feature
       metadata, ranks, and the BIOM table together.
    """

    rank_json, sample_json, count_json = run_integration_test(
        "matching_test",
        "matching_test",
        "differentials.tsv",
        "mt.biom",
        "sample_metadata.txt",
        feature_metadata_name="feature_metadata.txt",
        expected_unsupported_samples=1,
    )

    data_name = rank_json["data"]["name"]

    # Check that feature metadata annotations were done correctly
    for feature in rank_json["datasets"][data_name]:
        txid = feature["Feature ID"]
        if feature["Feature ID"] == "Taxon3":
            assert feature["FeatureMetadata1"] == "Yeet"
            # this should be interpreted this as a string, since "lol" is in
            # the same column
            assert feature["FeatureMetadata2"] == "100"
        elif feature["Feature ID"] == "Taxon5":
            # This should be interpeted as a string, also
            assert feature["FeatureMetadata1"] == "null"
            assert feature["FeatureMetadata2"] == "lol"
        else:
            # Check that the other taxa haven't been annotated with any
            # metadata.
            assert feature["FeatureMetadata1"] is None
            assert feature["FeatureMetadata2"] is None

    # Assert that Sample4 was dropped from the "main" dataset of the plot
    data_name = sample_json["data"]["name"]
    for sample in sample_json["datasets"][data_name]:
        assert sample["Sample ID"] != "Sample4"

    for txid in count_json:
        # Assert that Sample4 was also dropped from the counts data in the JSON
        assert "Sample4" not in count_json[txid]
