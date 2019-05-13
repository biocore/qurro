from pandas import DataFrame
from pandas.testing import assert_frame_equal
from rankratioviz.generate import ensure_df_headers_unique, matchdf
from rankratioviz.tests.testing_utilities import run_integration_test


def test_ensure_df_headers_unique():
    """Tests the ensure_df_headers_unique() function in generate.py."""

    # Various DFs with nonunique indices and/or columns
    df_bad = DataFrame(
        {"col1": [1, 2, 3], "col2": [6, 7, 8]}, index=["a", "b", "a"]
    )
    df_bad2 = DataFrame(index=["b", "b", "b"])
    df_bad3 = DataFrame(index=[1, 2, 3, 2])

    # We can specify nonunique columns via representing the DF as a 2-D array
    # -- see https://stackoverflow.com/a/20613532/10730311
    df_bad4 = DataFrame(
        [[1, 6], [2, 7], [3, 8]],
        columns=["col1", "col1"],
        index=["a", "b", "c"],
    )
    df_bad5 = DataFrame(
        [[1, 6], [2, 7], [3, 8]],
        columns=["col1", "col1"],
        index=["a", "b", "a"],
    )

    # Various DFs with unique indices and columns
    df_good = DataFrame({"x": [20], "y": [40]}, index=["a", "b"])
    df_good2 = DataFrame({"x": [20], "y": [40]}, index=["x", "y"])
    df_good3 = DataFrame(index=["c"])

    i = 1
    for df in (df_bad, df_bad2, df_bad3, df_bad4, df_bad5):
        df_name = "test #{}".format(i)
        thing_checking = "Indices"
        if i == 4:
            thing_checking = "Columns"
        try:
            ensure_df_headers_unique(df, df_name)
            # If this didn't result in a ValueError being thrown, fail the
            # test! (It should have caused a ValueError.)
            assert False
        except ValueError as err:
            expected_message = (
                "{} of the {} DataFrame are not "
                "unique.".format(thing_checking, df_name)
            )
            assert expected_message == err.args[0]
        i += 1

    i = 1
    for df in (df_good, df_good2, df_good3):
        df_name = "test #{}".format(i)
        # If this fails (i.e. the "good" DF is detected as a bad one),
        # ensure_df_headers_unique() would raise a ValueError, autofailing (or
        # erroring, I guess, but doesn't really matter) this test
        ensure_df_headers_unique(df, df_name)
        i += 1


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
    """Tests that rrv raises an error when > 0 feature(s) are unsupported."""

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
    """Tests that rrv raises an error when all samples are unsupported."""
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
    """Tests rrv's behavior when > 0 feature(s) and all samples are unsupported.

       In particular, rankratioviz should just throw an error about the
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
    """Tests the behavior of rrv in matching sample metadata, feature metadata,
       ranks, and the BIOM table together.
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
    # Assert that Taxon3 has been annotated.
    data_name = rank_json["data"]["name"]
    # Hardcoded based on the one populated row in floc. This shouldn't
    # change in the future, so hardcoding it here is fine.
    relevant_feature_metadata = ["Taxon3", "Yeet", "100"]
    # We know Taxon3 will be in the 1th position because the feature should
    # be sorted by their first rank (in this case, Intercept)
    t3id = rank_json["datasets"][data_name][1]["Feature ID"]
    # We don't care how the feature metadata annotation is done; we just
    # want to make sure that all the metadata is in the feature ID somehow
    for fm in relevant_feature_metadata:
        assert fm in t3id
    # Check that the other taxa haven't been annotated with this data
    # (Obviously, if the feature metadata is somehow present in a taxon
    # name -- e.g. we have a taxon called "Taxon100" -- then this would
    # fail, but for this simple test with five taxa it shouldn't matter.)
    for x in [0, 2, 3, 4]:
        txid = rank_json["datasets"][data_name][x]["Feature ID"]
        for fm in relevant_feature_metadata:
            assert fm not in txid

    # Assert that Sample4 was dropped from the "main" dataset of the plot
    data_name = sample_json["data"]["name"]
    for sample in sample_json["datasets"][data_name]:
        assert sample["Sample ID"] != "Sample4"

    for txid in count_json:
        # Assert that Sample4 was also dropped from the counts data in the JSON
        assert "Sample4" not in count_json[txid]
        # Assert that Taxon3's annotation carried over to the sample plot
        if txid.startswith("Taxon3"):
            for fm in relevant_feature_metadata:
                assert fm in txid
