import pytest
from pandas import DataFrame
from pandas.testing import assert_frame_equal, assert_series_equal
import numpy as np
from qurro._df_utils import (
    ensure_df_headers_unique,
    validate_df,
    replace_nan,
    remove_empty_samples_and_features,
    merge_feature_metadata,
    sparsify_count_dict,
    check_column_names,
)


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


def test_validate_df():
    """Tests the validate_df() function in generate.py."""

    # Check that the min_row_ct and min_col_ct arguments work properly.
    normal2x2DF = DataFrame({"x": [1, 2], "y": [3, 4]}, index=["a", "b"])
    validate_df(normal2x2DF, "Normal 2x2 DF", 0, 0)
    validate_df(normal2x2DF, "Normal 2x2 DF", 1, 1)
    validate_df(normal2x2DF, "Normal 2x2 DF", 2, 2)
    with pytest.raises(ValueError):
        validate_df(normal2x2DF, "Normal 2x2 DF", 2, 3)
    with pytest.raises(ValueError):
        validate_df(normal2x2DF, "Normal 2x2 DF", 2, 4)
    with pytest.raises(ValueError):
        validate_df(normal2x2DF, "Normal 2x2 DF", 3, 2)
    with pytest.raises(ValueError):
        validate_df(normal2x2DF, "Normal 2x2 DF", 4, 2)

    # Test that the ensure_df_headers_unique() call works. We don't go as in
    # depth here as we do above, but we do still want to make sure that it
    # works as expected.

    # This is just df_bad from test_ensure_df_headers_unique().
    nonuniqueRowDF = DataFrame(
        {"col1": [1, 2, 3], "col2": [6, 7, 8]}, index=["a", "b", "a"]
    )
    with pytest.raises(ValueError):
        validate_df(nonuniqueRowDF, "Non-unique-row DF", 3, 2)

    # Check that errors don't "cancel out" (obviously shouldn't be the case,
    # but might as well be safe)
    with pytest.raises(ValueError):
        validate_df(nonuniqueRowDF, "Non-unique-row DF", 3, 3)

    # This is just df_bad4 from test_ensure_df_headers_unique().
    nonuniqueColDF = DataFrame(
        [[1, 6], [2, 7], [3, 8]],
        columns=["col1", "col1"],
        index=["a", "b", "c"],
    )
    with pytest.raises(ValueError):
        validate_df(nonuniqueColDF, "Non-unique-column DF", 3, 2)

    # This is just df_bad5 from test_ensure_df_headers_unique().
    nonuniqueColRowDF = DataFrame(
        [[1, 6], [2, 7], [3, 8]],
        columns=["col1", "col1"],
        index=["a", "b", "a"],
    )
    with pytest.raises(ValueError):
        validate_df(nonuniqueColRowDF, "Non-unique-column-and-row DF", 3, 2)


def test_replace_nan():
    """Tests replace_nan()."""

    # Basic case: other data are ints
    df = DataFrame({"x": [1, np.NaN], "y": [3, 4]}, index=["a", "b"])
    dfC = DataFrame({"x": [1, None], "y": [3, 4]}, index=["a", "b"])
    assert_frame_equal(dfC, replace_nan(df), check_dtype=False)

    # Other data are strs
    df2 = DataFrame(
        {"x": ["abc", np.NaN], "y": ["ghi", "jkl"]}, index=["a", "b"]
    )
    dfC2 = DataFrame(
        {"x": ["abc", None], "y": ["ghi", "jkl"]}, index=["a", "b"]
    )
    assert_frame_equal(dfC2, replace_nan(df2), check_dtype=False)

    # Entire Series of NaNs
    df3 = DataFrame(
        {"x": [np.NaN, np.NaN], "y": ["ghi", "jkl"]}, index=["a", "b"]
    )
    dfC3 = DataFrame(
        {"x": [None, None], "y": ["ghi", "jkl"]}, index=["a", "b"]
    )
    assert_frame_equal(dfC3, replace_nan(df3), check_dtype=False)

    # Entire DataFrame of NaNs
    df4 = DataFrame(
        {"x": [np.NaN, np.NaN], "y": [np.NaN, np.NaN]}, index=["a", "b"]
    )
    dfC4 = DataFrame({"x": [None, None], "y": [None, None]}, index=["a", "b"])
    assert_frame_equal(dfC4, replace_nan(df4), check_dtype=False)

    # If there are already Nones inside the DF for some reason (should never be
    # the case, but might as well be safe and check this)
    df5 = DataFrame(
        {"x": [np.NaN, None], "y": [np.NaN, np.NaN]}, index=["a", "b"]
    )
    dfC5 = DataFrame({"x": [None, None], "y": [None, None]}, index=["a", "b"])
    assert_frame_equal(dfC5, replace_nan(df5), check_dtype=False)

    # Case where the user specifies an alternate value to replace NaNs with
    df6 = DataFrame(
        {"x": [np.NaN, 3], "y": [np.NaN, np.NaN]}, index=["a", "b"]
    )
    dfC6 = DataFrame({"x": ["lol", 3], "y": ["lol", "lol"]}, index=["a", "b"])
    assert_frame_equal(dfC6, replace_nan(df6, "lol"), check_dtype=False)


def get_test_data():
    """Returns test table, metadata, and ranks DataFrames.

       Mostly based on/copied from get_test_data() in
       test_filter_unextreme_features.
    """
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
    ranks = DataFrame(
        {
            "Rank 0": [1, 2, 3, 4, 5, 6, 7, 8],
            "Rank 1": [8, 7, 6, 5, 4, 3, 2, 1],
        },
        index=list(table.index)[:],
    )
    return table, metadata, ranks


def test_remove_empty_samples_and_features_samples():
    """Tests remove_empty_samples_and_features() in the simple cases of
       removing 0, 1, and 2 empty sample(s).
    """

    # TRY REMOVING 0 SAMPLES
    table, metadata, ranks = get_test_data()
    # Check that, when none of the samples are empty, nothing is changed.
    ftable, fmetadata, franks = remove_empty_samples_and_features(
        table, metadata, ranks
    )
    assert_frame_equal(ftable, table)
    assert_frame_equal(fmetadata, metadata)
    assert_frame_equal(franks, ranks)

    # TRY REMOVING 1 SAMPLE
    # Zero out Sample3 (it only has one count, for F1)
    table["Sample3"]["F1"] = 0
    # Check that just the one empty sample (Sample3) was removed, from both the
    # table and the sample metadata.
    ftable, fmetadata, franks = remove_empty_samples_and_features(
        table, metadata, ranks
    )
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

    assert_frame_equal(franks, ranks)

    # TRY REMOVING 2 SAMPLES
    # Now, zero out Sample4 (it only has one count in F4)
    table["Sample4"]["F4"] = 0
    ftable, fmetadata, franks = remove_empty_samples_and_features(
        table, metadata, ranks
    )
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

    assert_frame_equal(franks, ranks)


def test_remove_empty_samples_and_features_features():
    """Tests remove_empty_samples_and_features() in the simple cases of
       removing 1 and then 2 empty feature(s).
    """

    table, metadata, ranks = get_test_data()
    # Zero out F8
    table.loc["F8"] = 0
    ftable, fmetadata, franks = remove_empty_samples_and_features(
        table, metadata, ranks
    )
    assert_frame_equal(fmetadata, metadata)
    # Check that F8 was removed from the table and ranks

    def check(new, old):
        assert_frame_equal(new.iloc[0:7], old.iloc[0:7])
        assert "F8" not in new.index
        assert len(new.index) == 7

    check(ftable, table)
    check(franks, ranks)

    # Zero out F6, also
    table.loc["F6"] = 0
    ftable, fmetadata, franks = remove_empty_samples_and_features(
        table, metadata, ranks
    )
    assert_frame_equal(fmetadata, metadata)
    # Check that F1 through F5 (and F7) are still the same

    def check2(new, old):
        assert_frame_equal(new.iloc[0:5], old.iloc[0:5])
        assert_series_equal(new.loc["F7"], old.loc["F7"])
        assert "F6" not in new.index
        assert len(new.index) == 6

    check2(ftable, table)
    check2(franks, ranks)


def test_remove_empty_samples_and_features_both():
    """Tests remove_empty_samples_and_features() when both samples and features
       are empty.
    """

    table, metadata, ranks = get_test_data()
    # Zero out F8 and F7
    table.loc["F8"] = 0
    table.loc["F7"] = 0
    # Zero out Sample2 and Sample4
    table["Sample2"] = 0
    table["Sample4"] = 0
    ftable, fmetadata, franks = remove_empty_samples_and_features(
        table, metadata, ranks
    )

    assert "F8" not in ftable.index
    assert "F7" not in ftable.index
    assert "F8" not in franks.index
    assert "F7" not in franks.index
    assert "Sample2" not in ftable.columns
    assert "Sample4" not in ftable.columns
    assert "Sample2" not in fmetadata.index
    assert "Sample4" not in fmetadata.index
    assert_frame_equal(
        ftable, table[["Sample1", "Sample3"]].iloc[0:6], check_like=True
    )
    assert_frame_equal(
        fmetadata, metadata.loc[set(["Sample1", "Sample3"])], check_like=True
    )
    assert_frame_equal(franks, ranks.iloc[0:6])


def test_remove_empty_samples_and_features_allempty():
    """Tests remove_empty_samples_and_features() on an empty table."""

    table, metadata, ranks = get_test_data()
    table["Sample1"] = np.zeros(len(table.index))
    table["Sample2"] = np.zeros(len(table.index))
    table["Sample3"] = np.zeros(len(table.index))
    table["Sample4"] = np.zeros(len(table.index))
    with pytest.raises(ValueError):
        remove_empty_samples_and_features(table, metadata, ranks)


def test_merge_feature_metadata():

    ranks = DataFrame({"R1": [1, 2], "R2": [2, 1]}, index=["F1", "F2"])
    fm = DataFrame(
        {"FM1": [None, None], "FM2": [1, 2], "FM3": [8, 7]}, index=["F1", "F2"]
    )
    # When feature metadata is None, the ranks DF should stay the same.
    result = merge_feature_metadata(ranks, None)
    assert_frame_equal(ranks, result[0])
    assert result[1] == []

    # Check that this works properly in the normal case
    expected = ranks.copy()
    expected["FM1"] = [None, None]
    expected["FM2"] = [1, 2]
    expected["FM3"] = [8, 7]
    result = merge_feature_metadata(ranks, fm)
    assert_frame_equal(expected, result[0], check_dtype=False)
    assert (result[1] == ["FM1", "FM2", "FM3"]).all()

    # Check that this works properly when not all features match up exactly
    # (F3 isn't in ranks, and F2 isn't in fm. So F2 should just have None for
    # all feature metadata fields.)
    fm.index = ["F1", "F3"]
    expected = ranks.copy()
    expected["FM1"] = [None, None]
    expected["FM2"] = [1, None]
    expected["FM3"] = [8, None]
    result = merge_feature_metadata(ranks, fm)
    assert_frame_equal(expected, result[0], check_dtype=False)
    assert (result[1] == ["FM1", "FM2", "FM3"]).all()

    # Check that this works properly when no features match up exactly
    fm.index = ["F3", "F4"]
    expected = ranks.copy()
    expected["FM1"] = [None, None]
    expected["FM2"] = [None, None]
    expected["FM3"] = [None, None]
    result = merge_feature_metadata(ranks, fm)
    assert_frame_equal(expected, result[0], check_dtype=False)
    assert (result[1] == ["FM1", "FM2", "FM3"]).all()

    # Check that this raises an error if feature metadata and ranking columns
    # are not distinct (shouldn't happen if check_column_names() used, but
    # might as well be careful)
    fm.columns = ["FM1", "R2", "FM3"]
    with pytest.raises(ValueError):
        merge_feature_metadata(ranks, fm)


def test_sparsify_count_dict():

    # Test that it works in basic case
    test_cts = {
        "Feature 1": {"Sample 1": 0, "Sample 2": 3, "Sample 3": 0},
        "Feature 2": {"Sample 1": 2, "Sample 2": 4, "Sample 3": 0},
    }
    assert sparsify_count_dict(test_cts) == {
        "Feature 1": {"Sample 2": 3},
        "Feature 2": {"Sample 1": 2, "Sample 2": 4},
    }

    # Test that it works even when the data is inherently dense (i.e. no zeros)
    test_cts = {
        "Feature 1": {"Sample 1": 1, "Sample 2": 3, "Sample 3": 5},
        "Feature 2": {"Sample 1": 2, "Sample 2": 4, "Sample 3": 6},
    }
    assert sparsify_count_dict(test_cts) == test_cts

    # Test that it works even when the data is totally sparse
    # This should never happen, since we filter out empty features, but good to
    # be sure
    test_cts = {
        "Feature 1": {"Sample 1": 0, "Sample 2": 0, "Sample 3": 0},
        "Feature 2": {"Sample 1": 0, "Sample 2": 0, "Sample 3": 0},
    }
    assert sparsify_count_dict(test_cts) == {"Feature 1": {}, "Feature 2": {}}


def test_check_column_names():

    _, sm, fr = get_test_data()
    fm = fr.copy()
    fm.columns = ["FM1", "FM2"]

    # Shouldn't get an error with default col names
    check_column_names(sm, fr, fm)

    # 1. Check for problematic names in sample metadata columns ("Sample ID",
    # "qurro_balance")

    sm.columns = ["Metadata1", "Sample ID", "Metadata3", "Metadata4"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert '"Sample ID"' in str(exception_info.value)

    # Shouldn't get an error with different case
    sm.columns = ["Metadata1", "sample id", "Metadata3", "Metadata4"]
    check_column_names(sm, fr, fm)

    sm.columns = ["qurro_balance", "Sample ID", "Metadata3", "Metadata4"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    # Sample ID check has priority in error msg
    assert '"Sample ID"' in str(exception_info.value)

    sm.columns = ["qurro_balance", "Metadata2", "Metadata3", "Metadata4"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert '"qurro_balance"' in str(exception_info.value)

    # reset sample metadata columns to be sane
    sm.columns = ["Metadata1", "Metadata2", "Metadata3", "Metadata4"]

    # 2. Check for problematic names in feature ranking columns ("Feature ID",
    # "qurro_classification")

    fr.columns = ["R1", "Feature ID"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert '"Feature ID"' in str(exception_info.value)

    # If *both* problematic names are present, the ID one takes precedence
    # (just because its "if" statement is higher up in the function)
    # (also this is an arbitrary choice and doesn't really matter that much in
    # the grand scheme of things but I figure we might as well test this case)
    # (also if you somehow have both of these column names in a real dataset
    # then I have a lot of questions)
    fr.columns = ["Feature ID", "qurro_classification"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert '"Feature ID"' in str(exception_info.value)

    fr.columns = ["R1", "qurro_classification"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert '"qurro_classification"' in str(exception_info.value)

    # reset feature ranking columns to be sane
    fr.columns = ["R1", "R2"]

    # 3. Check for problematic names in feature metadata columns ("Feature ID",
    # "qurro_classification")
    # This is essentially the same stuff as the feature ranking test above.

    fm.columns = ["FM1", "Feature ID"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert '"Feature ID"' in str(exception_info.value)

    fm.columns = ["Feature ID", "qurro_classification"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert '"Feature ID"' in str(exception_info.value)

    fm.columns = ["FM1", "qurro_classification"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert '"qurro_classification"' in str(exception_info.value)

    # reset feature metadata columns to be sane
    fm.columns = ["FM1", "FM2"]

    # 4. Check for the case where the feature ranking and feature metadata
    # columns are not distinct
    fr.columns = ["FM1", "R2"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert "must be distinct" in str(exception_info.value)

    fr.columns = ["FM1", "FM2"]
    with pytest.raises(ValueError) as exception_info:
        check_column_names(sm, fr, fm)
    assert "must be distinct" in str(exception_info.value)
