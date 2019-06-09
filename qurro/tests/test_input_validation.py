from pandas import DataFrame
from qurro.generate import ensure_df_headers_unique

# import pytest


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
