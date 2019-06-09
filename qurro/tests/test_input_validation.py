from io import StringIO
import pytest
from pandas import DataFrame
from pandas.testing import assert_frame_equal
from qurro.generate import ensure_df_headers_unique, validate_df
from qurro._rank_utils import differentials_to_df


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


def test_differentials_to_df():
    """Tests _rank_utils.differentials_to_df()."""

    good_diff = StringIO(
        "\tIntercept\tRank 1\nTaxon1\t1.0\t2.0\nTaxon2\t3.0\t4.0"
    )
    good_diff_df_exp = DataFrame(
        {"Intercept": [1.0, 3.0], "Rank 1": [2.0, 4.0]},
        index=["Taxon1", "Taxon2"],
    )
    assert_frame_equal(good_diff_df_exp, differentials_to_df(good_diff))

    missing_val_diff = StringIO(
        "\tIntercept\tRank 1\nTaxon1\t2.0\nTaxon2\t3.0\t4.0"
    )
    with pytest.raises(ValueError):
        differentials_to_df(missing_val_diff)

    non_numeric_val_diff = StringIO(
        "\tIntercept\tRank 1\nTaxon1\t'1.0'\t2.0\nTaxon2\t3.0\t4.0"
    )
    with pytest.raises(ValueError):
        differentials_to_df(non_numeric_val_diff)
