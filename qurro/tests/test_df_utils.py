import pytest
import biom
from pandas import DataFrame
from pandas.testing import assert_frame_equal
from numpy.testing import assert_array_equal
import numpy as np
from qurro._df_utils import (
    matchdf,
    ensure_df_headers_unique,
    validate_df,
    replace_nan,
    remove_empty,
)


def test_matchdf():
    """Tests the matchdf() function."""

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
    """Returns test data for the remove_empty() tests."""
    feature_ids = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"]
    sample_ids = ["Sample1", "Sample2", "Sample3", "Sample4"]
    table_data = np.array(
        [
            [1, 2, 3, 4, 5, 6, 7, 8],
            [8, 7, 6, 5, 4, 3, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0],
        ]
    ).T
    return table_data, feature_ids, sample_ids


def test_remove_empty_basic():
    """Tests remove_empty() in the simple cases of removing 0, 1, and 2
       empty sample(s).
    """

    # TRY REMOVING 0 SAMPLES
    data, fids, sids = get_test_data()
    table = biom.Table(data, fids, sids)
    # Check that, when none of the samples are empty, nothing is changed.
    ftable = remove_empty(table).to_dataframe()
    assert_frame_equal(ftable, table.to_dataframe())

    # TRY REMOVING 1 SAMPLE
    # Zero out Sample3 (it only has one count, for F1)
    data[0][2] = 0
    table = biom.Table(data, fids, sids)
    # Check that just the one empty sample (Sample3) was removed.
    ftable = remove_empty(table).to_dataframe()
    assert_array_equal(ftable["Sample1"], data[:, 0])
    assert_array_equal(ftable["Sample2"], data[:, 1])
    assert_array_equal(ftable["Sample4"], data[:, 3])
    assert "Sample3" not in ftable.columns
    assert len(ftable.columns) == 3
    assert len(ftable.index) == len(fids) == 8

    # TRY REMOVING 2 SAMPLES
    # Now, zero out Sample4 (it only has one count in F4)
    data[3][3] = 0
    table = biom.Table(data, fids, sids)
    ftable = remove_empty(table).to_dataframe()
    assert_array_equal(ftable["Sample1"], data[:, 0])
    assert_array_equal(ftable["Sample2"], data[:, 1])
    assert "Sample3" not in ftable.columns
    assert "Sample4" not in ftable.columns
    assert len(ftable.columns) == 2
    assert len(ftable.index) == len(fids) == 8


def test_remove_empty_allempty():
    """Tests remove_empty() when all samples in the table are empty."""

    _, feature_ids, sample_ids = get_test_data()
    table = biom.Table(np.zeros(32).reshape(8, 4), feature_ids, sample_ids)
    with pytest.raises(ValueError):
        remove_empty(table)
