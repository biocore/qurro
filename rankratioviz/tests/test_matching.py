from pandas import DataFrame
from pandas.testing import assert_frame_equal
from rankratioviz.generate import matchdf
from rankratioviz.tests.testing_utilities import run_integration_test


def test_matchdf():
    """Tests the matchdf() function in rankratioviz.generate."""

    df1 = DataFrame({'col1': [1, 2, 3, 4, 5], 'col2': [6, 7, 8, 9, 10],
                     'col3': [11, 12, 13, 14, 15]},
                    index=['a', 'b', 'c', 'd', 'e'])
    df2 = DataFrame({'colA': [5, 4, 3, 2, 1], 'colB': [10, 9, 8, 7, 6],
                     'colC': [15, 14, 13, 12, 11],
                     'colD': ['q', 'w', 'e', 'r', 't']},
                    index=['a', 'c', 'd', 'x', 'y'])
    df3 = DataFrame(index=['a', 'x'])
    df4 = DataFrame(index=['x'])

    # The ground truth DF from matching dfX with dfY is named dfXY
    df12 = DataFrame({'col1': [1, 3, 4], 'col2': [6, 8, 9],
                      'col3': [11, 13, 14]}, index=['a', 'c', 'd'])
    df21 = DataFrame({'colA': [5, 4, 3], 'colB': [10, 9, 8],
                     'colC': [15, 14, 13], 'colD': ['q', 'w', 'e']},
                     index=['a', 'c', 'd'])
    df13 = DataFrame({'col1': [1], 'col2': [6], 'col3': [11]}, index=['a'])
    df31 = DataFrame(index=['a'])
    # we need to specify a dtype of "int64" here because pandas, by default,
    # infers that df14's dtype is just "object"; however, the result of
    # matching df1 and df4 will have an "int64" dtype (since df1 already has
    # an inferred "int64" dtype).
    df14 = DataFrame(columns=['col1', 'col2', 'col3']).astype("int64")
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


def test_feature_metadata_and_dropped_sample():
    """Tests the behavior of rrv in matching sample metadata, feature metadata,
       ranks, and the BIOM table together.
    """

    rank_json, sample_json = run_integration_test(
        "matching_test", "matching_test", "differentials.tsv", "mt.biom",
        "sample_metadata.txt", feature_metadata_name="feature_metadata.txt",
        expected_unsupported_samples=1
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

    # Assert that Sample4 was also dropped from the counts data in the JSON
    cts_data = sample_json["datasets"]["rankratioviz_feature_counts"]
    for txcolid in cts_data:
        assert "Sample4" not in cts_data[txcolid]

    # Assert that Taxon3's annotation carried over to the sample plot.
    for txid in sample_json["datasets"]["rankratioviz_feature_col_ids"]:
        if txid.startswith("Taxon3"):
            for fm in relevant_feature_metadata:
                assert fm in txid
